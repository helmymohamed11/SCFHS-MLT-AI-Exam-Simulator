import React, { useState } from 'react';
import { Question } from '../types';
import { Search, Filter, BookOpen, Eye } from 'lucide-react';

interface QuestionBankManagerProps {
  questions: Question[];
}

const QuestionBankManager: React.FC<QuestionBankManagerProps> = ({ questions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const domains = Array.from(new Set(questions.map(q => q.domain)));
  
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.stem.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.subtopic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = selectedDomain === 'all' || question.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  const domainCounts = domains.reduce((acc, domain) => {
    acc[domain] = questions.filter(q => q.domain === domain).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Question Bank
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Browse and manage the shared question database ({questions.length} questions)
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-sky-600">{questions.length}</div>
          <div className="text-sm text-slate-500">Total Questions</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{domains.length}</div>
          <div className="text-sm text-slate-500">Domains</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {questions.filter(q => q.difficulty === 'Hard').length}
          </div>
          <div className="text-sm text-slate-500">Hard Questions</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">
            {new Set(questions.map(q => q.subtopic)).size}
          </div>
          <div className="text-sm text-slate-500">Subtopics</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>
          <div className="sm:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              >
                <option value="all">All Domains ({questions.length})</option>
                {domains.map(domain => (
                  <option key={domain} value={domain}>
                    {domain} ({domainCounts[domain]})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Questions ({filteredQuestions.length})
          </h2>
        </div>
        
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {filteredQuestions.map((question, index) => (
            <div key={question.id || index} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2 py-1 bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200 rounded text-xs font-medium">
                      {question.domain}
                    </span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 rounded text-xs">
                      {question.subtopic}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded text-xs">
                      {question.difficulty}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mb-2">
                    {question.stem.substring(0, 150)}...
                  </p>
                  <div className="text-sm text-slate-500">
                    {question.options.length} options • Correct: {String.fromCharCode(65 + question.correct_index)}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedQuestion(question)}
                  className="ml-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-md transition-colors"
                  title="View question"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredQuestions.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No questions found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Question Detail Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Question Details
                </h3>
                <button
                  onClick={() => setSelectedQuestion(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200 rounded-full text-sm font-medium">
                    {selectedQuestion.domain}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 rounded-full text-sm">
                    {selectedQuestion.subtopic}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-sm">
                    {selectedQuestion.difficulty}
                  </span>
                </div>
                
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-lg">{selectedQuestion.stem}</p>
                </div>
                
                <div className="space-y-2">
                  {selectedQuestion.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        index === selectedQuestion.correct_index
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1">{option}</span>
                        {index === selectedQuestion.correct_index && (
                          <span className="text-green-600 text-sm font-medium">✓ Correct</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    Explanation
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300">
                    {selectedQuestion.explanation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBankManager;