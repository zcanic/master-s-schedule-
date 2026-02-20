import { Course, CourseType } from './types';

const MIN_DAY = 0;
const MAX_DAY = 5;
const MIN_ROW = 0;
const MAX_ROW = 5;
const MIN_WEEK = 1;
const MAX_WEEK = 16;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const toInt = (value: unknown): number | null => {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return null;
  return Math.trunc(num);
};

const normalizeWeeks = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];

  const weeks = value
    .map(toInt)
    .filter((week): week is number => week !== null && week >= MIN_WEEK && week <= MAX_WEEK);

  return [...new Set(weeks)].sort((a, b) => a - b);
};

const normalizeType = (value: unknown): CourseType => {
  return value === CourseType.SSR ? CourseType.SSR : CourseType.NORMAL;
};

export const normalizeCourse = (value: unknown, fallbackId: string): Course | null => {
  if (!isRecord(value)) return null;

  const name = typeof value.name === 'string' ? value.name.trim() : '';
  const day = toInt(value.day);
  const row = toInt(value.row);
  const weeks = normalizeWeeks(value.weeks);

  if (!name || day === null || row === null || weeks.length === 0) return null;
  if (day < MIN_DAY || day > MAX_DAY) return null;
  if (row < MIN_ROW || row > MAX_ROW) return null;

  const id = typeof value.id === 'string' && value.id.trim() ? value.id : fallbackId;
  const color = typeof value.color === 'string' && value.color.trim()
    ? value.color
    : normalizeType(value.type) === CourseType.SSR
      ? 'bg-rose-100 text-rose-700 border-rose-200'
      : 'bg-blue-100 text-blue-700 border-blue-200';

  const location = typeof value.location === 'string' && value.location.trim()
    ? value.location.trim()
    : undefined;

  return {
    id,
    name,
    day,
    row,
    weeks,
    type: normalizeType(value.type),
    color,
    location,
  };
};

export const normalizeCourses = (value: unknown): Course[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => normalizeCourse(item, `imported-${Date.now()}-${index}`))
    .filter((course): course is Course => course !== null);
};
