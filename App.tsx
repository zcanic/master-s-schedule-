import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Course } from './types';
import { COURSES_DATA } from './constants';
import ScheduleGrid from './components/ScheduleGrid';
import VoidDropModal from './components/VoidDropModal';
import { useSemesterWeek } from './hooks/useSemesterWeek';
import { useCoursesStore } from './hooks/useCoursesStore';
import { useModeSwitch } from './hooks/useModeSwitch';

const loadReviewMode = () => import('./components/ReviewMode');
const loadVisualization3D = () => import('./components/Visualization3D');
const loadDataEditor = () => import('./components/DataEditor');
const loadMetroMap = () => import('./components/MetroMap');

const ReviewMode = lazy(loadReviewMode);
const Visualization3D = lazy(loadVisualization3D);
const DataEditor = lazy(loadDataEditor);
const MetroMap = lazy(loadMetroMap);

const COURSES_STORAGE_KEY = 'zcanic_courses_v7';
const VOID_KEY_STORAGE = 'zcanic_void_key';
const VOID_API_BASE = 'https://kvapi.zc13501500964.workers.dev';
type ReviewTab = 'current' | 'time-machine';

const App: React.FC = () => {
  const { currentWeek, setWeek, changeWeek } = useSemesterWeek('2026-03-02T00:00:00', 16);
  const { activeMode, isEditor, switchMode, openEditor, closeEditor } = useModeSwitch('schedule');
  const {
    courses,
    semesters,
    activeSemester,
    updateCourses,
    resetCourses,
    setActiveSemester,
    deleteSemester,
    createSemesterFromCourses,
    restoreSnapshotToActive,
    restoreSnapshotAsNewSemester,
    importFromExternal,
    exportForVoidDrop,
    importFromVoidDropPayload,
  } = useCoursesStore({
    storageKey: COURSES_STORAGE_KEY,
    defaultData: COURSES_DATA,
    voidKeyStorageKey: VOID_KEY_STORAGE,
    voidApiBase: VOID_API_BASE,
  });

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [openHoverMenu, setOpenHoverMenu] = useState<'none' | 'about' | 'review' | 'viz'>('none');
  const [isVoidDropOpen, setIsVoidDropOpen] = useState(false);
  const [reviewTab, setReviewTab] = useState<ReviewTab>('current');
  const closeHoverTimerRef = useRef<number | null>(null);
  const menuContainerRef = useRef<HTMLElement | null>(null);

  const closeModal = () => setSelectedCourse(null);

  const prefetchVisualizationViews = () => {
    void loadVisualization3D();
    void loadMetroMap();
  };

  const prefetchReviewView = () => {
    void loadReviewMode();
  };

  const prefetchEditorView = () => {
    void loadDataEditor();
  };

  const canUseHoverMenus = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const openHoverMenuNow = (menu: 'about' | 'review' | 'viz') => {
    if (closeHoverTimerRef.current !== null) {
      window.clearTimeout(closeHoverTimerRef.current);
      closeHoverTimerRef.current = null;
    }
    setOpenHoverMenu(menu);
  };

  const toggleHoverMenu = (menu: 'about' | 'review' | 'viz') => {
    if (closeHoverTimerRef.current !== null) {
      window.clearTimeout(closeHoverTimerRef.current);
      closeHoverTimerRef.current = null;
    }
    setOpenHoverMenu((prev) => (prev === menu ? 'none' : menu));
  };

  const closeHoverMenuSoon = () => {
    if (closeHoverTimerRef.current !== null) {
      window.clearTimeout(closeHoverTimerRef.current);
    }
    closeHoverTimerRef.current = window.setTimeout(() => {
      setOpenHoverMenu('none');
      closeHoverTimerRef.current = null;
    }, 140);
  };

  useEffect(() => {
    return () => {
      if (closeHoverTimerRef.current !== null) {
        window.clearTimeout(closeHoverTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (openHoverMenu === 'none') return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!menuContainerRef.current || !target) return;
      if (menuContainerRef.current.contains(target)) return;
      setOpenHoverMenu('none');
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [openHoverMenu]);

  const handleReset = () => {
    if (confirm('⚠️ RESET DATA WARNING\n\nAre you sure you want to reset all data? This will revert your schedule to the hardcoded default (Mock Data) and erase all your edits.\n\nThis action cannot be undone.')) {
      resetCourses();
      window.location.reload();
    }
  };

  return (
    <div className="h-full w-full p-2 sm:p-4 md:p-6 flex flex-col gap-3 overflow-hidden">
      <header className="flex flex-col lg:flex-row items-center justify-center gap-3 flex-shrink-0 relative" ref={menuContainerRef}>
        <div className="absolute right-0 top-0 lg:right-4 lg:top-1/2 lg:-translate-y-1/2 z-20">
          <div
            className="relative flex justify-end"
            onMouseEnter={() => {
              if (!canUseHoverMenus()) return;
              openHoverMenuNow('about');
            }}
            onMouseLeave={() => {
              if (!canUseHoverMenus()) return;
              closeHoverMenuSoon();
            }}
          >
            <div
              className={`h-9 bg-white shadow-lg border border-slate-100 rounded-full transition-all duration-500 ease-out flex items-center overflow-hidden p-0 gap-0 z-[60] ${openHoverMenu === 'about' ? 'w-auto px-1 shadow-xl' : 'w-9'}`}
              onMouseEnter={() => {
                if (!canUseHoverMenus()) return;
                openHoverMenuNow('about');
              }}
              onClick={() => openHoverMenuNow('about')}
            >
              <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 cursor-help">
                <span className="font-black text-slate-400 italic font-mono text-xs">i</span>
              </div>

              <div className={`flex items-center gap-2 transition-opacity duration-300 pr-3 ${openHoverMenu === 'about' ? 'opacity-100 delay-100' : 'opacity-0 pointer-events-none'}`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
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
                    setIsVoidDropOpen(true);
                  }}
                  className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 whitespace-nowrap flex items-center gap-1"
                >
                  🌌 Void Drop
                </button>
                <div className="w-[1px] h-3 bg-slate-200"></div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Go to Github project page?')) {
                      window.open('https://github.com/zcanic/master-s-schedule-', '_blank');
                    }
                  }}
                  className="text-[10px] font-bold text-slate-500 hover:text-slate-900 whitespace-nowrap flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                  GitHub
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-2 w-full lg:w-auto">
          {activeMode === 'schedule' && (
            <div className="hidden md:flex glass-panel px-4 py-2 rounded-xl items-center gap-4 w-full md:w-[300px] lg:w-[400px] order-2 md:order-1">
              <div className="flex flex-col min-w-[50px]">
                <span className="text-[7px] font-black text-slate-400 uppercase">Week</span>
                <span className="text-xs font-black text-slate-800">第 {currentWeek} 周</span>
              </div>
              <input
                type="range"
                min="1"
                max="16"
                value={currentWeek}
                onChange={(e) => setWeek(parseInt(e.target.value, 10))}
                className="flex-grow cursor-pointer"
              />
            </div>
          )}

          <nav className="glass-panel p-1.5 rounded-xl shadow-sm w-full md:w-auto order-1 md:order-2 z-10 grid grid-cols-3 gap-1 mr-12 md:mr-0">
            <button
              onClick={() => switchMode('schedule')}
              className={`w-full px-1 md:px-6 py-1.5 rounded-lg text-[10px] font-black transition-all duration-300 ease-out whitespace-nowrap ${activeMode === 'schedule' ? 'bg-slate-900 text-white shadow-md transform scale-105' : 'text-slate-400 hover:text-slate-600'}`}
            >
              课表
            </button>

            <div
              className="relative w-full"
              onMouseEnter={() => {
                if (!canUseHoverMenus()) return;
                prefetchReviewView();
                openHoverMenuNow('review');
              }}
              onMouseLeave={() => {
                if (!canUseHoverMenus()) return;
                closeHoverMenuSoon();
              }}
            >
              <button
                onClick={() => {
                  prefetchReviewView();
                  toggleHoverMenu('review');
                }}
                className={`w-full justify-center px-1 md:px-6 py-1.5 rounded-lg text-[10px] font-black transition-all duration-300 ease-out flex items-center gap-0.5 whitespace-nowrap ${activeMode === 'review' ? 'bg-slate-900 text-white shadow-md transform scale-105' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <span>复盘</span>
                <svg className="hidden sm:block w-2.5 h-2.5 opacity-50 ml-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
              </button>

              <div className={`absolute top-full right-0 mt-0.5 w-28 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden transform transition-opacity transition-transform duration-200 origin-top-right z-50 flex flex-col p-1 ${openHoverMenu === 'review' ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible pointer-events-none'}`}>
                <button
                  onClick={() => {
                    setReviewTab('current');
                    setOpenHoverMenu('none');
                    switchMode('review');
                  }}
                  className={`text-left px-3 py-2 rounded-md text-[10px] font-bold hover:bg-slate-50 transition-colors ${(activeMode === 'review' && reviewTab === 'current') ? 'text-slate-900 bg-slate-100' : 'text-slate-500'}`}
                >
                  本学期
                </button>
                <button
                  onClick={() => {
                    setReviewTab('time-machine');
                    setOpenHoverMenu('none');
                    switchMode('review');
                  }}
                  className={`text-left px-3 py-2 rounded-md text-[10px] font-bold hover:bg-slate-50 transition-colors ${(activeMode === 'review' && reviewTab === 'time-machine') ? 'text-slate-900 bg-slate-100' : 'text-slate-500'}`}
                >
                  time machine
                </button>
              </div>
            </div>

            <div
              className="relative w-full"
              onMouseEnter={() => {
                if (!canUseHoverMenus()) return;
                prefetchVisualizationViews();
                openHoverMenuNow('viz');
              }}
              onMouseLeave={() => {
                if (!canUseHoverMenus()) return;
                closeHoverMenuSoon();
              }}
            >
              <button
                onClick={() => {
                  prefetchVisualizationViews();
                  toggleHoverMenu('viz');
                }}
                className={`w-full justify-center px-1 md:px-6 py-1.5 rounded-lg text-[10px] font-black transition-all duration-300 ease-out flex items-center gap-0.5 whitespace-nowrap ${(activeMode === 'viz3d' || activeMode === 'metro') ? 'bg-slate-900 text-white shadow-md transform scale-105' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <span>可视化</span>
                <svg className="hidden sm:block w-2.5 h-2.5 opacity-50 ml-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
              </button>

              <div className={`absolute top-full right-0 mt-0.5 w-24 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden transform transition-opacity transition-transform duration-200 origin-top-right z-50 flex flex-col p-1 ${openHoverMenu === 'viz' ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible pointer-events-none'}`}>
                <button onClick={() => { setOpenHoverMenu('none'); switchMode('viz3d'); }} className={`text-left px-3 py-2 rounded-md text-[10px] font-bold hover:bg-slate-50 transition-colors ${activeMode === 'viz3d' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500'}`}>3D View</button>
                <button onClick={() => { setOpenHoverMenu('none'); switchMode('metro'); }} className={`text-left px-3 py-2 rounded-md text-[10px] font-bold hover:bg-slate-50 transition-colors ${activeMode === 'metro' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'}`}>Metro Map</button>
              </div>
            </div>
          </nav>

          {!isEditor && (
            <button
              onClick={openEditor}
              onMouseEnter={prefetchEditorView}
              className="hidden md:flex glass-panel px-4 py-2.5 rounded-xl text-[10px] font-black transition-all shadow-sm items-center justify-center gap-2 hover:bg-white w-full md:w-auto order-3 text-slate-400 hover:text-indigo-500"
            >
              <span>EDIT DATA</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 glass-panel rounded-2xl overflow-hidden border-slate-200 flex flex-col relative">
        <div className="absolute inset-0 p-1 sm:p-2 bg-white/50 backdrop-blur-md overflow-hidden flex flex-col">
          <div key={activeMode} className="flex-1 flex flex-col h-full animate-fade-in-gentle">
            {activeMode === 'schedule' ? (
              <ScheduleGrid week={currentWeek} courses={courses} onSelectCourse={setSelectedCourse} onWeekChange={changeWeek} />
            ) : (
              <Suspense
                fallback={
                  <div className="h-full w-full flex items-center justify-center text-xs font-black uppercase tracking-wider text-slate-400">
                    Loading view...
                  </div>
                }
              >
                {activeMode === 'review' ? (
                  <ReviewMode
                    courses={courses}
                    selectedTab={reviewTab}
                    semesters={semesters}
                    activeSemester={activeSemester}
                    onSetActiveSemester={setActiveSemester}
                    onDeleteSemester={deleteSemester}
                    onCreateSemester={createSemesterFromCourses}
                    onRestoreSnapshot={restoreSnapshotToActive}
                    onRestoreSnapshotAsNewSemester={restoreSnapshotAsNewSemester}
                  />
                ) : activeMode === 'viz3d' ? (
                  <Visualization3D courses={courses} />
                ) : activeMode === 'metro' ? (
                  <MetroMap courses={courses} />
                ) : (
                  <div className="h-full overflow-y-auto hide-scrollbar p-2">
                    <DataEditor
                      courses={courses}
                      activeSemesterName={activeSemester?.name ?? '当前学期'}
                      allSemesters={semesters.map((s) => ({ id: s.id, name: s.name }))}
                      onUpdate={updateCourses}
                      onImportExternal={importFromExternal}
                      onClose={closeEditor}
                    />
                  </div>
                )}
              </Suspense>
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

      {selectedCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white max-w-sm w-full p-6 rounded-3xl shadow-2xl relative border border-slate-200 fade-in" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-black text-slate-900 mb-2">{selectedCourse.name}</h2>
            <div className="bg-slate-50 p-4 rounded-xl mb-4">
              <div className="grid grid-cols-8 gap-1">
                {Array.from({ length: 16 }, (_, i) => i + 1).map(w => (
                  <div key={w} className={`h-6 rounded flex items-center justify-center text-[9px] font-bold ${selectedCourse.weeks.includes(w) ? (w === currentWeek ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-100') : 'bg-slate-100 text-slate-200'}`}>{w}</div>
                ))}
              </div>
            </div>
            <button onClick={closeModal} className="w-full py-3 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase">Close</button>
          </div>
        </div>
      )}

      {activeMode === 'schedule' && (
        <div className="md:hidden flex-shrink-0 glass-panel px-4 py-3 rounded-xl flex items-center gap-4 shadow-sm w-full mx-auto max-w-[95%]">
          <div className="flex flex-col min-w-[50px]">
            <span className="text-[7px] font-black text-slate-400 uppercase">Week</span>
            <span className="text-xs font-black text-slate-800">第 {currentWeek} 周</span>
          </div>
          <input
            type="range"
            min="1"
            max="16"
            value={currentWeek}
            onChange={(e) => setWeek(parseInt(e.target.value, 10))}
            className="flex-grow cursor-pointer"
          />
        </div>
      )}

      {!isEditor && (
        <div className="md:hidden flex-shrink-0 my-2 flex justify-center">
          <button
            onClick={openEditor}
            onMouseEnter={prefetchEditorView}
            className="w-3/4 glass-panel py-3 rounded-2xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 bg-white text-slate-500"
          >
            <span>✏️ EDIT DATA</span>
          </button>
        </div>
      )}

      <VoidDropModal
        isOpen={isVoidDropOpen}
        onClose={() => setIsVoidDropOpen(false)}
        onExportStorePayload={exportForVoidDrop}
        onImportStorePayload={importFromVoidDropPayload}
      />
    </div>
  );
};

export default App;
