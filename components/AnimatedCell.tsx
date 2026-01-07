
import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import CourseCard from './CourseCard';

interface AnimatedCellProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
}

interface RenderItem {
    course: Course;
    status: 'entering' | 'present' | 'leaving';
}

const AnimatedCell: React.FC<AnimatedCellProps> = ({ courses, onSelectCourse }) => {
  const [items, setItems] = useState<RenderItem[]>([]);

  useEffect(() => {
    setItems(prev => {
        const next: RenderItem[] = [];
        const prevMap = new Map(prev.map(p => [p.course.id, p]));
        
        // 1. Process new/existing items
        courses.forEach(c => {
            if (prevMap.has(c.id)) {
                // Existing: keep status unless it was leaving (then revive it)
                const existing = prevMap.get(c.id)!;
                next.push({ ...existing, status: existing.status === 'leaving' ? 'present' : existing.status });
                prevMap.delete(c.id);
            } else {
                // New: entering
                next.push({ course: c, status: 'entering' });
            }
        });

        // 2. Process removed items (mark as leaving)
        prevMap.forEach((item) => {
            // Only add if not already present in current request (handled by deletion above)
            next.push({ ...item, status: 'leaving' });
        });

        return next;
    });

    // Clean up leaving items after animation
    const timer = setTimeout(() => {
        setItems(current => current.filter(i => i.status !== 'leaving'));
    }, 300);

    return () => clearTimeout(timer);
  }, [courses]);

  return (
    <>
      {items.map(item => (
        <React.Fragment key={item.course.id}>
             <CourseCard 
                className={item.status === 'leaving' ? 'course-animate-out' : 'course-animate-in'}
                course={item.course} 
                onClick={onSelectCourse} 
                count={courses.length} // Pass the steady-state count for layout stability
            />
            {/* Placeholder to occupy space while animating out if needed? 
                Actually, course-animate-out is absolute positioned to let others slide up.
                We probably want the space to collapse if it's vertical stack.
                But grid cells usually have 1 course. If multiple, stacking behavior applies.
            */}
        </React.Fragment>
      ))}
    </>
  );
};

export default AnimatedCell;
