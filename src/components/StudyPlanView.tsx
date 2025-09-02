import React from 'react';
import { Calendar, Clock, Target, TrendingUp, BookOpen } from 'lucide-react';

interface StudyPlanProps {
  priorities: Array<{
    domain: string;
    reason: string;
    action: string;
  }>;
  weekPlan: Array<{
    day: string;
    focus: string;
    duration: number;
    activity: string;
  }>;
  timeTips: string[];
}

const StudyPlanView: React.FC<StudyPlanProps> = ({ priorities, weekPlan, timeTips }) => {
  return (
    <div className="space-y-8">
      {/* Priorities */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2 text-red-500" />
          Top Priorities
        </h2>
        <div className="space-y-4">
          {priorities.map((priority, index) => (
            <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    {priority.domain}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {priority.reason}
                  </p>
                  <p className="text-sm text-sky-600 dark:text-sky-400 font-medium">
                    Action: {priority.action}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Plan */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-sky-500" />
          7-Day Study Plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {weekPlan.map((day, index) => (
            <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {day.day}
                </h3>
                <div className="flex items-center text-xs text-slate-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {day.duration}m
                </div>
              </div>
              <div className="text-sm text-sky-600 dark:text-sky-400 font-medium mb-2">
                {day.focus}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {day.activity}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Time Management Tips */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
          Time Management Tips
        </h2>
        <div className="space-y-3">
          {timeTips.map((tip, index) => (
            <div key={index} className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                {index + 1}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {tip}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudyPlanView;