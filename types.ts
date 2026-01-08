
export enum CourseType {
  NORMAL = 'normal',
  SSR = 'ssr',
}

export interface Course {
  id: string;
  name: string;
  day: number; // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat
  row: number; // 0-5
  weeks: number[];
  type: CourseType;
  color: string;
  location?: string;
}

export type AppMode = 'schedule' | 'review' | 'viz3d' | 'metro' | 'editor';

export interface WeeklyIntensity {
  week: number;
  count: number;
}
