import React from 'react';
import { Domain, Difficulty, Language, SUBTOPICS_MAP } from '../types';

interface QuestionGeneratorFormProps {
  domain: Domain;
  setDomain: (domain: Domain) => void;
  subtopic: string;
  setSubtopic: (subtopic: string) => void;
  difficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const QuestionGeneratorForm: React.FC<QuestionGeneratorFormProps> = ({
  domain,
  setDomain,
  subtopic,
  setSubtopic,
  difficulty,
  setDifficulty,
  language,
  setLanguage,
  onSubmit,
  isLoading,
}) => {
  const handleDomainChange = (newDomain: Domain) => {
    setDomain(newDomain);
    // Reset subtopic when domain changes
    const subtopics = SUBTOPICS_MAP[newDomain];
    if (subtopics && subtopics.length > 0) {
      setSubtopic(subtopics[0]);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
        Generate Question
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Domain
          </label>
          <select
            value={domain}
            onChange={(e) => handleDomainChange(e.target.value as Domain)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
          >
            {Object.keys(SUBTOPICS_MAP).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Subtopic
          </label>
          <select
            value={subtopic}
            onChange={(e) => setSubtopic(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
          >
            {SUBTOPICS_MAP[domain]?.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
          >
            <option value={Difficulty.Easy}>Easy</option>
            <option value={Difficulty.Medium}>Medium</option>
            <option value={Difficulty.Hard}>Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
          >
            <option value={Language.English}>English</option>
            <option value={Language.Arabic}>Arabic</option>
          </select>
        </div>

        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating...' : 'Generate Question'}
        </button>
      </div>
    </div>
  );
};

export default QuestionGeneratorForm;