import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import XLSX from 'xlsx';

const SAMPLE_DIR = path.resolve('samples/xlsx');
const FILES = [
  path.join(SAMPLE_DIR, '学生课表_这学期.xlsx'),
  path.join(SAMPLE_DIR, '学生课表_上学期.xlsx'),
];

const CourseType = {
  NORMAL: 'normal',
  SSR: 'ssr',
};

const DAYS = [0, 1, 2, 3, 4, 5];

const COURSE_COLOR_PALETTE = [
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-teal-100 text-teal-700 border-teal-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200',
  'bg-lime-100 text-lime-700 border-lime-200',
];

const MIN_DAY = 0;
const MAX_DAY = 5;
const MIN_ROW = 0;
const MAX_ROW = 5;
const MIN_WEEK = 1;
const MAX_WEEK = 16;

const normalizeSemesterName = (name) => String(name || '').trim().normalize('NFKC').toLowerCase();

const normalizeCourse = (value, fallbackId) => {
  if (!value || typeof value !== 'object') return null;
  const name = typeof value.name === 'string' ? value.name.trim() : '';
  const day = Number.isFinite(Number(value.day)) ? Math.trunc(Number(value.day)) : null;
  const row = Number.isFinite(Number(value.row)) ? Math.trunc(Number(value.row)) : null;
  const weeks = Array.isArray(value.weeks)
    ? [...new Set(value.weeks.map((w) => Math.trunc(Number(w))).filter((w) => Number.isFinite(w) && w >= MIN_WEEK && w <= MAX_WEEK))].sort((a, b) => a - b)
    : [];

  if (!name || day === null || row === null || weeks.length === 0) return null;
  if (day < MIN_DAY || day > MAX_DAY) return null;
  if (row < MIN_ROW || row > MAX_ROW) return null;

  const type = value.type === CourseType.SSR ? CourseType.SSR : CourseType.NORMAL;
  const id = typeof value.id === 'string' && value.id.trim() ? value.id : fallbackId;
  const color = typeof value.color === 'string' && value.color.trim()
    ? value.color
    : type === CourseType.SSR
      ? 'bg-rose-100 text-rose-700 border-rose-200'
      : 'bg-blue-100 text-blue-700 border-blue-200';
  const location = typeof value.location === 'string' && value.location.trim() ? value.location.trim() : undefined;

  return { id, name, day, row, weeks, type, color, location };
};

const normalizeCourses = (courses) => {
  if (!Array.isArray(courses)) return [];
  return courses
    .map((c, i) => normalizeCourse(c, `imported-${Date.now()}-${i}`))
    .filter(Boolean);
};

