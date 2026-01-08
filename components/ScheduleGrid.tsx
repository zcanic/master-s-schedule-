
import React, { useMemo } from 'react';
import { Course } from '../types';
import { DAYS, ROWS } from '../constants';
import CourseCard from './CourseCard';
import AnimatedCell from './AnimatedCell';

interface ScheduleGridProps {
  week: number;
  courses: Course[];
  onSelectCourse: (course: Course) => void;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ week, courses, onSelectCourse }) => {
  const currentDayIndex = useMemo(() => {
    const day = new Date().getDay();
    // 0 是周日 (1-6 对应 Mon-Sat)
    return day === 0 ? -1 : day - 1;
  }, []);

  const getCoursesForCell = (dayIndex: number, rowIndex: number) => {
    return courses.filter(c => c.day === dayIndex && c.row === rowIndex && c.weeks.includes(week));
  };

  return (
    <div className="h-full flex flex-col">
      <div 
        className="flex-1 grid grid-cols-[30px_repeat(6,_1fr)] sm:grid-cols-[50px_repeat(6,_1fr)] gap-0 bg-transparent rounded-xl overflow-hidden shadow-inner"
        style={{ gridTemplateRows: 'auto repeat(6, 1fr)' }}
      >
        {/* Header */}
        <div className="bg-slate-50 p-1 flex items-center justify-center text-[7px] font-black text-slate-400 uppercase">Slot</div>
        {DAYS.map((day, i) => (
          <div 
            key={i} 
            className={`py-1 sm:py-2 text-center flex flex-col justify-center transition-all ${currentDayIndex === i ? 'bg-slate-900 text-white' : 'bg-white text-slate-500'}`}
          >
            <div className="text-[9px] sm:text-xs md:text-sm font-black uppercase leading-none">{day.label}</div>
            <div className="hidden sm:block text-[8px] md:text-[10px] font-bold mt-0.5 opacity-60">{day.sub}</div>
          </div>
        ))}

        {/* Rows */}
        {ROWS.map((rowLabel, rowIndex) => (
          <React.Fragment key={rowIndex}>
            <div className="bg-slate-50/50 p-1 text-center border-none flex flex-col justify-center items-center">
              <div className="text-[9px] sm:text-sm font-black text-slate-700">{rowLabel.label}</div>
              <div className="hidden sm:block text-[7px] text-slate-400 font-bold uppercase tracking-tighter">{rowLabel.sub}</div>
            </div>

            {[0, 1, 2, 3, 4, 5].map(dayIndex => {
              const cellCourses = getCoursesForCell(dayIndex, rowIndex);
              
              return (
                <div 
                  key={`${dayIndex}-${rowIndex}`} 
                  className="bg-white border-none relative flex flex-col overflow-hidden"
                >
                  <AnimatedCell courses={cellCourses} onSelectCourse={onSelectCourse} />
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ScheduleGrid;
