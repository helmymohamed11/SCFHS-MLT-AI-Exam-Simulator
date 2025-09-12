import React, { useState, useEffect } from 'react';
import * as supabaseService from '../services/supabaseService';
import questionsData from '../../mock-exam-database.json';
import { Question, Difficulty, Domain } from '../types';

const AdminDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const allQuestions = await supabaseService.getQuestions();
        setQuestions(allQuestions);
      } catch (e) {
        console.error("Could not load question bank:", e);
        setMessage("Could not load question bank.");
      }
    };
    fetchQuestions();
  }, []);

  const seedDatabase = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const existingQuestions = await supabaseService.getQuestions();
      const existingQuestionIds = new Set(existingQuestions.map(q => q.id));

      const newQuestions = questionsData.filter(q => !existingQuestionIds.has(q.id));

      if (newQuestions.length === 0) {
        setMessage('Database is already up to date.');
        setIsLoading(false);
        return;
      }

      let seededCount = 0;
      for (const q of newQuestions) {
        let difficulty: Difficulty;
        switch (q.difficulty.toLowerCase()) {
          case 'easy':
            difficulty = Difficulty.Easy;
            break;
          case 'medium':
            difficulty = Difficulty.Medium;
            break;
          case 'hard':
            difficulty = Difficulty.Hard;
            break;
          default:
            difficulty = Difficulty.Medium;
        }

        const questionToAdd: Omit<Question, 'id'> = {
          stem: q.stem,
          options: q.options,
          correct_index: q.correct_index,
          explanation: q.explanation,
          domain: q.domain as Domain,
          subtopic: q.subtopic,
          difficulty: difficulty,
          tags: q.tags,
          refs: q.refs,
        };
        await supabaseService.addQuestion(questionToAdd, '');
        seededCount++;
      }
      const allQuestions = await supabaseService.getQuestions();
      setQuestions(allQuestions);
      setMessage(`Successfully seeded ${seededCount} new questions.`);
    } catch (error) {
      console.error('Error seeding database:', error);
      setMessage(`Error seeding database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await supabaseService.deleteQuestion(questionId);
        setQuestions(questions.filter(q => q.id !== questionId));
        setMessage('Question deleted successfully.');
      } catch (error) {
        console.error('Error deleting question:', error);
        setMessage('Error deleting question.');
      }
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
  };

  const handleUpdateQuestion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingQuestion) return;

    try {
      await supabaseService.updateQuestion(editingQuestion.id, editingQuestion);
      setQuestions(questions.map(q => q.id === editingQuestion.id ? editingQuestion : q));
      setEditingQuestion(null);
      setMessage('Question updated successfully.');
    } catch (error) {
      console.error('Error updating question:', error);
      setMessage('Error updating question.');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editingQuestion) return;
    const { name, value } = event.target;
    setEditingQuestion({ ...editingQuestion, [name]: value });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {message && <p className="mb-4 text-sm">{message}</p>}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Database Management</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Seed the database with questions from the mock exam JSON file.
        </p>
        <button
          onClick={seedDatabase}
          disabled={isLoading}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md disabled:bg-slate-400"
        >
          {isLoading ? 'Seeding...' : 'Seed Database'}
        </button>
      </div>

      {editingQuestion && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-2">Edit Question</h2>
          <form onSubmit={handleUpdateQuestion}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Stem</label>
              <textarea
                name="stem"
                value={editingQuestion.stem}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              />
            </div>
            {/* Add other fields as needed */}
            <div className="flex justify-end">
              <button type="button" onClick={() => setEditingQuestion(null)} className="px-4 py-2 mr-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-md">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md">
                Update
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Manage Questions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Stem</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Domain</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {questions.map(question => (
                <tr key={question.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{question.stem}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{question.domain}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleEditQuestion(question)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                    <button onClick={() => handleDeleteQuestion(question.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
