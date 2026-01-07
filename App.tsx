
import React, { useState, useEffect } from 'react';
import { AppMode, Course, CourseType } from './types';
import { COURSES_DATA, DAYS, ROWS } from './constants';
import ScheduleGrid from './components/ScheduleGrid';
import ReviewMode from './components/ReviewMode';
import Visualization3D from './components/Visualization3D';
import DataEditor from './components/DataEditor';

const App: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [activeMode, setActiveMode] = useState<AppMode>('schedule');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('zcanic_courses_v7');
    if (saved) {
      try {
        setCourses(JSON.parse(saved));
      } catch (e) {
        setCourses(COURSES_DATA);
      }
    } else {
      setCourses(COURSES_DATA);
    }
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      localStorage.setItem('zcanic_courses_v7', JSON.stringify(courses));
    }
  }, [courses]);

  const closeModal = () => setSelectedCourse(null);
  const updateCourses = (newCourses: Course[]) => setCourses(newCourses);

  return (
    <div className="h-full w-full p-2 sm:p-4 md:p-6 flex flex-col gap-3 overflow-hidden">
      {/* Header - Fixed Height Area */}
      <header className="flex flex-col lg:flex-row items-center justify-center gap-3 flex-shrink-0">
        
        {/* Removed Title/Icon Block as requested */}

        <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-2 w-full lg:w-auto">
          {/* Conditional Controls: Only show Week Slider in Schedule Mode */}
          {activeMode === 'schedule' && (
            <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-4 w-full md:w-[300px] lg:w-[400px] order-2 md:order-1">
              <div className="flex flex-col min-w-[50px]">
                <span className="text-[7px] font-black text-slate-400 uppercase">Week</span>
                <span className="text-xs font-black text-slate-800">第 {currentWeek} 周</span>
              </div>
              <input 
                type="range" min="1" max="16" value={currentWeek} 
                onChange={(e) => setCurrentWeek(parseInt(e.target.value))}
                className="flex-grow cursor-pointer"
              />
            </div>
          )}

          <nav className="glass-panel p-1 rounded-xl flex items-center shadow-sm w-full md:w-auto order-1 md:order-2 flex-grow md:flex-grow-0">
            {['schedule', 'review', 'viz3d'].map((mode) => (
              <button 
                key={mode}
                onClick={() => setActiveMode(mode as AppMode)}
                className={`flex-1 md:flex-none px-4 sm:px-6 py-1.5 rounded-lg text-[10px] font-black transition-all duration-300 ease-out ${activeMode === mode ? 'bg-slate-900 text-white shadow-md transform scale-105' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {mode === 'schedule' ? '课表' : mode === 'review' ? '复盘' : '3D'}
              </button>
            ))}
          </nav>
          
          {activeMode !== 'editor' && (
            <button 
              onClick={() => setActiveMode('editor')} 
              className={`hidden md:flex glass-panel px-4 py-2.5 rounded-xl text-[10px] font-black transition-all shadow-sm items-center justify-center gap-2 hover:bg-white w-full md:w-auto order-3 text-slate-400 hover:text-indigo-500`}
            >
              <span>EDIT DATA</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Viewport - Dynamic Height */}
      <main className="flex-1 glass-panel rounded-2xl overflow-hidden shadow-2xl border-slate-200 flex flex-col relative">
        <div className="absolute inset-0 p-1 sm:p-2 bg-white/50 backdrop-blur-md overflow-hidden flex flex-col">
           {/* Content with Fade Transition */}
           <div key={activeMode} className="flex-1 flex flex-col h-full animate-fade-in-gentle">
              {activeMode === 'schedule' ? (
                <ScheduleGrid week={currentWeek} courses={courses} onSelectCourse={setSelectedCourse} />
              ) : activeMode === 'review' ? (
                <ReviewMode courses={courses} />
              ) : activeMode === 'viz3d' ? (
                <Visualization3D courses={courses} />
              ) : (
                <div className="h-full overflow-y-auto hide-scrollbar p-2">
                  <DataEditor courses={courses} onUpdate={updateCourses} />
                </div>
              )}
           </div>
        </div>
        
        <footer className="px-4 py-2 border-t border-slate-100 flex items-center justify-between bg-white/90 flex-shrink-0">
          <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400"></span> 必修</div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-300"></span> 选修</div>
          </div>
          <div className="text-[9px] font-black text-slate-300 italic">🐾 ZCANIC SYSTEM</div>
        </footer>
      </main>

      {/* Simplified Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white max-w-sm w-full p-6 rounded-3xl shadow-2xl relative border border-slate-200 fade-in" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-black text-slate-900 mb-2">{selectedCourse.name}</h2>
            <div className="bg-slate-50 p-4 rounded-xl mb-4">
              <div className="grid grid-cols-8 gap-1">
                {Array.from({length: 16}, (_, i) => i + 1).map(w => (
                  <div key={w} className={`h-6 rounded flex items-center justify-center text-[9px] font-bold ${selectedCourse.weeks.includes(w) ? (w === currentWeek ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-100') : 'bg-slate-100 text-slate-200'}`}>{w}</div>
                ))}
              </div>
            </div>
            <button onClick={closeModal} className="w-full py-3 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase">Close</button>
          </div>
        </div>
      )}
      {/* Mobile Bottom Edit Button */}
      {activeMode !== 'editor' && (
        <div className="md:hidden flex-shrink-0 mt-auto pt-2 pb-safe">
          <button 
            onClick={() => setActiveMode('editor')} 
            className={`w-full glass-panel py-3 rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 ${activeMode === 'editor' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white text-slate-500'}`}
          >
            <span>✏️ EDIT DATA</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
