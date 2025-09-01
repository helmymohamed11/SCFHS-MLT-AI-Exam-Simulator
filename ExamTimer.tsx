import React, { useState, useEffect } from 'react';

interface ExamTimerProps {
  examStartTime: number;
  durationInMinutes: number;
  onTimeUp: () => void;
}

const ExamTimer: React.FC<ExamTimerProps> = ({ examStartTime, durationInMinutes, onTimeUp }) => {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const durationInSeconds = durationInMinutes * 60;
      const elapsedSeconds = Math.floor((Date.now() - examStartTime) / 1000);
      const remaining = durationInSeconds - elapsedSeconds;
      
      if (remaining <= 0) {
        onTimeUp();
        return 0;
      }
      return remaining;
    };
    
    setSecondsLeft(calculateTimeLeft());

    const intervalId = setInterval(() => {
        setSecondsLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [examStartTime, durationInMinutes, onTimeUp]);

  const formatTime = () => {
    const hours = Math.floor(secondsLeft / 3600);
    const minutes = Math.floor((secondsLeft % 3600) / 60);
    const seconds = secondsLeft % 60;

    return [hours, minutes, seconds]
      .map(v => v.toString().padStart(2, '0'))
      .join(':');
  };

  const isLowTime = secondsLeft <= 300; // 5 minutes

  return (
    <div className={`font-mono text-lg font-bold p-2 rounded-md ${isLowTime ? 'text-red-500 animate-pulse' : 'text-slate-700 dark:text-slate-200'}`}>
      <span>{formatTime()}</span>
    </div>
  );
};

export default ExamTimer;