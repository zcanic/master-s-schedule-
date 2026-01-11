
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DAYS, ROWS } from '../constants';
import { Course, CourseType } from '../types';

interface ReviewModeProps {
  courses: Course[];
}

const ReviewMode: React.FC<ReviewModeProps> = ({ courses }) => {
  const weeklyStats = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => ({
      week: i + 1,
      total: courses.reduce((acc, c) => acc + (c.weeks.includes(i + 1) ? 1 : 0), 0)
    }));
  }, [courses]);

  const maxIntensity = Math.max(...weeklyStats.map(s => s.total));

  const getCoursesForCell = (day: number, row: number) => {
    return courses.filter(c => c.day === day && c.row === row);
  };

  const hasSaturdayCourses = useMemo(() => courses.some(c => c.day === 5), [courses]);
  const visibleDays = hasSaturdayCourses ? DAYS : DAYS.slice(0, 5);
  const visibleDayIndices = hasSaturdayCourses ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 4];
  const gridColsClass = hasSaturdayCourses ? 'grid-cols-[30px_repeat(6,1fr)]' : 'grid-cols-[30px_repeat(5,1fr)]';

  const formatWeeks = (weeks: number[]) => {
    if (weeks.length === 0) return '';
    // Simplify display: finding ranges
    const ranges = [];
    let start = weeks[0];
    let prev = weeks[0];
    
    for (let i = 1; i <= weeks.length; i++) {
        if (i === weeks.length || weeks[i] !== prev + 1) {
            if (start === prev) ranges.push(`${start}`);
            else ranges.push(`${start}-${prev}`);
            if (i < weeks.length) {
                start = weeks[i];
                prev = weeks[i];
            }
        } else {
            prev = weeks[i];
        }
    }
    return ranges.join(',') + '周';
  };

  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden">
      {/* Top Chart Section - Compact Height */}
      <div className="flex-shrink-0 h-[15%] min-h-[80px] bg-white/50 rounded-xl p-2 border border-slate-100 flex flex-col shadow-sm">
        <h3 className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
          LOAD ANALYSIS
          <div className="h-[1px] flex-1 bg-slate-100"></div>
        </h3>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyStats} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="week" stroke="#cbd5e1" tick={{fontSize: 8, fontWeight: 700}} tickLine={false} axisLine={false} interval={0} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontSize: '9px', padding: '4px 8px' }}
              />
              <Bar dataKey="total" radius={[2, 2, 0, 0]}>
                {weeklyStats.map((entry, index) => (
                  <Cell key={index} fill={entry.total === maxIntensity ? '#fb7185' : '#e2e8f0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Global View Grid - Flex Layout to fit screen perfectly */}
      <div className="flex-1 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shadow-inner flex flex-col relative">
        <div className="absolute inset-0 flex flex-col">
          {/* Grid Header */}
          <div className={`flex-shrink-0 grid ${gridColsClass} bg-slate-50 border-b border-slate-200`}>
            <div className="h-6 flex items-center justify-center text-[7px] font-black text-slate-400">#</div>
            {visibleDays.map((day, i) => (
              <div key={i} className="h-6 flex items-center justify-center border-l border-slate-100">
                <span className="text-[9px] font-black text-slate-600 uppercase">{day.label}</span>
              </div>
            ))}
          </div>

          {/* Grid Body - Flex Grow to Fill */}
          <div className="flex-1 grid grid-rows-6">
            {ROWS.map((row, rowIndex) => (
              <div key={rowIndex} className={`grid ${gridColsClass} border-t border-slate-200 first:border-t-0`}>
                {/* Row Label */}
                <div className="bg-slate-50/50 flex items-center justify-center border-r border-slate-200">
                   <span className="text-[8px] font-black text-slate-500">{row.label}</span>
                </div>

                {/* Cells */}
                {visibleDayIndices.map(dayIndex => {
                  const cellCourses = getCoursesForCell(dayIndex, rowIndex);
                  return (
                    <div key={dayIndex} className="bg-white border-l border-slate-100 relative p-0.5 overflow-hidden group hover:bg-slate-50 transition-colors">
                      <div className="w-full h-full flex flex-col gap-0.5">
                        {cellCourses.map(course => (
                          <div 
                            key={course.id} 
                            className={`
                              flex-1 min-h-0 rounded-[3px] border px-1 flex flex-col justify-center items-center text-center
                              ${course.type === CourseType.SSR ? 'bg-rose-50 border-rose-100' : 'bg-blue-50 border-blue-100'}
                            `}
                          >
                            <div className={`font-bold leading-none truncate w-full ${cellCourses.length >= 3 ? 'text-[6px]' : cellCourses.length === 2 ? 'text-[7px]' : 'text-[8px] sm:text-[10px] md:text-xs'} ${course.type === CourseType.SSR ? 'text-rose-700' : 'text-blue-700'}`}>
                              {course.name}
                            </div>
                            <div className={`text-[6px] sm:text-[8px] opacity-70 leading-tight mt-0.5 scale-90 sm:scale-100 ${cellCourses.length >= 3 ? 'hidden sm:block' : ''}`}>
                              {formatWeeks(course.weeks)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewMode;
