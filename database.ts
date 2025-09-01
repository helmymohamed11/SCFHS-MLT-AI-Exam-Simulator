import { Question } from '../types';

let cachedQuestions: Question[] | null = null;

/**
 * Fetches the shared question bank from a static JSON file.
 * Caches the result in memory to avoid repeated network requests.
 */
export const getBankQuestions = async (): Promise<Question[]> => {
  if (cachedQuestions) {
    return cachedQuestions;
  }
  try {
    // Assumes mock-exam-database.json is in the public/root directory
    const response = await fetch('/mock-exam-database.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const questions: Question[] = await response.json();
    
    // Add a unique ID to each question, simulating a database ID, which is useful for React keys.
    const questionsWithIds = questions.map((q, index) => ({ ...q, id: index + 1 }));
    
    cachedQuestions = questionsWithIds;
    return questionsWithIds;
    
  } catch (error) {
    console.error("Could not load mock exam database:", error);
    // In case of error (e.g., 404), return an empty array to prevent app crash
    return [];
  }
};
