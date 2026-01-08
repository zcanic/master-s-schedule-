
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
  { id: '1', name: "大数据管理方法与应用I", day: 0, row: 0, weeks: [9,10,11,12,13,14,15,16], type: CourseType.NORMAL, color: "#8FA3AD", location: "逸302" },
  { id: '2', name: "供应链管理基础", day: 1, row: 0, weeks: [9,10,11,12,13,14,15,16], type: CourseType.NORMAL, color: "#7D8B96", location: "教301" },
  { id: '3', name: "大数据管理方法与应用I", day: 2, row: 0, weeks: [9,10,11,12,13,14,15,16], type: CourseType.NORMAL, color: "#8FA3AD", location: "逸302" },
  { id: '4', name: "工程经济学", day: 3, row: 0, weeks: [5,6,7,8], type: CourseType.NORMAL, color: "#A4B0BE", location: "管703" },
  { id: '5', name: "信息资源管理", day: 4, row: 0, weeks: [13,14,15,16], type: CourseType.NORMAL, color: "#778CA3", location: "管601" },
  { id: '6', name: "供应链管理基础", day: 3, row: 0, weeks: [9,10,11,12,13,14,15,16], type: CourseType.NORMAL, color: "#7D8B96", location: "教201" },
  { id: '7', name: "信息资源管理", day: 4, row: 0, weeks: [9,10,11,12], type: CourseType.NORMAL, color: "#778CA3", location: "逸706" },
  { id: '8', name: "离散数学", day: 0, row: 1, weeks: [9,10,11,12,13,14,15,16], type: CourseType.SSR, color: "#6F869A", location: "管502" },
  { id: '9', name: "英语口语II", day: 1, row: 1, weeks: [1,3,5,7,9,11,13,15], type: CourseType.NORMAL, color: "#899E96", location: "管502" },
  { id: '10', name: "日本文学名著赏析", day: 2, row: 1, weeks: [1,2,3,4,6,7,8,9,11,12,13,14,16], type: CourseType.SSR, color: "#6B7C85", location: "教211" },
  { id: '11', name: "工程经济学", day: 3, row: 1, weeks: [5,6,7,8], type: CourseType.NORMAL, color: "#A4B0BE", location: "管703" },
  { id: '12', name: "学术英语阅读与写作（理工类）", day: 4, row: 1, weeks: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], type: CourseType.NORMAL, color: "#9FB6C9", location: "管505" },
  { id: '13', name: "商务数据分析理论与方法", day: 3, row: 1, weeks: [9,10,11,12,13,14,15,16], type: CourseType.NORMAL, color: "#D4A5A5", location: "逸504" },
  { id: '14', name: "商务数据分析理论与方法", day: 0, row: 2, weeks: [9,10,11,12,13,14,15,16], type: CourseType.NORMAL, color: "#D4A5A5", location: "逸501" },
  { id: '15', name: "外语学习者的幸福学", day: 1, row: 2, weeks: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], type: CourseType.SSR, color: "#CC998D", location: "教211" },
  { id: '16', name: "交响音乐欣赏", day: 2, row: 2, weeks: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], type: CourseType.SSR, color: "#C49292", location: "逸707" },
  { id: '17', name: "商务数据分析理论与方法", day: 3, row: 2, weeks: [9,10,11,12,13,14,15,16], type: CourseType.NORMAL, color: "#D4A5A5", location: "管601" },
  { id: '18', name: "大数据管理方法与应用I", day: 4, row: 2, weeks: [9,10,11,12,13,14,15,16], type: CourseType.NORMAL, color: "#8FA3AD", location: "逸304" },
  { id: '19', name: "数据库原理", day: 0, row: 2, weeks: [1,2,3,4,5,6,7,8], type: CourseType.NORMAL, color: "#EAC7C7", location: "逸302" },
  { id: '20', name: "数据库原理", day: 3, row: 2, weeks: [1,2,3,4,5,6,7,8], type: CourseType.NORMAL, color: "#EAC7C7", location: "逸302" },
  { id: '21', name: "应用统计学", day: 4, row: 2, weeks: [1,2,3,4,5,6,7,8], type: CourseType.NORMAL, color: "#BC8F8F", location: "逸706" },
  { id: '22', name: "数据结构与算法分析", day: 0, row: 3, weeks: [9,10,11,12,13,14,15,16], type: CourseType.NORMAL, color: "#BF8679", location: "逸302" },
  { id: '23', name: "信息资源管理", day: 1, row: 3, weeks: [9,10,11,12,13,14,15,16], type: CourseType.NORMAL, color: "#778CA3", location: "逸302" },
  { id: '24', name: "数据结构与算法分析", day: 2, row: 3, weeks: [9,10,11,12,13,14,15,16], type: CourseType.NORMAL, color: "#BF8679", location: "逸302" },
  { id: '25', name: "数据结构与算法分析", day: 4, row: 3, weeks: [12,13,14,15], type: CourseType.NORMAL, color: "#BF8679", location: "管601" },
  { id: '26', name: "应用统计学", day: 1, row: 3, weeks: [1,2,3,4,5,6,7,8], type: CourseType.NORMAL, color: "#BC8F8F", location: "逸706" },
  { id: '27', name: "形势与政策4", day: 2, row: 3, weeks: [5,6,7,8], type: CourseType.NORMAL, color: "#D1B3B3", location: "逸705" },
  { id: '28', name: "数据库原理", day: 4, row: 3, weeks: [5,6,7,8], type: CourseType.NORMAL, color: "#EAC7C7", location: "管609" },
  { id: '29', name: "大数据基础设施", day: 0, row: 4, weeks: [9,10,11,12,13,14,15,16], type: CourseType.SSR, color: "#D4A094", location: "管512" },
  { id: '30', name: "大数据基础设施", day: 2, row: 4, weeks: [9,10,11,12,13,14,15,16], type: CourseType.SSR, color: "#D4A094", location: "管512" },
  { id: '31', name: "离散数学", day: 3, row: 4, weeks: [9,10,11,12,13,14,15,16], type: CourseType.SSR, color: "#6F869A", location: "管502" },
  { id: '32', name: "数据结构与算法分析", day: 4, row: 4, weeks: [12,13,14,15], type: CourseType.NORMAL, color: "#BF8679", location: "管601" },
  { id: '33', name: "工程经济学", day: 0, row: 4, weeks: [1,2,3,4,5,6,7,8], type: CourseType.NORMAL, color: "#A4B0BE", location: "逸302" },
  { id: '34', name: "工程经济学", day: 2, row: 4, weeks: [1,2,3,4,5,6,7,8], type: CourseType.NORMAL, color: "#A4B0BE", location: "逸302" },
  { id: '35', name: "数据库原理", day: 4, row: 4, weeks: [5,6,7,8], type: CourseType.NORMAL, color: "#EAC7C7", location: "管609" },
  { id: '36', name: "大学生职业发展与就业指导II", day: 1, row: 5, weeks: [1,2,3,4], type: CourseType.NORMAL, color: "#9CAF88", location: "逸302" },
];

export const COURSE_COLOR_PALETTE = [
  // Morandi Blues & Greys
  '#8FA3AD', '#7D8B96', '#A4B0BE', '#778CA3', '#6F869A', '#899E96', '#6B7C85', '#9FB6C9',
  // Morandi Pinks & Reds
  '#D4A5A5', '#CC998D', '#C49292', '#EAC7C7', '#BC8F8F', '#BF8679', '#D1B3B3', '#D4A094',
  // Morandi Greens
  '#9CAF88', '#8F9E8B', '#A7B6A3', '#88A6A8', '#7C8B74', '#99B7B9', '#93A69A', '#727C70',
  // Morandi Earth & Yellows
  '#C7B299', '#D4C4A8', '#B9AFA1', '#C2B280', '#DBC3A3', '#A89F91', '#D2B48C', '#E0C097',
  // Morandi Purples
  '#A89FB1', '#978D9E', '#B5A8BE', '#8E8296', '#AAA0B0', '#958DA5', '#B8A6C0', '#A394B0'
];
