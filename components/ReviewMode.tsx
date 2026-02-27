import React, { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DAYS, ROWS } from '../constants';
import { Course, CourseType, SemesterData } from '../types';

interface ReviewModeProps {
  courses: Course[];
  selectedTab?: 'current' | 'time-machine';
  semesters: SemesterData[];
  activeSemester?: SemesterData;
  onSetActiveSemester: (semesterId: string) => void;
  onDeleteSemester: (semesterId: string) => void;
  onCreateSemester: (name: string, semesterCourses: Course[]) => void;
  onRestoreSnapshot: (snapshotId: string) => void;
  onRestoreSnapshotAsNewSemester: (snapshotId: string, name?: string) => void;
}

type ReviewTab = 'current' | 'time-machine';

const ReviewMode: React.FC<ReviewModeProps> = ({
  courses,
  selectedTab,
  semesters,
  activeSemester,
  onSetActiveSemester,
  onDeleteSemester,
  onCreateSemester,
  onRestoreSnapshot,
  onRestoreSnapshotAsNewSemester,
}) => {
  const reviewTab: ReviewTab = selectedTab ?? 'current';
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);

  const weeklyStats = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => ({
      week: i + 1,
      total: courses.reduce((acc, c) => acc + (c.weeks.includes(i + 1) ? 1 : 0), 0),
    }));
  }, [courses]);

  const maxIntensity = Math.max(...weeklyStats.map((s) => s.total));

  const hasSaturdayCourses = useMemo(() => courses.some((c) => c.day === 5), [courses]);
  const visibleDays = hasSaturdayCourses ? DAYS : DAYS.slice(0, 5);
  const visibleDayIndices = hasSaturdayCourses ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 4];
  const gridColsClass = hasSaturdayCourses ? 'grid-cols-[30px_repeat(6,1fr)]' : 'grid-cols-[30px_repeat(5,1fr)]';

  const snapshotCount = activeSemester?.snapshots.length ?? 0;
  const activeSnapshots = activeSemester?.snapshots ?? [];
  const selectedSnapshot =
    activeSnapshots.find((snap) => snap.id === selectedSnapshotId) ?? activeSnapshots[0] ?? null;
  const previewCourses = selectedSnapshot?.courses ?? [];
  const dayLoad = useMemo(
    () =>
      visibleDayIndices.map((dayIndex) => ({
        dayLabel: DAYS[dayIndex]?.label ?? '',
        count: previewCourses.filter((course) => course.day === dayIndex).length,
      })),
    [previewCourses, visibleDayIndices],
  );

  const formatWeeks = (weeks: number[]) => {
    if (weeks.length === 0) return '';
    const ranges: string[] = [];
    let start = weeks[0];
    let prev = weeks[0];

    for (let i = 1; i <= weeks.length; i++) {
      if (i === weeks.length || weeks[i] !== prev + 1) {
        ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
        if (i < weeks.length) {
          start = weeks[i];
          prev = weeks[i];
        }
      } else {
        prev = weeks[i];
      }
    }

    return `${ranges.join(',')}周`;
  };

  const getCoursesForCell = (day: number, row: number) => courses.filter((c) => c.day === day && c.row === row);

  const createNewSemester = () => {
    const name = window.prompt('新学期名称（例如：2025年2学期）');
    if (!name) return;
    onCreateSemester(name.trim(), []);
  };

  const duplicateCurrentSemester = () => {
    if (!activeSemester) return;
    const name = window.prompt('副本名称', `${activeSemester.name}-副本`);
    if (!name) return;
    onCreateSemester(name.trim(), activeSemester.courses);
  };

  const deleteCurrentSemester = (semesterId: string, semesterName: string) => {
    if (semesters.length <= 1) {
      alert('至少保留一个学期，无法删除最后一个学期。');
      return;
    }
    const ok = window.confirm(`确定删除学期 [${semesterName}] 吗？\n\n此操作会删除该学期的课程与时间快照。`);
    if (!ok) return;
    onDeleteSemester(semesterId);
  };

  useEffect(() => {
    setSelectedSnapshotId(activeSnapshots[0]?.id ?? null);
  }, [activeSemester?.id]);

  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden">
      {reviewTab === 'current' ? (
        <>
          <div className="flex-shrink-0 h-[15%] min-h-[80px] bg-white/50 rounded-xl p-2 border border-slate-100 flex flex-col shadow-sm">
            <h3 className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
              LOAD ANALYSIS · {activeSemester?.name ?? '当前学期'}
              <div className="h-[1px] flex-1 bg-slate-100"></div>
            </h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyStats} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="week" stroke="#cbd5e1" tick={{ fontSize: 8, fontWeight: 700 }} tickLine={false} axisLine={false} interval={0} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontSize: '9px', padding: '4px 8px' }} />
                  <Bar dataKey="total" radius={[2, 2, 0, 0]}>
                    {weeklyStats.map((entry, index) => (
                      <Cell key={index} fill={entry.total === maxIntensity ? '#fb7185' : '#e2e8f0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex-1 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shadow-inner flex flex-col relative">
            <div className="absolute inset-0 flex flex-col">
              <div className={`flex-shrink-0 grid ${gridColsClass} bg-slate-50 border-b border-slate-200`}>
                <div className="h-6 flex items-center justify-center text-[7px] font-black text-slate-400">#</div>
                {visibleDays.map((day, i) => (
                  <div key={i} className="h-6 flex items-center justify-center border-l border-slate-100">
                    <span className="text-[9px] font-black text-slate-600 uppercase">{day.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex-1 grid grid-rows-6">
                {ROWS.map((row, rowIndex) => (
                  <div key={rowIndex} className={`grid ${gridColsClass} border-t border-slate-200 first:border-t-0`}>
                    <div className="bg-slate-50/50 flex items-center justify-center border-r border-slate-200">
                      <span className="text-[8px] font-black text-slate-500">{row.label}</span>
                    </div>

                    {visibleDayIndices.map((dayIndex) => {
                      const cellCourses = getCoursesForCell(dayIndex, rowIndex);
                      return (
                        <div key={dayIndex} className="bg-white border-l border-slate-100 relative p-0.5 overflow-hidden group hover:bg-slate-50 transition-colors">
                          <div className="w-full h-full flex flex-col gap-0.5">
                            {cellCourses.map((course) => (
                              <div
                                key={course.id}
                                className={`flex-1 min-h-0 rounded-[3px] border px-1 flex flex-col justify-center items-center text-center ${
                                  course.type === CourseType.SSR ? 'bg-rose-50 border-rose-100' : 'bg-blue-50 border-blue-100'
                                }`}
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
        </>
      ) : (
        /* 
          Time Machine Layout Redesign 
          Mobile: Stacked, full-page scrolling (overflow-y-auto on main container).
          Desktop: Flex row, full-height (overflow-hidden on main container), scrollable inner panes.
        */
        <div className="flex-1 flex flex-col lg:flex-row gap-4 h-full overflow-y-auto lg:overflow-hidden rounded-xl bg-slate-50/50 p-2 sm:p-4 border border-slate-100 shadow-sm">
          
          {/* Left Sidebar: Flip Calendar (Semesters) */}
          <div className="w-full lg:w-72 lg:flex-shrink-0 flex flex-col gap-4 lg:overflow-hidden">
            <div className="flex items-center gap-2 px-1">
              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
              <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest">学期日历 / Semesters</h2>
            </div>
            
            {/* Semester List - scrollable on desktop */}
            <div className="flex flex-col gap-4 overflow-y-auto lg:flex-1 lg:min-h-0 pb-4 px-1 hide-scrollbar">
              {semesters.map((semester) => {
                const active = activeSemester?.id === semester.id;
                return (
                  <div
                    key={semester.id}
                    onClick={() => onSetActiveSemester(semester.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSetActiveSemester(semester.id);
                      }
                    }}
                    className={`relative w-full shrink-0 rounded-xl border-2 transition-all cursor-pointer group shadow-sm flex flex-col bg-white overflow-hidden ${
                      active ? 'border-slate-800 ring-4 ring-slate-800/10' : 'border-slate-200 hover:border-slate-400 hover:shadow-md'
                    }`}
                  >
                    {/* Old-school flip calendar top binding */}
                    <div className={`h-6 w-full flex items-center justify-around px-4 border-b-2 ${active ? 'bg-slate-800 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                      {/* Fake binding rings */}
                      <div className={`w-3 h-2 rounded-full ${active ? 'bg-slate-600' : 'bg-slate-300'}`}></div>
                      <div className={`w-3 h-2 rounded-full ${active ? 'bg-slate-600' : 'bg-slate-300'}`}></div>
                      <div className={`w-3 h-2 rounded-full ${active ? 'bg-slate-600' : 'bg-slate-300'}`}></div>
                    </div>
                    
                    <div className="p-4 flex flex-col items-center justify-center text-center">
                      <div className={`text-xs font-black uppercase tracking-widest mb-1 ${active ? 'text-slate-500' : 'text-slate-400'}`}>Term</div>
                      <div className={`text-lg sm:text-xl font-black ${active ? 'text-slate-900' : 'text-slate-700'}`}>{semester.name}</div>
                      <div className={`text-[11px] font-bold mt-2 px-3 py-1 rounded-full ${active ? 'bg-slate-100 text-slate-600' : 'bg-slate-50 text-slate-500'}`}>
                        {semester.courses.length} 课程 · {semester.snapshots.length} 版本
                      </div>
                    </div>

                    <div className={`flex items-center justify-between px-3 py-2 border-t-2 bg-slate-50/50 ${active ? 'border-slate-100' : 'border-slate-100'}`}>
                      <div className="text-[10px] font-bold text-slate-400">
                        {new Date(semester.updatedAt || Date.now()).toLocaleDateString()}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCurrentSemester(semester.id, semester.name);
                        }}
                        disabled={semesters.length <= 1}
                        className={`text-[10px] font-black px-2 py-1 rounded transition-colors ${
                          semesters.length <= 1 
                            ? 'text-slate-300 cursor-not-allowed' 
                            : 'text-rose-500 hover:bg-rose-100 hover:text-rose-700'
                        }`}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons for Semesters */}
            <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-slate-200">
              <button 
                onClick={createNewSemester} 
                className="py-3 rounded-xl bg-slate-900 text-white text-[11px] font-black hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-1"
              >
                <span>+</span> 新建学期
              </button>
              <button 
                onClick={duplicateCurrentSemester} 
                className="py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-700 text-[11px] font-black hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-1"
              >
                <span>⎘</span> 复制当前
              </button>
            </div>
          </div>

          {/* Right Area: Versions Grid & Preview (Stacked vertically on desktop) */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            
            {/* Top Half: Version Grid */}
            <div className="flex flex-col gap-3 h-auto lg:h-[45%] flex-shrink-0">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest">版本记录 / Versions</h2>
                </div>
                <div className="text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                  {snapshotCount} 个历史版本
                </div>
              </div>

              <div className="flex-1 overflow-y-visible lg:overflow-y-auto bg-white border border-slate-200 rounded-xl p-3 shadow-sm hide-scrollbar">
                {snapshotCount === 0 ? (
                  <div className="h-full w-full flex items-center justify-center text-sm font-bold text-slate-400 border-2 border-dashed border-slate-100 rounded-lg min-h-[150px]">
                    暂无历史版本
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                    {activeSnapshots.map((snap) => {
                      const selected = selectedSnapshot?.id === snap.id;
                      return (
                        <div
                          key={snap.id}
                          onClick={() => setSelectedSnapshotId(snap.id)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              setSelectedSnapshotId(snap.id);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          className={`flex flex-col p-3 rounded-xl border-2 transition-all cursor-pointer ${
                            selected 
                              ? 'border-blue-500 bg-blue-50/30 shadow-md' 
                              : 'border-slate-100 bg-slate-50 hover:border-slate-300 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${selected ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                              {snap.reason}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              {new Date(snap.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          
                          <div className={`text-[10px] font-bold mb-3 ${selected ? 'text-slate-700' : 'text-slate-500'}`}>
                            {new Date(snap.createdAt).toLocaleDateString()} · {snap.courses.length} 门课程
                          </div>

                          <div className="mt-auto grid grid-cols-2 gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRestoreSnapshot(snap.id);
                              }}
                              className={`py-1.5 rounded-lg text-[10px] font-black transition-colors ${
                                selected ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                              }`}
                            >
                              恢复此版本
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRestoreSnapshotAsNewSemester(snap.id);
                              }}
                              className={`py-1.5 rounded-lg text-[10px] font-black transition-colors ${
                                selected ? 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              另存新学期
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Half: Course Preview */}
            <div className="flex flex-col gap-3 flex-1 h-auto lg:h-[55%] min-h-[300px]">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest">版本预览 / Preview</h2>
                </div>
                {selectedSnapshot && (
                  <div className="text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                    {previewCourses.length} 门课程
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-visible lg:overflow-y-auto bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col gap-3 hide-scrollbar">
                {!selectedSnapshot ? (
                  <div className="flex-1 flex items-center justify-center text-sm font-bold text-slate-400 border-2 border-dashed border-slate-100 rounded-lg min-h-[150px]">
                    请选择一个版本以预览课程
                  </div>
                ) : (
                  <>
                    {/* Day Loads Summary */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 flex-shrink-0">
                      {dayLoad.map((item) => (
                        <div key={item.dayLabel} className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex flex-col items-center justify-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase">{item.dayLabel}</span>
                          <span className="text-sm font-black text-slate-700">{item.count}</span>
                        </div>
                      ))}
                    </div>

                    {/* Course List Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 pb-2">
                      {previewCourses.map((course) => (
                        <div key={course.id} className="flex flex-col p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${course.type === CourseType.SSR ? 'bg-rose-400' : 'bg-blue-400'}`}></span>
                            <span className="text-xs font-bold text-slate-800 truncate" title={course.name}>{course.name}</span>
                          </div>
                          <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-2 mt-auto">
                            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">{DAYS[course.day]?.label} 第{course.row + 1}节</span>
                            <span className="truncate">{formatWeeks(course.weeks)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewMode;
