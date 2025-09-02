import React from 'react';
import { SubtopicPerformance } from '../services/supabaseService';

interface SubtopicHeatmapProps {
  subtopics: SubtopicPerformance[];
}

const SubtopicHeatmap: React.FC<SubtopicHeatmapProps> = ({ subtopics }) => {
  const getColorClass = (accuracy: number) => {
    if (accuracy >= 0.8) return 'bg-green-500';
    if (accuracy >= 0.7) return 'bg-blue-500';
    if (accuracy >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColorClass = (accuracy: number) => {
    return accuracy >= 0.5 ? 'text-white' : 'text-white';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {subtopics.map((subtopic, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg ${getColorClass(subtopic.acc)} ${getTextColorClass(subtopic.acc)} transition-all hover:scale-105`}
        >
          <div className="font-semibold text-sm mb-1">
            {subtopic.name}
          </div>
          <div className="text-lg font-bold">
            {(subtopic.acc * 100).toFixed(0)}%
          </div>
          <div className="text-xs opacity-90">
            {subtopic.items.length} questions
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubtopicHeatmap;