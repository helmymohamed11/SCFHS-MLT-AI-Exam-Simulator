import React, { useState, useEffect } from 'react';
import { Difficulty, Language, Domain, DOMAINS } from '../types';
import { getSubtopicsForDomain } from '../services/geminiService';

interface QuestionGeneratorFormProps {
  domain: Domain;
  setDomain: (value: Domain) => void;
  subtopic: string;
  setSubtopic: (value: string) => void;
  difficulty: Difficulty;
  setDifficulty: (value: Difficulty) => void;
  language: Language;
  setLanguage: (value: Language) => void;
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
  const [subtopics, setSubtopics] = useState<string[]>([]);

  useEffect(() => {
    const fetchedSubtopics = getSubtopicsForDomain(domain);
    setSubtopics(fetchedSubtopics);
    if (fetchedSubtopics.length > 0) {
      setSubtopic(fetchedSubtopics[0]);
    } else {
       setSubtopic(''); // Reset if no subtopics found
    }
  }, [domain, setSubtopic]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="domain" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Domain
          </label>
          <select
            id="domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value as Domain)}
            className="block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
          >
            {DOMAINS.map((domainItem) => (
              <option key={domainItem} value={domainItem}>
                {domainItem}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subtopic" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Subtopic
          </label>
          <select
            id="subtopic"
            value={subtopic}
            onChange={(e) => setSubtopic(e.target.value)}
            disabled={subtopics.length === 0}
            className="block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md disabled:bg-slate-100 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            {subtopics.length === 0 && <option>No subtopics found</option>}
            {subtopics.map((subtopicItem) => (
              <option key={subtopicItem} value={subtopicItem}>
                {subtopicItem}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Difficulty
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
          >
            {Object.values(Difficulty).map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
          >
            {Object.values(Language).map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate Question'
          )}
        </button>
      </form>
    </div>
  );
};

export default QuestionGeneratorForm;