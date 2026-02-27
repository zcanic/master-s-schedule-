import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DAYS, ROWS } from '../constants';
import { Course, CourseType, SemesterData } from '../types';

interface ReviewModeProps {
  courses: Course[];
  selectedTab?: 'current' | 'time-machine';
  semesters: SemesterData[];
  activeSemester?: SemesterData;
  onSetActiveSemester: (semesterId: string) => void;
  onCreateSemester: (name: string, semesterCourses: Course[]) => void;
  onRestoreSnapshot: (snapshotId: string) => void;
  onRestoreSnapshotAsNewSemester: (snapshotId: string, name?: string) => void;
}

type ReviewTab = 'current' | 'time-machine';
type TimeMachineTab = 'semester' | 'all-courses';

const ReviewMode: React.FC<ReviewModeProps> = ({
  courses,
  selectedTab,
  semesters,
  activeSemester,
  onSetActiveSemester,
  onCreateSemester,
  onRestoreSnapshot,
  onRestoreSnapshotAsNewSemester,
}) => {
  const reviewTab: ReviewTab = selectedTab ?? 'current';
  const [tmTab, setTmTab] = useState<TimeMachineTab>('semester');
  const [allCoursesPage, setAllCoursesPage] = useState(1);

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

  const allCourses = useMemo(() => {
    const merged = semesters.flatMap((semester) =>
      semester.courses.map((course) => ({
        ...course,
        semesterName: semester.name,
      })),
    );
    return merged.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
  }, [semesters]);

  const pageSize = 24;
  const pageCount = Math.max(1, Math.ceil(allCourses.length / pageSize));
  const clampedPage = Math.min(allCoursesPage, pageCount);
  const pagedCourses = allCourses.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);
  const snapshotCount = activeSemester?.snapshots.length ?? 0;
  const semesterSplitClass = snapshotCount <= 1
    ? 'grid-cols-1 lg:grid-cols-[minmax(260px,0.95fr)_minmax(0,1.2fr)]'
    : 'grid-cols-1 lg:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.35fr)]';

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
        <div className="flex-1 bg-white/60 rounded-xl border border-slate-100 shadow-sm p-3 sm:p-4 flex flex-col gap-3 overflow-hidden">
          <div className="flex-shrink-0 glass-panel p-1 rounded-xl flex items-center gap-1 w-fit">
            <button
              onClick={() => setTmTab('semester')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors ${
                tmTab === 'semester' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              学期管理
            </button>
            <button
              onClick={() => setTmTab('all-courses')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors ${
                tmTab === 'all-courses' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              全部课程
            </button>
          </div>

          {tmTab === 'semester' ? (
            <div className={`grid ${semesterSplitClass} gap-3 flex-1 min-h-0 max-w-[1200px] w-full mx-auto`}>
              <div className="bg-white rounded-xl border border-slate-100 p-3 flex flex-col min-h-0">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">学期列表</div>
                <div className="space-y-2 overflow-y-auto pr-1 min-h-[180px]">
                  {semesters.map((semester) => (
                    <button
                      key={semester.id}
                      onClick={() => onSetActiveSemester(semester.id)}
                      className={`w-full text-left rounded-lg px-3 py-2 border transition-colors ${
                        activeSemester?.id === semester.id
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-black truncate">{semester.name}</div>
                      <div className={`text-[10px] ${activeSemester?.id === semester.id ? 'text-slate-200' : 'text-slate-400'}`}>
                        {semester.courses.length} 门课程 · {semester.snapshots.length} 个快照
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                  <button onClick={createNewSemester} className="flex-1 px-2 py-2 rounded-lg bg-slate-900 text-white text-[10px] font-black">
                    新建学期
                  </button>
                  <button onClick={duplicateCurrentSemester} className="flex-1 px-2 py-2 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-black">
                    复制当前
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-100 p-3 flex flex-col min-h-0">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  时间机器 · {activeSemester?.name ?? '未选择'}
                </div>
                <div className="space-y-2 overflow-y-auto pr-1 min-h-[180px]">
                  {snapshotCount === 0 ? (
                    <div className="h-full min-h-[180px] rounded-lg border border-dashed border-slate-200 bg-slate-50/80 flex items-center justify-center text-[11px] font-bold text-slate-400">
                      暂无时间快照
                    </div>
                  ) : (
                    (activeSemester?.snapshots ?? []).map((snap) => (
                      <div key={snap.id} className="border border-slate-100 rounded-lg p-2 bg-slate-50/50">
                        <div className="text-xs font-black text-slate-700">{snap.reason}</div>
                        <div className="text-[10px] text-slate-400">{new Date(snap.createdAt).toLocaleString()}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{snap.courses.length} 门课程</div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <button
                            onClick={() => onRestoreSnapshot(snap.id)}
                            className="px-2 py-1 rounded bg-slate-900 text-white text-[10px] font-black"
                          >
                            回到此版本
                          </button>
                          <button
                            onClick={() => onRestoreSnapshotAsNewSemester(snap.id)}
                            className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-black"
                          >
                            另存新学期
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-100 p-3 flex-1 min-h-0 flex flex-col max-w-[1200px] w-full mx-auto">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">全部学期课程总览</div>
                <div className="text-[10px] text-slate-400">共 {allCourses.length} 门</div>
              </div>

              <div className="grid [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))] gap-2 content-start overflow-y-auto pr-1 flex-1">
                {pagedCourses.map((course) => (
                  <div key={`${course.semesterName}-${course.id}`} className="rounded-lg border border-slate-100 p-2 bg-slate-50/70 h-fit">
                    <div className="text-xs font-black text-slate-700 truncate">{course.name}</div>
                    <div className="text-[10px] text-slate-500">{course.semesterName}</div>
                    <div className="text-[10px] text-slate-400">{DAYS[course.day]?.label} · 第{course.row + 1}节 · {formatWeeks(course.weeks)}</div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
                <button
                  onClick={() => setAllCoursesPage((p) => Math.max(1, p - 1))}
                  disabled={clampedPage <= 1}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-black disabled:opacity-40"
                >
                  上一页
                </button>
                <div className="text-[10px] text-slate-400">第 {clampedPage} / {pageCount} 页</div>
                <button
                  onClick={() => setAllCoursesPage((p) => Math.min(pageCount, p + 1))}
                  disabled={clampedPage >= pageCount}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-black disabled:opacity-40"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewMode;
