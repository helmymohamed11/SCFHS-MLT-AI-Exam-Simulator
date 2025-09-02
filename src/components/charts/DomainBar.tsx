import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DomainPerformance } from '../services/supabaseService';

interface DomainBarProps {
  domains: DomainPerformance[];
}

const DomainBar: React.FC<DomainBarProps> = ({ domains }) => {
  const data = domains.map(domain => ({
    name: domain.name.length > 15 ? domain.name.substring(0, 15) + '...' : domain.name,
    fullName: domain.name,
    accuracy: (domain.acc * 100).toFixed(1),
    bucket: domain.bucket,
    questions: domain.n,
  }));

  const getBarColor = (bucket: string) => {
    switch (bucket) {
      case 'weak': return '#ef4444';
      case 'mid': return '#f59e0b';
      case 'good': return '#3b82f6';
      case 'strong': return '#10b981';
      default: return '#6b7280';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
          <p className="font-semibold">{data.fullName}</p>
          <p className="text-sm">Accuracy: {data.accuracy}%</p>
          <p className="text-sm">Questions: {data.questions}</p>
          <p className="text-sm capitalize">Level: {data.bucket}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            className="text-xs"
          />
          <YAxis 
            domain={[0, 100]}
            label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="accuracy" 
            fill={(entry: any) => getBarColor(entry.bucket)}
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.bucket)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DomainBar;