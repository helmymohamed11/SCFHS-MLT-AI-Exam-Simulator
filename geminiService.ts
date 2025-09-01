import { GoogleGenAI, Type } from "@google/genai";
import { Question, Difficulty, Language, Domain, DOMAINS, EXAM_SPEC, SUBTOPICS_MAP } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        stem: { type: Type.STRING, description: 'The text of the multiple-choice question (the "stem").' },
        options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'An array of four plausible answers, one of which is correct.'
        },
        correct_index: {
            type: Type.INTEGER,
            description: 'The 0-based index of the correct answer in the options array.'
        },
        explanation: {
            type: Type.STRING,
            description: 'A brief explanation of why the correct answer is right and the others are wrong.'
        },
        domain: { type: Type.STRING, description: 'The general domain of the question, e.g., Hematology.' },
        subtopic: { type: Type.STRING, description: 'The specific subtopic of the question, e.g., Coagulation.' },
        difficulty: { type: Type.STRING, description: 'The difficulty of the question: "Easy", "Medium", or "Hard".' },
        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'An array of relevant keywords or tags.' },
        refs: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'An array of references or sources for the question.' },
    },
    required: ['stem', 'options', 'correct_index', 'explanation', 'domain', 'subtopic', 'difficulty', 'tags', 'refs']
};


export const getSubtopicsForDomain = (domain: Domain): string[] => {
    return SUBTOPICS_MAP[domain] || [];
};


const validateQuestion = (parsedJson: any): boolean => {
     return (
        typeof parsedJson.stem === 'string' &&
        Array.isArray(parsedJson.options) &&
        parsedJson.options.length > 2 && // allow more than 4 for variety
        parsedJson.options.every((opt: any) => typeof opt === 'string') &&
        typeof parsedJson.correct_index === 'number' &&
        parsedJson.correct_index >= 0 && parsedJson.correct_index < parsedJson.options.length &&
        typeof parsedJson.explanation === 'string' &&
        typeof parsedJson.domain === 'string' &&
        DOMAINS.includes(parsedJson.domain as Domain) &&
        typeof parsedJson.subtopic === 'string' &&
        typeof parsedJson.difficulty === 'string' &&
        Object.values(Difficulty).includes(parsedJson.difficulty as Difficulty) &&
        Array.isArray(parsedJson.tags) &&
        parsedJson.tags.every((tag: any) => typeof tag === 'string') &&
        Array.isArray(parsedJson.refs) &&
        parsedJson.refs.every((ref: any) => typeof ref === 'string')
    );
}

export const generateQuestion = async (domain: Domain, subtopic: string, difficulty: Difficulty, language: Language): Promise<Question> => {
    const prompt = `
        System: You are an expert question writer for the Saudi Commission for Health Specialties (SCFHS) Medical Laboratory Technology (MLT) exam. Your task is to generate a single, high-quality, multiple-choice question (MCQ) based on modern question writing guidelines.

        User:
        Please generate one MCQ with the following specifications:
        - Domain: "${domain}"
        - Subtopic: "${subtopic}"
        - Difficulty: "${difficulty}"
        - Language: "${language}"

        Constraints:
        - The question (stem) must be clear and unambiguous.
        - Provide exactly one correct answer and three plausible, incorrect distractors.
        - The explanation should clarify why the correct answer is correct and why the distractors are incorrect.
        - Ensure all information is accurate and up-to-date according to recent guidelines in the field.
        - The entire response, including all JSON fields, must be in the specified language.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.8,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        if (!validateQuestion(parsedJson)) {
            console.error("Malformed data from AI:", parsedJson);
            throw new Error("Received malformed or incomplete data from the AI. Please try again.");
        }
        
        return parsedJson as Question;

    } catch (error) {
        console.error("Error generating question:", error);
        if (error instanceof Error && error.message.includes('RESOURCE_EXHAUSTED')) {
             throw new Error("API rate limit exceeded. Please wait a moment and try again.");
        }
        throw new Error("Failed to generate question. The AI may be experiencing issues or the request was blocked. Please try again.");
    }
};

async function processInBatches<T, R>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batchItems = items.slice(i, i + batchSize);
    const batchPromises = batchItems.map(processor);
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  return results;
}

export const generateFullExam = async (onProgress: (progress: { generated: number, total: number, domain: string }) => void): Promise<Question[]> => {
    let generatedCount = 0;
    const totalQuestions = EXAM_SPEC.totalQuestions;
    
    const questionSpecs: { domain: Domain; difficulty: Difficulty }[] = [];

    for (const domain of DOMAINS) {
        const domainWeight = EXAM_SPEC.weights[domain as Domain];
        if (domainWeight === 0) continue;

        const numQuestionsForDomain = Math.round(totalQuestions * domainWeight);

        for (let i = 0; i < numQuestionsForDomain; i++) {
            const difficulty = Math.random() < 0.4 ? Difficulty.Easy : Math.random() < 0.85 ? Difficulty.Medium : Difficulty.Hard;
            questionSpecs.push({ domain, difficulty });
        }
    }
    
    const BATCH_SIZE = 5; // Process 5 requests concurrently to stay within rate limits

    const allGeneratedQuestions = await processInBatches(questionSpecs, BATCH_SIZE, async (spec) => {
        const { domain, difficulty } = spec;
        const prompt = `
            System: You are an expert question writer for the Saudi Commission for Health Specialties (SCFHS) MLT exam.
            User: Generate one MCQ.
            - Domain: "${domain}"
            - Subtopic: any relevant subtopic
            - Difficulty: "${difficulty}"
            - Language: "English"
            Constraints: Create a unique question, not a generic one. Ensure it's clinically relevant. The entire response, including all JSON fields, must be in English.
        `;
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                    temperature: 1.0,
                },
            });
            const jsonText = response.text.trim();
            const parsedJson = JSON.parse(jsonText);
            if (validateQuestion(parsedJson)) {
                return parsedJson as Question;
            }
            return null;
        } catch (e) {
            console.error(`Failed to generate a question for ${domain}:`, e);
            return null; // Return null on error
        } finally {
            // This is not perfectly atomic but gives good UI feedback
            generatedCount++;
            onProgress({ generated: generatedCount, total: totalQuestions, domain });
        }
    });

    const validQuestions = allGeneratedQuestions.filter((q): q is Question => q !== null);

    if (validQuestions.length < totalQuestions * 0.8) { // Check if we have at least 80% of desired questions
        throw new Error(`Failed to generate enough questions due to API errors (rate limits may have been exceeded). Only got ${validQuestions.length}. Please try again later.`);
    }

    return validQuestions;
};