import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface ScoreDonutProps {
  score: number;
  passed: boolean;
}

const ScoreDonut: React.FC<ScoreDonutProps> = ({ score, passed }) => {
  const data = [
    { name: 'Correct', value: score, color: passed ? '#10b981' : '#f59e0b' },
    { name: 'Incorrect', value: 100 - score, color: '#e5e7eb' },
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-2xl font-bold ${passed ? 'text-green-600' : 'text-amber-600'}`}>
              {score.toFixed(1)}%
            </div>
            <div className={`text-sm font-medium ${passed ? 'text-green-600' : 'text-amber-600'}`}>
              {passed ? 'PASS' : 'FAIL'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreDonut;