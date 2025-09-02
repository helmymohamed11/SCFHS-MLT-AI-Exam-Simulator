import React, { useState } from 'react';
import { Question } from '../types';
import { BookOpen, Plus, X } from 'lucide-react';

interface FlashcardCreatorProps {
  incorrectQuestions: Question[];
  onClose: () => void;
  onCreateFlashcards: (flashcards: Flashcard[]) => void;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint: string;
  domain: string;
  subtopic: string;
  difficulty: number;
  interval: number;
  ease: number;
  dueAt: Date;
}

const FlashcardCreator: React.FC<FlashcardCreatorProps> = ({
  incorrectQuestions,
  onClose,
  onCreateFlashcards,
}) => {
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(
    new Set(incorrectQuestions.map(q => q.id?.toString() || ''))
  );

  const handleToggleQuestion = (questionId: string) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  const handleCreateFlashcards = () => {
    const flashcards: Flashcard[] = incorrectQuestions
      .filter(q => selectedQuestions.has(q.id?.toString() || ''))
      .map(q => ({
        id: `fc-${q.id}`,
        question: q.stem,
        answer: q.options[q.correct_index],
        hint: q.explanation.substring(0, 100) + '...',
        domain: q.domain,
        subtopic: q.subtopic,
        difficulty: q.difficulty === 'Easy' ? 1 : q.difficulty === 'Medium' ? 2 : 3,
        interval: 1, // Start with 1 day
        ease: 2.5, // Default ease factor
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due tomorrow
      }));

    onCreateFlashcards(flashcards);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center">
            <BookOpen className="h-6 w-6 text-sky-600 mr-2" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Create Flashcards
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Select the questions you want to convert into flashcards for spaced repetition study.
          </p>

          <div className="space-y-4">
            {incorrectQuestions.map((question, index) => (
              <div
                key={question.id || index}
                className={`border rounded-lg p-4 transition-all cursor-pointer ${
                  selectedQuestions.has(question.id?.toString() || '')
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
                onClick={() => handleToggleQuestion(question.id?.toString() || '')}
              >
                <div className="flex items-start">
                  <div className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 flex items-center justify-center ${
                    selectedQuestions.has(question.id?.toString() || '')
                      ? 'border-sky-500 bg-sky-500'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {selectedQuestions.has(question.id?.toString() || '') && (
                      <Plus className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs">
                        {question.domain}
                      </span>
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs">
                        {question.subtopic}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                      {question.stem.substring(0, 150)}...
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Correct: {question.options[question.correct_index]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {selectedQuestions.size} of {incorrectQuestions.length} questions selected
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateFlashcards}
              disabled={selectedQuestions.size === 0}
              className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create {selectedQuestions.size} Flashcards
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardCreator;