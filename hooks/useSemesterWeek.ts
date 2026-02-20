import { useCallback, useState } from 'react';

const computeWeek = (startDate: string | Date, maxWeeks: number): number => {
  const base = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const now = new Date();

  const start = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const current = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = current.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 1;

  const week = Math.floor(diffDays / 7) + 1;
  return Math.min(Math.max(week, 1), maxWeeks);
};

export const useSemesterWeek = (startDate: string | Date, maxWeeks: number) => {
  const [currentWeek, setCurrentWeek] = useState<number>(() => computeWeek(startDate, maxWeeks));

  const setWeek = useCallback((value: number) => {
    setCurrentWeek(Math.min(Math.max(value, 1), maxWeeks));
  }, [maxWeeks]);

  const changeWeek = useCallback((delta: number) => {
    setCurrentWeek(prev => {
      const next = prev + delta;
      if (next < 1 || next > maxWeeks) return prev;
      return next;
    });
  }, [maxWeeks]);

  return {
    currentWeek,
    setWeek,
    changeWeek,
  };
};
