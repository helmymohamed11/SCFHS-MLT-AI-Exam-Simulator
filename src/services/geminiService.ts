import { GoogleGenerativeAI } from '@google/genai';
import { Question, Domain, Difficulty, Language, EXAM_SPEC } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('Gemini API key not found. Question generation will not work.');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export const generateQuestion = async (
  domain: Domain,
  subtopic: string,
  difficulty: Difficulty,
  language: Language
): Promise<Question> => {
  if (!genAI) {
    throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your environment.');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Generate a high-quality multiple choice question for the SCFHS MLT exam.

Domain: ${domain}
Subtopic: ${subtopic}
Difficulty: ${difficulty}
Language: ${language}

Requirements:
- Create a clear, unambiguous question stem
- Provide 4 options (A, B, C, D) with only one correct answer
- Include 3 plausible distractors
- Provide a detailed explanation for the correct answer
- Use realistic laboratory values and scenarios
- Ensure the question tests practical knowledge relevant to MLT practice

Return the response as a JSON object with this exact structure:
{
  "stem": "question text",
  "options": ["option A", "option B", "option C", "option D"],
  "correct_index": 0,
  "explanation": "detailed explanation",
  "domain": "${domain}",
  "subtopic": "${subtopic}",
  "difficulty": "${difficulty}",
  "tags": ["tag1", "tag2"],
  "refs": ["reference1", "reference2"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }
    
    const questionData = JSON.parse(jsonMatch[0]);
    
    // Validate the response structure
    if (!questionData.stem || !Array.isArray(questionData.options) || 
        questionData.options.length !== 4 || 
        typeof questionData.correct_index !== 'number' ||
        questionData.correct_index < 0 || questionData.correct_index > 3) {
      throw new Error('Invalid question structure from AI');
    }
    
    return {
      stem: questionData.stem,
      options: questionData.options,
      correct_index: questionData.correct_index,
      explanation: questionData.explanation || 'No explanation provided',
      domain,
      subtopic,
      difficulty,
      tags: questionData.tags || [],
      refs: questionData.refs || [],
    };
  } catch (error) {
    console.error('Error generating question:', error);
    throw new Error('Failed to generate question. Please try again.');
  }
};

export const generateFullExam = async (
  onProgress?: (progress: { generated: number; total: number; domain: string }) => void
): Promise<Question[]> => {
  if (!genAI) {
    throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your environment.');
  }

  const questions: Question[] = [];
  const domains = Object.keys(EXAM_SPEC.weights) as Domain[];
  
  // Calculate questions per domain based on weights
  const questionsPerDomain: Record<Domain, number> = {} as Record<Domain, number>;
  domains.forEach(domain => {
    const weight = EXAM_SPEC.weights[domain];
    questionsPerDomain[domain] = Math.round(weight * EXAM_SPEC.totalQuestions);
  });

  // Adjust for rounding errors
  const totalAllocated = Object.values(questionsPerDomain).reduce((sum, count) => sum + count, 0);
  if (totalAllocated !== EXAM_SPEC.totalQuestions) {
    const diff = EXAM_SPEC.totalQuestions - totalAllocated;
    const firstDomain = domains[0];
    questionsPerDomain[firstDomain] += diff;
  }

  let generatedCount = 0;

  for (const domain of domains) {
    const questionCount = questionsPerDomain[domain];
    if (questionCount === 0) continue;

    onProgress?.({ 
      generated: generatedCount, 
      total: EXAM_SPEC.totalQuestions, 
      domain 
    });

    // Get subtopics for this domain
    const { SUBTOPICS_MAP } = await import('../types');
    const subtopics = SUBTOPICS_MAP[domain] || ['General'];
    
    // Distribute questions across subtopics
    const questionsPerSubtopic = Math.ceil(questionCount / subtopics.length);
    
    for (let i = 0; i < questionCount; i++) {
      const subtopic = subtopics[i % subtopics.length];
      
      // Vary difficulty: 40% Easy, 45% Medium, 15% Hard
      let difficulty: Difficulty;
      const rand = Math.random();
      if (rand < 0.4) difficulty = Difficulty.Easy;
      else if (rand < 0.85) difficulty = Difficulty.Medium;
      else difficulty = Difficulty.Hard;

      try {
        const question = await generateQuestion(domain, subtopic, difficulty, Language.English);
        questions.push(question);
        generatedCount++;
        
        onProgress?.({ 
          generated: generatedCount, 
          total: EXAM_SPEC.totalQuestions, 
          domain 
        });
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to generate question for ${domain}/${subtopic}:`, error);
        // Continue with next question instead of failing the entire exam
      }
    }
  }

  if (questions.length === 0) {
    throw new Error('Failed to generate any questions. Please check your API key and try again.');
  }

  return questions;
};