
import { Course, CourseType } from './types';

export const DAYS = [
  { label: 'Mon', sub: '周一' },
  { label: 'Tue', sub: '周二' },
  { label: 'Wed', sub: '周三' },
  { label: 'Thu', sub: '周四' },
  { label: 'Fri', sub: '周五' },
  { label: 'Sat', sub: '周六' },
];

export const ROWS = [
  { label: '一', sub: 'Morning' },
  { label: '二', sub: 'Morning' },
  { label: '三', sub: 'Afternoon' },
  { label: '四', sub: 'Afternoon' },
  { label: '五', sub: 'Evening' },
  { label: '六', sub: 'Night/Wk' },
];

const range = (start: number, end: number): number[] => {
  const arr = [];
  for (let i = start; i <= end; i++) arr.push(i);
  return arr;
};

export const COURSES_DATA: Course[] = [
  // --- Monday (0) ---
  { id: '1', name: "大数据", day: 0, row: 0, weeks: range(9, 16), type: CourseType.NORMAL, color: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: '2', name: "数据库", day: 0, row: 2, weeks: range(1, 8), type: CourseType.NORMAL, color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { id: '3', name: "商务数分", day: 0, row: 2, weeks: range(9, 16), type: CourseType.NORMAL, color: "bg-purple-100 text-purple-700 border-purple-200" },
  { id: '4', name: "算法", day: 0, row: 3, weeks: range(9, 16), type: CourseType.NORMAL, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { id: '5', name: "工程经济", day: 0, row: 4, weeks: range(1, 8), type: CourseType.NORMAL, color: "bg-orange-100 text-orange-700 border-orange-200" },
  { id: '6', name: "大数据基础设施", day: 0, row: 4, weeks: range(9, 16), type: CourseType.SSR, color: "bg-rose-100 text-rose-700 border-rose-200" },
  { id: '7', name: "AI创业", day: 0, row: 5, weeks: range(9, 16), type: CourseType.SSR, color: "bg-rose-100 text-rose-700 border-rose-200" },

  // --- Tuesday (1) ---
  { id: '8', name: "供应链", day: 1, row: 0, weeks: range(9, 16), type: CourseType.NORMAL, color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  { id: '9', name: "口语", day: 1, row: 1, weeks: [1,3,5,7,9,11,13,15], type: CourseType.NORMAL, color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { id: '10', name: "幸福学", day: 1, row: 2, weeks: range(11, 16), type: CourseType.SSR, color: "bg-rose-100 text-rose-700 border-rose-200" },
  { id: '11', name: "统计", day: 1, row: 3, weeks: range(1, 8), type: CourseType.NORMAL, color: "bg-slate-200 text-slate-700 border-slate-300" },
  { id: '12', name: "信息资源", day: 1, row: 3, weeks: range(9, 16), type: CourseType.NORMAL, color: "bg-teal-100 text-teal-700 border-teal-200" },
  { id: '13', name: "职业", day: 1, row: 5, weeks: range(1, 4), type: CourseType.NORMAL, color: "bg-gray-100 text-gray-600 border-gray-200" },

  // --- Wednesday (2) ---
  { id: '14', name: "大数据", day: 2, row: 0, weeks: range(9, 16), type: CourseType.NORMAL, color: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: '15', name: "日本文学", day: 2, row: 1, weeks: [1,2,3,4, 6,7,8,9, 11,12,13,14, 16], type: CourseType.SSR, color: "bg-pink-100 text-pink-700 border-pink-200" },
  { id: '16', name: "交响", day: 2, row: 2, weeks: range(1, 16), type: CourseType.SSR, color: "bg-rose-100 text-rose-700 border-rose-200" },
  { id: '17', name: "形势与政策", day: 2, row: 3, weeks: range(5, 8), type: CourseType.NORMAL, color: "bg-red-50 text-red-700 border-red-200" },
  { id: '18', name: "算法", day: 2, row: 3, weeks: range(9, 16), type: CourseType.NORMAL, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { id: '19', name: "工程经济", day: 2, row: 4, weeks: range(1, 8), type: CourseType.NORMAL, color: "bg-orange-100 text-orange-700 border-orange-200" },
  { id: '20', name: "大数据基础设施", day: 2, row: 4, weeks: range(9, 16), type: CourseType.SSR, color: "bg-rose-100 text-rose-700 border-rose-200" },

  // --- Thursday (3) ---
  { id: '21', name: "供应链", day: 3, row: 0, weeks: range(9, 16), type: CourseType.NORMAL, color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  { id: '22', name: "工程经济", day: 3, row: 0, weeks: range(5, 8), type: CourseType.NORMAL, color: "bg-orange-100 text-orange-700 border-orange-200" },
  { id: '23', name: "工程经济", day: 3, row: 1, weeks: range(5, 8), type: CourseType.NORMAL, color: "bg-orange-100 text-orange-700 border-orange-200" },
  { id: '24', name: "商务数分", day: 3, row: 1, weeks: range(9, 16), type: CourseType.NORMAL, color: "bg-purple-100 text-purple-700 border-purple-200" },
  { id: '25', name: "数据库", day: 3, row: 2, weeks: range(1, 8), type: CourseType.NORMAL, color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { id: '26', name: "商务数分", day: 3, row: 2, weeks: range(9, 16), type: CourseType.NORMAL, color: "bg-purple-100 text-purple-700 border-purple-200" },
  { id: '27', name: "密码学", day: 3, row: 5, weeks: range(1, 16), type: CourseType.SSR, color: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200" },
  { id: '28', name: "大数据(夜)", day: 3, row: 5, weeks: range(1, 16), type: CourseType.SSR, color: "bg-blue-100 text-blue-700 border-blue-200" },

  // --- Friday (4) ---
  { id: '29', name: "信息资源", day: 4, row: 0, weeks: range(9, 16), type: CourseType.NORMAL, color: "bg-teal-100 text-teal-700 border-teal-200" },
  { id: '30', name: "学术英语", day: 4, row: 1, weeks: range(1, 16), type: CourseType.NORMAL, color: "bg-lime-100 text-lime-700 border-lime-200" },
  { id: '31', name: "统计", day: 4, row: 2, weeks: range(1, 8), type: CourseType.NORMAL, color: "bg-slate-200 text-slate-700 border-slate-300" },
  { id: '32', name: "大数据", day: 4, row: 2, weeks: range(9, 16), type: CourseType.NORMAL, color: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: '33', name: "数据库", day: 4, row: 3, weeks: range(5, 8), type: CourseType.NORMAL, color: "bg-indigo-100 text-indigo-700 border-indigo-200" }, 
  { id: '34', name: "算法", day: 4, row: 3, weeks: range(12, 15), type: CourseType.NORMAL, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { id: '35', name: "数据库", day: 4, row: 4, weeks: range(5, 8), type: CourseType.NORMAL, color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { id: '36', name: "算法", day: 4, row: 4, weeks: range(12, 15), type: CourseType.NORMAL, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
];
