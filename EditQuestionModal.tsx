import React, { useState, useEffect } from 'react';
import { Question } from '../types';

interface EditQuestionModalProps {
  question: Question;
  onSave: (updatedQuestion: Question) => void;
  onClose: () => void;
}

const EditQuestionModal: React.FC<EditQuestionModalProps> = ({ question, onSave, onClose }) => {
  const [stem, setStem] = useState(question.stem);
  const [options, setOptions] = useState([...question.options]);
  const [correctIndex, setCorrectIndex] = useState(question.correct_index);
  const [explanation, setExplanation] = useState(question.explanation);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedQuestion: Question = {
      ...question,
      stem,
      options,
      correct_index: correctIndex,
      explanation,
    };
    onSave(updatedQuestion);
  };

  return (
    <div 
        className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 animate-fade-in"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSave}>
            <div className="p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Edit Question</h2>
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="stem" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Question Stem
                        </label>
                        <textarea
                            id="stem"
                            value={stem}
                            onChange={(e) => setStem(e.target.value)}
                            rows={4}
                            className="block w-full text-base bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
                            required
                        />
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Options
                        </label>
                        <div className="space-y-2">
                        {options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="correct_option"
                                    checked={correctIndex === index}
                                    onChange={() => setCorrectIndex(index)}
                                    className="focus:ring-sky-500 h-4 w-4 text-sky-600 border-slate-300"
                                />
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    className="block w-full text-base bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
                                    required
                                />
                            </div>
                        ))}
                        </div>
                         <p className="text-xs text-slate-500 mt-1">Select the radio button for the correct answer.</p>
                    </div>

                    <div>
                        <label htmlFor="explanation" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Explanation
                        </label>
                        <textarea
                            id="explanation"
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            rows={4}
                            className="block w-full text-base bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
                            required
                        />
                    </div>
                </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                >
                    Save Changes
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuestionModal;
