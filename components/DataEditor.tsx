
import React, { useState, useMemo, useRef } from 'react';
import { Course, CourseType } from '../types';
import { DAYS, ROWS } from '../constants';

interface DataEditorProps {
  courses: Course[];
  onUpdate: (courses: Course[]) => void;
}

// Helper components for the Modal
const WeekSelector: React.FC<{ value: number[], onChange: (w: number[]) => void }> = ({ value, onChange }) => {
  const toggle = (w: number) => {
    if (value.includes(w)) onChange(value.filter(v => v !== w));
    else onChange([...value, w].sort((a,b) => a-b));
  };

  const setRange = (type: 'all' | 'odd' | 'even' | 'p1' | 'p2' | 'none') => {
    const all = Array.from({length: 16}, (_, i) => i + 1);
    if (type === 'none') { onChange([]); return; }
    if (type === 'all') { onChange(all); return; }
    if (type === 'odd') { onChange(all.filter(w => w % 2 !== 0)); return; }
    if (type === 'even') { onChange(all.filter(w => w % 2 === 0)); return; }
    if (type === 'p1') { onChange(all.filter(w => w <= 8)); return; } // 1-8
    if (type === 'p2') { onChange(all.filter(w => w >= 9)); return; } // 9-16
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
         {['all', 'none', 'odd', 'even', 'p1', 'p2'].map(t => (
           <button 
             key={t} onClick={() => setRange(t as any)}
             className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-500 text-[10px] uppercase font-bold rounded-md"
           >
             {{all:'全选', none:'清空', odd:'单周', even:'双周', p1:'1-8周', p2:'9-16周'}[t]}
           </button>
         ))}
      </div>
      <div className="grid grid-cols-8 gap-1.5">
        {Array.from({length: 16}, (_, i) => i + 1).map(w => (
          <button 
            key={w} 
            onClick={() => toggle(w)}
            className={`
              h-8 rounded-lg text-xs font-black transition-all border
              ${value.includes(w) ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-300 border-slate-100 hover:border-slate-300'}
            `}
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
};

const CourseModal: React.FC<{ 
  course: Partial<Course> | null, 
  onClose: () => void, 
  onSave: (c: Course) => void,
  onDelete?: (id: string) => void
}> = ({ course, onClose, onSave, onDelete }) => {
  if (!course) return null;

  const [name, setName] = useState(course.name || '');
  const [day, setDay] = useState(course.day ?? 0);
  const [row, setRow] = useState(course.row ?? 0);
  const [type, setType] = useState<CourseType>(course.type || CourseType.NORMAL);
  const [weeks, setWeeks] = useState<number[]>(course.weeks || []);
  
  const isEditing = !!course.id;

  const handleSave = () => {
    if (!name.trim()) return alert('请输入课程名称');
    if (weeks.length === 0) return alert('请选择至少一个周次');

    const color = type === CourseType.SSR 
      ? "bg-rose-100 text-rose-700 border-rose-200" 
      : "bg-blue-100 text-blue-700 border-blue-200";

    onSave({
      id: course.id || Date.now().toString(),
      name, day, row, weeks, type, color
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-black text-slate-800">{isEditing ? 'Edit Course' : 'Add Course'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 flex items-center justify-center font-bold">✕</button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Name & Type */}
          <div className="space-y-4">
             <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Course Name</label>
               <input 
                 autoFocus
                 className="w-full text-xl font-bold border-b-2 border-slate-200 focus:border-indigo-500 outline-none py-2 bg-transparent placeholder-slate-300 transition-colors"
                 placeholder="e.g. Advanced AI"
                 value={name}
                 onChange={e => setName(e.target.value)}
               />
             </div>
             
             <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Type</label>
               <div className="flex gap-2 p-1 bg-slate-100 rounded-xl inline-flex">
                 <button onClick={() => setType(CourseType.NORMAL)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${type === CourseType.NORMAL ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>必修 (Normal)</button>
                 <button onClick={() => setType(CourseType.SSR)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${type === CourseType.SSR ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>选修 (SSR)</button>
               </div>
             </div>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Weekday</label>
              <select value={day} onChange={e => setDay(Number(e.target.value))} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-100">
                {DAYS.map((d, i) => <option key={i} value={i}>{d.label} - {d.sub}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Time Slot</label>
              <select value={row} onChange={e => setRow(Number(e.target.value))} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-100 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-100">
                {ROWS.map((r, i) => <option key={i} value={i}>#{i+1} - {r.sub}</option>)}
              </select>
            </div>
          </div>

          {/* Weeks */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Active Weeks</label>
            <WeekSelector value={weeks} onChange={setWeeks} />
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
          {isEditing && (
            <button 
              onClick={() => onDelete?.(course.id!)}
              className="px-6 py-3 rounded-xl bg-red-50 text-red-500 font-black text-xs hover:bg-red-100 transition-colors"
            >
              DELETE
            </button>
          )}
          <button 
            onClick={handleSave}
            className="flex-1 px-6 py-3 rounded-xl bg-slate-900 text-white font-black text-xs hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
          >
            {isEditing ? 'SAVE CHANGES' : 'CREATE COURSE'}
          </button>
        </div>
      </div>
    </div>
  );
};

const DataEditor: React.FC<DataEditorProps> = ({ courses, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Partial<Course> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* 1. Sort courses alphabetically (including Chinese Pinyin) */
  const filteredCourses = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return courses
      .filter(c => c.name.toLowerCase().includes(term))
      .sort((a, b) => new Intl.Collator('zh-CN').compare(a.name, b.name));
  }, [courses, searchTerm]);

  const openNew = () => {
    setCurrentCourse({}); // Empty object for new
    setIsModalOpen(true);
  };


  const openEdit = (course: Course) => {
    setCurrentCourse(course);
    setIsModalOpen(true);
  };

  const handleSave = (course: Course) => {
    if (currentCourse?.id) {
       onUpdate(courses.map(c => c.id === course.id ? course : c));
    } else {
       onUpdate([...courses, course]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      onUpdate(courses.filter(c => c.id !== id));
      setIsModalOpen(false);
    }
  };

  const exportCSV = () => {
    const header = "id,name,day,row,type,weeks\n";
    // Fix: Handle quotes properly in name
    const body = courses.map(c => `${c.id},"${c.name.replace(/"/g, '""')}",${c.day},${c.row},${c.type},"${c.weeks.join('|')}"`).join('\n');
    const blob = new Blob(["\ufeff" + header + body], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `schedule_backup_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        // Skip header if it looks like one
        const startIdx = lines[0].startsWith('id,') ? 1 : 0;
        
        const newCourses: Course[] = lines.slice(startIdx).map((line, idx) => {
          // Robust regex for CSV parsing handles quotes
          const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
          if (parts.length < 5) return null; // Invalid line

          // Clean function
          const clean = (s: string) => s.replace(/^"|"$/g, '').replace(/""/g, '"');
          
          // Re-assemble if simple split failed (simple fallback)
          // Actually, let's use the exact logic from before but wrapped safer
          const simpleParts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Previous logic was good
          
          const type = simpleParts[4] as CourseType;
          return {
            id: simpleParts[0] || Date.now().toString() + idx,
            name: clean(simpleParts[1]),
            day: parseInt(simpleParts[2]),
            row: parseInt(simpleParts[3]),
            type,
            weeks: clean(simpleParts[5]).split('|').map(w => parseInt(w)).filter(n => !isNaN(n)),
            color: type === CourseType.SSR ? "bg-rose-100 text-rose-700 border-rose-200" : "bg-blue-100 text-blue-700 border-blue-200"
          };
        }).filter(Boolean) as Course[];

        if (newCourses.length > 0) {
           if (confirm(`Found ${newCourses.length} courses. Overwrite existing data?`)) {
             onUpdate(newCourses);
           }
        } else {
           alert("Failed to parse CSV. Please check format.");
        }
      } catch (e) {
        alert("Error reading file.");
        console.error(e);
      }
    };
    reader.readAsText(file);
    // Reset inputs
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Action Bar */}
      {/* Top Action Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between flex-shrink-0">
         <div className="flex items-center gap-4 flex-1">
            <h2 className="text-lg font-black text-slate-800">DATA MANAGEMENT</h2>
            <div className="hidden sm:block h-8 w-[1px] bg-slate-100"></div>
            <div className="text-xs font-bold text-slate-400 italic hidden sm:block">Detailed Planner View</div>
         </div>
         <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
           <input type="file" ref={fileInputRef} onChange={handleImportCSV} className="hidden" accept=".csv" />
           <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs font-bold rounded-xl transition-colors text-center">Import CSV</button>
           <button onClick={exportCSV} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs font-bold rounded-xl transition-colors text-center">Export CSV</button>
           <button onClick={openNew} className="col-span-2 sm:col-span-1 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadowed transition-all flex items-center justify-center gap-2">
             <span>+ NEW COURSE</span>
           </button>
         </div>
      </div>

      {/* Unified Grid View - Fully Expanded */}
      <div className="bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shadow-inner flex flex-col relative shrink-0">
        <div className="flex flex-col">
           {/* Grid Header */}
           <div className="grid grid-cols-[30px_repeat(6,1fr)] bg-slate-50 border-b border-slate-200">
             <div className="h-8 flex items-center justify-center text-[7px] font-black text-slate-400">#</div>
             {DAYS.map((day, i) => (
               <div key={i} className="h-8 flex items-center justify-center border-l border-slate-100">
                 <span className="text-[10px] sm:text-xs font-black text-slate-600 uppercase">{day.label}</span>
               </div>
             ))}
           </div>

           {/* Grid Body - Auto Height based on content (min-height per row) */}
           <div className="grid grid-rows-6">
             {ROWS.map((rowLabel, rowIndex) => (
               <div key={rowIndex} className="grid grid-cols-[30px_repeat(6,1fr)] border-t border-slate-200 first:border-t-0 min-h-[80px]">
                 {/* Row Label */}
                 <div className="bg-slate-50/50 flex flex-col items-center justify-center border-r border-slate-200 sticky left-0 z-10">
                    <span className="text-[9px] font-black text-slate-700">{rowIndex + 1}</span>
                 </div>
                 
                 {/* Cells */}
                 {[0, 1, 2, 3, 4, 5].map(dayIndex => {
                   const cellCourses = courses.filter(c => c.day === dayIndex && c.row === rowIndex);
                   
                   return (
                     <div key={dayIndex} className="bg-white border-l border-slate-100 relative p-0.5 overflow-hidden group hover:bg-slate-50 transition-colors flex flex-col">
                       {/* 16-Week Grid Visualizer - 8 cols x 2 rows, filling the cell */}
                       <div 
                         className="flex-1 grid grid-cols-8 grid-rows-2 w-full h-full"
                         onDoubleClick={() => {
                            setCurrentCourse({ day: dayIndex, row: rowIndex, weeks: [] });
                            setIsModalOpen(true);
                         }}
                       >
                         {Array.from({length: 16}, (_, i) => {
                            const week = i + 1;
                            // Check if ANY course in this cell occupies this week
                            const occupyingCourse = cellCourses.find(c => c.weeks.includes(week));
                            const isActive = !!occupyingCourse;
                            const isSSR = occupyingCourse?.type === CourseType.SSR;
                            
                            return (
                              <div 
                                key={week} 
                                title={`Week ${week}${occupyingCourse ? `: ${occupyingCourse.name}` : ''}`}
                                className={`
                                  flex items-center justify-center border-[0.5px] border-white transition-all
                                  ${isActive 
                                     ? (isSSR ? 'bg-rose-400' : 'bg-blue-400') 
                                     : 'bg-slate-100 hover:bg-slate-200 cursor-pointer'
                                   }
                                `}
                              >
                                {/* No number */}
                              </div>
                            );
                         })}
                       </div>
                     </div>
                   );
                 })}
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Course Cards Section (Bottom) - Fully Expanded */}
      <div className="flex-shrink-0 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col mb-20">
         <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            ALL COURSES
            <div className="h-[1px] flex-1 bg-slate-100"></div>
            <span className="text-[10px] text-slate-300">{courses.length} items</span>
         </h3>
         <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredCourses.map(course => (
                 <div 
                   key={course.id} 
                   onClick={() => openEdit(course)}
                   className={`
                     cursor-pointer rounded-xl p-3 border hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-1
                     ${course.type === CourseType.SSR ? 'bg-rose-50 border-rose-100 hover:border-rose-200' : 'bg-blue-50 border-blue-100 hover:border-blue-200'}
                   `}
                 >
                    <div className="flex justify-between items-center">
                       <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${course.type === CourseType.SSR ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                         {course.type === CourseType.SSR ? 'SSR' : 'REQ'}
                       </span>
                       <span className="text-[9px] font-bold text-slate-400">{course.weeks.length}w</span>
                    </div>
                    <div className="text-xs font-black text-slate-700 truncate">{course.name}</div>
                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
                        <span>{DAYS[course.day].label} #{course.row + 1}</span>
                    </div>
                 </div>
              ))}
         </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <CourseModal 
          course={currentCourse} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default DataEditor;
