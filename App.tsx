
import React, { useState, useEffect } from 'react';
import { AppMode, Course, CourseType } from './types';
import { COURSES_DATA, DAYS, ROWS } from './constants';
import ScheduleGrid from './components/ScheduleGrid';
import ReviewMode from './components/ReviewMode';
import Visualization3D from './components/Visualization3D';
import DataEditor from './components/DataEditor';
import MetroMap from './components/MetroMap';

const App: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [activeMode, setActiveMode] = useState<AppMode>('schedule');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    // Determine the current week based on the current date
    // Start Date: 2026-03-02 (Monday)
    const startDate = new Date('2026-03-02T00:00:00');
    const now = new Date();

    // Reset time part for accurate day calculation
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const current = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffTime = current.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let calculatedWeek = 1;
    
    if (diffDays < 0) {
       calculatedWeek = 1; // Before semester starts
    } else {
       calculatedWeek = Math.floor(diffDays / 7) + 1;
    }

    // Clamp between 1 and 18 (including exam weeks)
    if (calculatedWeek > 18) calculatedWeek = 18; // Cap at max
    // Note: Project currently supports max 16 weeks in UI mainly, but let's default to standard logic.
    // Given the UI slider has max="16", we should probably clamp to 16 for safety unless we extend the UI.
    // The user mentioned exam weeks 17/18. Let's stick to 16 for the main views for now or allow up to 18 if the slider supports it.
    // Checking slider props: min="1" max="16". So we should clamp to 16 for now to avoid bugs.
    if (calculatedWeek > 16) calculatedWeek = 16; 

    setCurrentWeek(calculatedWeek);
  }, []);

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

  const handleReset = () => {
    if (confirm('⚠️ RESET DATA WARNING\n\nAre you sure you want to reset all data? This will revert your schedule to the hardcoded default (Mock Data) and erase all your edits.\n\nThis action cannot be undone.')) {
      setCourses(COURSES_DATA);
      // LocalStorage update is handled by the useEffect [courses] dependency
      // But we might want to force a reload or ensure it saves immediately if there are race conditions, 
      // but useEffect is generally fine.
      localStorage.setItem('zcanic_courses_v7', JSON.stringify(COURSES_DATA));
      window.location.reload(); // Reload to ensure clean state
    }
  };

  // State for About Capsule
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <div className="h-full w-full p-2 sm:p-4 md:p-6 flex flex-col gap-3 overflow-hidden">
      {/* Header - Fixed Height Area */}
      <header className="flex flex-col lg:flex-row items-center justify-center gap-3 flex-shrink-0 relative">
        
        {/* About / Reset Capsule - Absolute Top Right */}
        <div className="absolute right-0 top-0 lg:right-4 lg:top-1/2 lg:-translate-y-1/2 z-20">
           <div className="relative flex justify-end" onMouseLeave={() => setIsAboutOpen(false)}>
              <div 
                className={`h-9 bg-white shadow-lg border border-slate-100 rounded-full transition-all duration-500 ease-out flex items-center overflow-hidden p-0 gap-0 z-[60] ${isAboutOpen ? 'w-auto px-1 shadow-xl' : 'w-9'}`}
                onMouseEnter={() => setIsAboutOpen(true)}
                onClick={() => setIsAboutOpen(true)}
              >
                  {/* Icon */}
                  <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 cursor-help">
                    <span className="font-black text-slate-400 italic font-mono text-xs">i</span>
                  </div>
                  
                  {/* Content (Revealed when open) */}
                  <div className={`flex items-center gap-2 transition-opacity duration-300 pr-3 ${isAboutOpen ? 'opacity-100 delay-100' : 'opacity-0 pointer-events-none'}`}>
                     <button 
                       onClick={(e) => {
                         e.stopPropagation(); // Prevent re-triggering open
                         handleReset();
                       }}
                       className="text-[10px] font-bold text-red-400 hover:text-red-600 whitespace-nowrap"
                     >
                       Reset Data
                     </button>
                     <div className="w-[1px] h-3 bg-slate-200"></div>
                     <button 
                       onClick={(e) => {
                          e.stopPropagation();
                          if(confirm("Go to Github project page?")) {
                              window.open("https://github.com/zcanic/master-s-schedule-", "_blank");
                          }
                       }}
                       className="text-[10px] font-bold text-slate-500 hover:text-slate-900 whitespace-nowrap flex items-center gap-1"
                     >
                       <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                       GitHub
                     </button>
                  </div>
              </div>
           </div>
        </div>

        {/* Removed Title/Icon Block as requested */}

        <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-2 w-full lg:w-auto">
          {/* Conditional Controls: Only show Week Slider in Schedule Mode */}
          {activeMode === 'schedule' && (
            <div className="hidden md:flex glass-panel px-4 py-2 rounded-xl items-center gap-4 w-full md:w-[300px] lg:w-[400px] order-2 md:order-1">
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

          <nav className="glass-panel p-1.5 rounded-xl shadow-sm w-full md:w-auto order-1 md:order-2 z-10 grid grid-cols-3 gap-1 mr-12 md:mr-0">
            {/* Schedule */}
            <button 
              onClick={() => setActiveMode('schedule')}
              className={`w-full px-1 md:px-6 py-1.5 rounded-lg text-[10px] font-black transition-all duration-300 ease-out whitespace-nowrap ${activeMode === 'schedule' ? 'bg-slate-900 text-white shadow-md transform scale-105' : 'text-slate-400 hover:text-slate-600'}`}
            >
              课表
            </button>

            {/* Review */}
            <button 
              onClick={() => setActiveMode('review')}
              className={`w-full px-1 md:px-6 py-1.5 rounded-lg text-[10px] font-black transition-all duration-300 ease-out whitespace-nowrap ${activeMode === 'review' ? 'bg-slate-900 text-white shadow-md transform scale-105' : 'text-slate-400 hover:text-slate-600'}`}
            >
              复盘
            </button>

            {/* Visualization Dropdown */}
            <div className="relative group w-full">
               <button 
                 className={`w-full justify-center px-1 md:px-6 py-1.5 rounded-lg text-[10px] font-black transition-all duration-300 ease-out flex items-center justify-center gap-0.5 whitespace-nowrap ${(activeMode === 'viz3d' || activeMode === 'metro') ? 'bg-slate-900 text-white shadow-md transform scale-105' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 <span>可视化</span>
                 <svg className="hidden sm:block w-2.5 h-2.5 opacity-50 ml-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
               </button>
               
               {/* Dropdown Menu */}
               <div className="absolute top-full right-0 mt-1 w-24 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden transform scale-95 opacity-0 invisible group-hover:scale-100 group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right z-50 flex flex-col p-1">
                  <button onClick={() => setActiveMode('viz3d')} className={`text-left px-3 py-2 rounded-md text-[10px] font-bold hover:bg-slate-50 transition-colors ${activeMode === 'viz3d' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500'}`}>3D View</button>
                  <button onClick={() => setActiveMode('metro')} className={`text-left px-3 py-2 rounded-md text-[10px] font-bold hover:bg-slate-50 transition-colors ${activeMode === 'metro' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'}`}>Metro Map</button>
               </div>
            </div>
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
      <main className="flex-1 glass-panel rounded-2xl overflow-hidden border-slate-200 flex flex-col relative">
        <div className="absolute inset-0 p-1 sm:p-2 bg-white/50 backdrop-blur-md overflow-hidden flex flex-col">
           {/* Content with Fade Transition */}
           <div key={activeMode} className="flex-1 flex flex-col h-full animate-fade-in-gentle">
              {activeMode === 'schedule' ? (
                <ScheduleGrid week={currentWeek} courses={courses} onSelectCourse={setSelectedCourse} />
              ) : activeMode === 'review' ? (
                <ReviewMode courses={courses} />
              ) : activeMode === 'viz3d' ? (
                <Visualization3D courses={courses} />
              ) : activeMode === 'metro' ? (
                <MetroMap courses={courses} />
              ) : (
                <div className="h-full overflow-y-auto hide-scrollbar p-2">
                  <DataEditor courses={courses} onUpdate={updateCourses} onClose={() => setActiveMode('schedule')} />
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
      {/* Mobile Week Slider (Only in Schedule Mode) - Positioned below main content */}
      {activeMode === 'schedule' && (
        <div className="md:hidden flex-shrink-0 glass-panel px-4 py-3 rounded-xl flex items-center gap-4 shadow-sm w-full mx-auto max-w-[95%]">
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

      {/* Mobile Bottom Edit Button (Shortened) */}
      {activeMode !== 'editor' && (
        <div className="md:hidden flex-shrink-0 mt-auto pt-2 pb-safe flex justify-center">
          <button 
            onClick={() => setActiveMode('editor')} 
            className={`w-3/4 glass-panel py-3 rounded-2xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 ${activeMode === 'editor' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white text-slate-500'}`}
          >
            <span>✏️ EDIT DATA</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
