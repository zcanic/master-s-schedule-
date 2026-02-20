
import React, { useMemo, useRef } from 'react';
import { useDrag } from '@use-gesture/react';
import { Course } from '../types';
import { DAYS, ROWS } from '../constants';
import CourseCard from './CourseCard';
import AnimatedCell from './AnimatedCell';

const EMPTY_CELL_COURSES: Course[] = [];

interface ScheduleGridProps {
  week: number;
  courses: Course[];
  onSelectCourse: (course: Course) => void;
  onWeekChange?: (delta: number) => void;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ week, courses, onSelectCourse, onWeekChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const bind = useDrag(({ swipe: [swipeX], tap }) => {
    // Only trigger if it's a swipe (not a tap) and we have a handler
    if (!tap && swipeX !== 0 && onWeekChange) {
      // swipeX is -1 for left swipe (next week), 1 for right swipe (prev week)
      // If we swipe left (move finger right to left), we want next week (+1)
      // If we swipe right (move finger left to right), we want prev week (-1)
      // Wait, @use-gesture swipe: [x, y].
      // If I swipe LEFT, x is -1. I want to go to NEXT week. so delta should be +1.
      // If I swipe RIGHT, x is 1. I want to go to PREV week. so delta should be -1.
      onWeekChange(swipeX * -1);
    }
  }, {
    axis: 'x',
    filterTaps: true,
    swipe: {
      distance: 50, // Minimum distance to trigger swipe
      velocity: 0.5, // Minimum velocity
      duration: 250 // Max duration
    }
  });

  const currentDayIndex = useMemo(() => {
    const day = new Date().getDay();
    // 0 是周日 (1-6 对应 Mon-Sat)
    return day === 0 ? -1 : day - 1;
  }, []);

  const coursesByCell = useMemo(() => {
    const map = new Map<string, Course[]>();

    courses.forEach((course) => {
      if (!course.weeks.includes(week)) return;

      const key = `${course.day}-${course.row}`;
      const existing = map.get(key);

      if (existing) {
        existing.push(course);
      } else {
        map.set(key, [course]);
      }
    });

    return map;
  }, [courses, week]);

  const hasSaturdayCourses = useMemo(() => courses.some(c => c.day === 5), [courses]);
  const visibleDays = hasSaturdayCourses ? DAYS : DAYS.slice(0, 5);
  const visibleDayIndices = hasSaturdayCourses ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 4];
  const gridColsClass = hasSaturdayCourses
    ? 'grid-cols-[30px_repeat(6,_1fr)] sm:grid-cols-[50px_repeat(6,_1fr)]'
    : 'grid-cols-[30px_repeat(5,_1fr)] sm:grid-cols-[50px_repeat(5,_1fr)]';

  return (
    <div className="h-full flex flex-col" {...bind()} style={{ touchAction: 'pan-y' }}>
      <div
        className={`flex-1 grid ${gridColsClass} gap-0 bg-transparent rounded-xl overflow-hidden shadow-inner select-none`}
        style={{ gridTemplateRows: 'auto repeat(6, 1fr)' }}
      >
        {/* Header */}
        <div className="bg-slate-50 p-1 flex items-center justify-center text-[7px] font-black text-slate-400 uppercase">Slot</div>
        {visibleDays.map((day, i) => (
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

            {visibleDayIndices.map(dayIndex => {
              const cellCourses = coursesByCell.get(`${dayIndex}-${rowIndex}`) ?? EMPTY_CELL_COURSES;

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
