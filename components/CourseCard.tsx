
import React from 'react';
import { Course, CourseType } from '../types';

interface CourseCardProps {
  course: Course;
  onClick: (course: Course) => void;
  className?: string; // Add optional className
  count?: number; // Density awareness
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick, className, count = 1 }) => {
  const isSSR = course.type === CourseType.SSR;
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(course);
    }
  };

  // 背景色调优：SSR 使用稍微鲜亮一点但不过载的淡粉，必修使用稳重的淡蓝
  const cardStyles = isSSR 
    ? "bg-rose-100/90 text-rose-800 border-rose-200" 
    : "bg-blue-100/90 text-blue-800 border-blue-200";

  // Density logic
  const isCompact = count >= 2;
  const isTiny = count >= 3;
  
  // Dynamic Sizing
  const textSize = isTiny ? 'text-[8px] sm:text-[10px]' : isCompact ? 'text-[9px] sm:text-xs' : 'text-[9px] sm:text-xs md:text-sm lg:text-base';
  const padding = isTiny ? 'p-0.5 sm:p-1' : isCompact ? 'p-1 sm:p-2' : 'p-1.5 sm:p-3';

  return (
    <div 
      role="button"
      tabIndex={0}
      onClick={() => onClick(course)}
      onKeyDown={handleKeyDown}
      className={`
        w-full h-full border-b last:border-b-0
        transition-all duration-200 cursor-pointer select-none
        flex flex-col justify-center items-center text-center
        hover:brightness-95 active:scale-[0.97]
        focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400
        flex-1 min-h-0
        ${padding}
        ${className || 'course-animate-in'}
        ${cardStyles}
      `}
    >
      <div className={`${textSize} leading-tight font-black tracking-tighter sm:tracking-normal break-words max-w-full mobile-compact-text`}>
        {course.name}
      </div>
      {/* Hide SSR badge if too tiny */}
      {isSSR && !isTiny && (
        <div className={`hidden sm:flex mt-1 opacity-50 items-center gap-1 uppercase tracking-widest font-black ${isCompact ? 'text-[6px]' : 'text-[8px]'}`}>
          SSR
        </div>
      )}
    </div>
  );
};

export default CourseCard;