const normalizeSemesters = (value) => {
  if (!Array.isArray(value)) return [];
  const now = new Date().toISOString();

  return value
    .map((item, index) => {
      if (typeof item !== 'object' || item === null) return null;
      const rec = item;
      const courses = normalizeCourses(rec.courses);
      const name = typeof rec.name === 'string' && rec.name.trim() ? rec.name.trim() : `学期 ${index + 1}`;
      const id = typeof rec.id === 'string' && rec.id.trim() ? rec.id : `semester-${index + 1}`;
      const snapshotsRaw = Array.isArray(rec.snapshots) ? rec.snapshots : [];
      const snapshots = snapshotsRaw
        .map((snap) => {
          if (typeof snap !== 'object' || snap === null) return null;
          const s = snap;
          const snapCourses = normalizeCourses(s.courses);
          return {
            id: typeof s.id === 'string' ? s.id : `snap-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
            createdAt: typeof s.createdAt === 'string' ? s.createdAt : now,
            reason: typeof s.reason === 'string' ? s.reason : '历史快照',
            courses: snapCourses,
          };
        })
        .filter(Boolean);

      if (snapshots.length === 0) {
        snapshots.push({
          id: `snap-${Date.now()}-${index}`,
          createdAt: now,
          reason: '初始化',
          courses,
        });
      }

      return {
        id,
        name,
        courses,
        snapshots,
        createdAt: typeof rec.createdAt === 'string' ? rec.createdAt : now,
        updatedAt: typeof rec.updatedAt === 'string' ? rec.updatedAt : now,
      };
    })
    .filter(Boolean);
};

const parseStoredStore = (text) => {
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
    const rec = parsed;
    const parsedVersion = typeof rec.version === 'number' ? rec.version : null;
    if (parsedVersion !== null && parsedVersion > 8) return null;

    const semesters = normalizeSemesters(rec.semesters);
    if (semesters.length === 0) return null;

    const activeRaw = typeof rec.activeSemesterId === 'string' ? rec.activeSemesterId : semesters[0].id;
    const hasActive = semesters.some((s) => s.id === activeRaw);
    return {
      version: 8,
      activeSemesterId: hasActive ? activeRaw : semesters[0].id,
      semesters,
    };
  } catch {
    return null;
  }
};

const parseExcel = (filePath) => {
  const data = fs.readFileSync(filePath);
  const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  const newCourses = [];
  const courseColorMap = new Map();
  let currentSlot = -1;

  for (let r = 2; r < jsonData.length; r++) {
    const rowData = jsonData[r];
    if (!rowData || rowData.length === 0) continue;

    const col0 = String(rowData[0] || '');
    if (col0.includes('第1节')) currentSlot = 0;
    else if (col0.includes('第2节')) currentSlot = 1;
    else if (col0.includes('第3节')) currentSlot = 2;
    else if (col0.includes('第4节')) currentSlot = 3;
    else if (col0.includes('第5节')) currentSlot = 4;
    else if (col0.includes('第6节')) currentSlot = 5;
    else if (col0.trim().length > 0) currentSlot = -1;

    if (currentSlot === -1 || currentSlot > 5) continue;

    for (let dayIdx = 0; dayIdx < DAYS.length; dayIdx++) {
      const cellContent = rowData[dayIdx + 1];
      if (!cellContent || typeof cellContent !== 'string' || !cellContent.trim()) continue;

      const lines = cellContent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) continue;

      const name = lines[0];
      const weeksLine = lines.find((l) => l.includes('周'));
      const locationLine = lines.find((l) => (l.startsWith('【') || l.includes('楼') || l.includes('室')) && l !== name && l !== weeksLine);

      let weeks = [];
      if (weeksLine) {
        const cleanWeeks = weeksLine.replace(/周.*$/, '').replace(/\[.*\]/, '');
        const parts = cleanWeeks.split(/,|，/);
        for (const part of parts) {
          let rangeWeeks = [];
          const isOdd = part.includes('单');
          const isEven = part.includes('双');
          const cleanPart = part.replace(/单|双|节/g, '');
          if (cleanPart.includes('-')) {
            const [start, end] = cleanPart.split('-').map(Number);
            for (let i = start; i <= end; i++) rangeWeeks.push(i);
          } else {
            const w = Number.parseInt(cleanPart, 10);
            if (!Number.isNaN(w)) rangeWeeks.push(w);
          }
          if (isOdd) rangeWeeks = rangeWeeks.filter((w) => w % 2 !== 0);
          if (isEven) rangeWeeks = rangeWeeks.filter((w) => w % 2 === 0);
          weeks.push(...rangeWeeks);
        }
      } else {
        weeks = Array.from({ length: 16 }, (_, i) => i + 1);
      }

      weeks = [...new Set(weeks)].sort((a, b) => a - b);

      let color = courseColorMap.get(name);
      if (!color) {
        color = COURSE_COLOR_PALETTE[courseColorMap.size % COURSE_COLOR_PALETTE.length];
        courseColorMap.set(name, color);
      }

      let cleanLoc = locationLine || '未知地点';
      cleanLoc = cleanLoc.replace(/【.*?】/g, '').replace(/\(.*?\)/g, '').replace(/（.*?）/g, '').trim();
      const locMatch = cleanLoc.match(/^([\u4e00-\u9fa5]+).*?([A-Za-z0-9\-]+)$/);
      if (locMatch) {
        const building = locMatch[1];
        const room = locMatch[2];
        if (building.length > 0) cleanLoc = building[0] + room;
      }

      const SSR_NAMES = new Set(['外语学习者的幸福学', '大数据基础设施', '离散数学', '交响音乐欣赏', '日本文学名著赏析']);
      const type = SSR_NAMES.has(name) ? CourseType.SSR : CourseType.NORMAL;

      newCourses.push({
        id: `${Date.now()}${Math.random().toString().slice(2, 8)}`,
        name,
        day: dayIdx,
        row: currentSlot,
        weeks,
        type,
        color,
        location: cleanLoc,
      });
    }
  }

  return normalizeCourses(newCourses);
};

const createSemester = (name, courses) => {
  const now = new Date().toISOString();
  return {
    id: `${name}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    courses,
    snapshots: [{ id: `snap-${Date.now()}`, createdAt: now, reason: '初始化', courses }],
    createdAt: now,
    updatedAt: now,
  };
};

const buildStore = () => {
  const sem = createSemester('2026年1学期', []);
  return { version: 8, activeSemesterId: sem.id, semesters: [sem] };
};

const appendSnapshot = (semester, reason, courses) => {
  const now = new Date().toISOString();
  return {
    ...semester,
    courses,
    snapshots: [{ id: `snap-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`, createdAt: now, reason, courses }, ...semester.snapshots].slice(0, 30),
    updatedAt: now,
  };
};

const buildUniqueSemesterName = (baseName, semesters) => {
  const trimmed = baseName.trim() || '未命名学期';
  const existing = new Set(semesters.map((s) => s.name));
  if (!existing.has(trimmed)) return trimmed;
  let n = 2;
  while (existing.has(`${trimmed} (${n})`)) n += 1;
  return `${trimmed} (${n})`;
};

const importFromExternal = (store, importedCourses, importedSemesterName) => {
  const active = store.semesters.find((s) => s.id === store.activeSemesterId) || store.semesters[0];
  const importedName = importedSemesterName ? normalizeSemesterName(importedSemesterName) : '';
  const activeName = active?.name ? normalizeSemesterName(active.name) : '';

  if (importedName && importedName !== activeName) {
    const uniqueName = buildUniqueSemesterName(importedSemesterName, store.semesters);
    const newSem = createSemester(uniqueName, importedCourses);
    return { ...store, activeSemesterId: newSem.id, semesters: [newSem, ...store.semesters] };
  }

  return {
    ...store,
    semesters: store.semesters.map((s) => (s.id === store.activeSemesterId ? appendSnapshot(s, '课程更新', importedCourses) : s)),
  };
};

const importFromVoidDropPayload = (store, text) => {
  const parsedStore = parseStoredStore(text);
  if (parsedStore) {
    return {
      ok: true,
      count: parsedStore.semesters.reduce((acc, s) => acc + s.courses.length, 0),
      store: parsedStore,
      mode: 'full-store',
    };
  }
  return {
    ok: false,
    count: 0,
    store,
    mode: 'invalid',
  };
};

const stable = (obj) => JSON.stringify(obj, Object.keys(obj).sort());

const digestStore = (store) => {
  const simplified = {
    version: store.version,
    activeSemesterId: store.activeSemesterId,
    semesters: store.semesters.map((s) => ({
      name: s.name,
      courses: s.courses
        .map((c) => ({ id: c.id, name: c.name, day: c.day, row: c.row, weeks: c.weeks, type: c.type, location: c.location || '' }))
        .sort((a, b) => `${a.name}-${a.day}-${a.row}-${a.id}`.localeCompare(`${b.name}-${b.day}-${b.row}-${b.id}`, 'zh-CN')),
      snapshots: s.snapshots.length,
    })).sort((a, b) => a.name.localeCompare(b.name, 'zh-CN')),
  };
  return crypto.createHash('sha256').update(stable(simplified)).digest('hex');
};

const printCourses = (title, courses) => {
  console.log(`\n=== ${title} ===`);
  console.log(`课程总数: ${courses.length}`);
  const sorted = [...courses].sort((a, b) => `${a.day}-${a.row}-${a.name}`.localeCompare(`${b.day}-${b.row}-${b.name}`, 'zh-CN'));
  for (const c of sorted.slice(0, 12)) {
    const weeks = c.weeks.length > 8 ? `${c.weeks.slice(0, 8).join(',')}...` : c.weeks.join(',');
    console.log(`- ${c.name} | day=${c.day} row=${c.row} weeks=[${weeks}] type=${c.type} loc=${c.location || ''}`);
  }
  if (sorted.length > 12) console.log(`... (其余 ${sorted.length - 12} 门课程省略)`);
};

const main = () => {
  for (const f of FILES) {
    if (!fs.existsSync(f)) {
      throw new Error(`样本文件不存在: ${f}`);
    }
  }

  const thisSemCourses = parseExcel(FILES[0]);
  const lastSemCourses = parseExcel(FILES[1]);

  printCourses('导入结果: 这学期.xlsx', thisSemCourses);
  printCourses('导入结果: 上学期.xlsx', lastSemCourses);

  let store = buildStore();
  store = importFromExternal(store, thisSemCourses, '2026年1学期');
  store = importFromExternal(store, lastSemCourses, '2025年2学期');

  console.log('\n=== 时间线检查 ===');
  console.log(`学期数量: ${store.semesters.length}`);
  for (const s of store.semesters) {
    console.log(`- ${s.name} | courses=${s.courses.length} | snapshots=${s.snapshots.length}`);
  }

  const payload = JSON.stringify(store);
  const restored = JSON.parse(payload);
  const restoredByStoreParser = parseStoredStore(payload);
  if (!restoredByStoreParser) {
    throw new Error('store parser failed to parse payload');
  }

  const beforeHash = digestStore(store);
  const afterHash = digestStore(restored);
  const parserHash = digestStore(restoredByStoreParser);
  const voidImported = importFromVoidDropPayload(store, payload);
  const voidHash = digestStore(voidImported.store);

  console.log('\n=== 上传/下载(序列化轮转)一致性 ===');
  console.log(`beforeHash=${beforeHash}`);
  console.log(`afterHash =${afterHash}`);
  console.log(`parserHash=${parserHash}`);
  console.log(`JSON轮转一致性: ${beforeHash === afterHash ? 'PASS' : 'FAIL'}`);
  console.log(`Store解析一致性: ${beforeHash === parserHash ? 'PASS' : 'FAIL'}`);
  console.log(`Void下载模式: ${voidImported.mode}`);
  console.log(`Void下载课程数: ${voidImported.count}`);
  console.log(`voidHash  =${voidHash}`);
  console.log(`Void上传下载一致性: ${beforeHash === voidHash ? 'PASS' : 'FAIL'}`);

  if (!voidImported.ok || beforeHash !== afterHash || beforeHash !== parserHash || beforeHash !== voidHash) {
    throw new Error('轮转前后数据存在差异');
  }
};

main();
