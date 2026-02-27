import { useCallback, useEffect, useMemo, useState } from 'react';
import { Course, CoursesStoreSchema, SemesterData } from '../types';
import { normalizeCourses } from '../courseValidation';

interface UseCoursesStoreOptions {
  storageKey: string;
  defaultData: Course[];
  voidKeyStorageKey: string;
  voidApiBase?: string;
}

const CURRENT_STORE_VERSION = 8;

const readStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn(`Failed to read ${key} from localStorage.`);
    return null;
  }
};

const writeStorage = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn(`Failed to write ${key} to localStorage.`);
    return false;
  }
};

const backupStorage = (key: string, value: string, tag: string): void => {
  const backupKey = `${key}__${tag}_${Date.now()}`;
  writeStorage(backupKey, value);
};

const parseStoredCourses = (text: string): Course[] | null => {
  try {
    const parsed: unknown = JSON.parse(text);
    if (!Array.isArray(parsed)) return null;

    const normalized = normalizeCourses(parsed);
    if (parsed.length > 0 && normalized.length === 0) return null;

    return normalized;
  } catch (e) {
    return null;
  }
};

const createSemesterId = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const term = m >= 8 ? 1 : 2;
  return `${y}-${term}-${Math.random().toString(36).slice(2, 6)}`;
};

const createSemester = (name: string, courses: Course[]): SemesterData => {
  const now = new Date().toISOString();
  return {
    id: createSemesterId(),
    name,
    courses,
    snapshots: [
      {
        id: `snap-${Date.now()}`,
        createdAt: now,
        reason: '初始化',
        courses,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
};

const buildUniqueSemesterName = (baseName: string, semesters: SemesterData[]): string => {
  const trimmed = baseName.trim() || '未命名学期';
  const existing = new Set(semesters.map((s) => s.name));
  if (!existing.has(trimmed)) return trimmed;

  let n = 2;
  while (existing.has(`${trimmed} (${n})`)) {
    n += 1;
  }
  return `${trimmed} (${n})`;
};

const normalizeSemesterName = (name: string): string => name.trim().normalize('NFKC').toLowerCase();

const createDefaultStore = (defaultData: Course[]): CoursesStoreSchema => {
  const semester = createSemester('2026年1学期', defaultData);
  return {
    version: CURRENT_STORE_VERSION,
    activeSemesterId: semester.id,
    semesters: [semester],
  };
};

const normalizeSemesters = (value: unknown): SemesterData[] => {
  if (!Array.isArray(value)) return [];
  const now = new Date().toISOString();

  return value
    .map((item, index): SemesterData | null => {
      if (typeof item !== 'object' || item === null) return null;
      const rec = item as Record<string, unknown>;
      const courses = normalizeCourses(rec.courses);
      const name = typeof rec.name === 'string' && rec.name.trim() ? rec.name.trim() : `学期 ${index + 1}`;
      const id = typeof rec.id === 'string' && rec.id.trim() ? rec.id : `semester-${index + 1}`;
      const snapshotsRaw = Array.isArray(rec.snapshots) ? rec.snapshots : [];
      const snapshots = snapshotsRaw
        .map((snap): SemesterData['snapshots'][number] | null => {
          if (typeof snap !== 'object' || snap === null) return null;
          const s = snap as Record<string, unknown>;
          const snapCourses = normalizeCourses(s.courses);
          return {
            id: typeof s.id === 'string' ? s.id : `snap-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
            createdAt: typeof s.createdAt === 'string' ? s.createdAt : now,
            reason: typeof s.reason === 'string' ? s.reason : '历史快照',
            courses: snapCourses,
          };
        })
        .filter((v): v is SemesterData['snapshots'][number] => v !== null);

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
    .filter((v): v is SemesterData => v !== null);
};

const parseStoredStore = (text: string, defaultData: Course[]): CoursesStoreSchema | null => {
  try {
    const parsed: unknown = JSON.parse(text);

    if (Array.isArray(parsed)) {
      const legacyCourses = normalizeCourses(parsed);
      const legacy = createSemester('Legacy 导入学期', legacyCourses.length > 0 ? legacyCourses : defaultData);
      return {
        version: CURRENT_STORE_VERSION,
        activeSemesterId: legacy.id,
        semesters: [legacy],
      };
    }

    if (typeof parsed === 'object' && parsed !== null) {
      const rec = parsed as Record<string, unknown>;
      const parsedVersion = typeof rec.version === 'number' ? rec.version : null;
      if (parsedVersion !== null && parsedVersion > CURRENT_STORE_VERSION) {
        console.warn(`Unsupported store version: ${parsedVersion}`);
        return null;
      }

      const semesters = normalizeSemesters(rec.semesters);
      if (semesters.length === 0) return null;

      const activeRaw = typeof rec.activeSemesterId === 'string' ? rec.activeSemesterId : semesters[0].id;
      const hasActive = semesters.some((s) => s.id === activeRaw);

      return {
        version: CURRENT_STORE_VERSION,
        activeSemesterId: hasActive ? activeRaw : semesters[0].id,
        semesters,
      };
    }

    return null;
  } catch (e) {
    return null;
  }
};

const appendSnapshot = (semester: SemesterData, reason: string, courses: Course[]): SemesterData => {
  const now = new Date().toISOString();
  const newSnap = {
    id: `snap-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    createdAt: now,
    reason,
    courses,
  };

  const snapshots = [newSnap, ...semester.snapshots].slice(0, 30);
  return {
    ...semester,
    courses,
    snapshots,
    updatedAt: now,
  };
};

const sameCourses = (a: Course[], b: Course[]): boolean => JSON.stringify(a) === JSON.stringify(b);

export const useCoursesStore = ({
  storageKey,
  defaultData,
  voidKeyStorageKey,
  voidApiBase,
}: UseCoursesStoreOptions) => {
  const [store, setStore] = useState<CoursesStoreSchema>(createDefaultStore(defaultData));
  const [isInitialized, setIsInitialized] = useState(false);

  const activeSemester = useMemo(() => {
    return store.semesters.find((s) => s.id === store.activeSemesterId) ?? store.semesters[0];
  }, [store]);

  const courses = activeSemester?.courses ?? [];

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const saved = readStorage(storageKey);
      const savedVoidKey = readStorage(voidKeyStorageKey);

      const localStore = saved ? parseStoredStore(saved, defaultData) : null;
      if (saved && localStore === null) {
        backupStorage(storageKey, saved, 'parse_failed_backup');
      }
      const localFallback = localStore ?? createDefaultStore(defaultData);

      const shouldTryCloudBootstrap = !localStore;

      if (shouldTryCloudBootstrap && savedVoidKey && savedVoidKey.length >= 3 && voidApiBase) {
        try {
          const response = await fetch(`${voidApiBase}/${savedVoidKey}`);
          if (response.ok) {
            const text = await response.text();
            if (text && text !== 'null') {
              const cloudStore = parseStoredStore(text, defaultData);
              const cloudData = cloudStore ? cloudStore : (() => {
                const parsedCourses = parseStoredCourses(text);
                if (parsedCourses === null) return null;
                const merged = localFallback;
                const semesters = merged.semesters.map((semester) =>
                  semester.id === merged.activeSemesterId
                    ? appendSnapshot(semester, 'Void Drop 下载覆盖', parsedCourses)
                    : semester,
                );
                return {
                  ...merged,
                  semesters,
                } as CoursesStoreSchema;
              })();

              if (cloudData !== null) {
                if (!cancelled) {
                  setStore(cloudData);
                  writeStorage(storageKey, JSON.stringify(cloudData));
                  setIsInitialized(true);
                  return;
                }
              } else {
                console.warn('Cloud data format is invalid, fallback to local/default.');
              }
            }
          }
        } catch (e) {
          console.warn('Failed to load courses from cloud, fallback to local/default.');
        }
      }

      if (!cancelled) {
        setStore(localFallback);
        setIsInitialized(true);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [defaultData, storageKey, voidApiBase, voidKeyStorageKey]);

  useEffect(() => {
    if (!isInitialized) return;
    writeStorage(storageKey, JSON.stringify(store));
  }, [store, isInitialized, storageKey]);

  const updateCourses = useCallback((next: Course[]) => {
    setStore((prev) => {
      const active = prev.semesters.find((s) => s.id === prev.activeSemesterId);
      if (!active) return prev;
      if (sameCourses(active.courses, next)) return prev;

      return {
        ...prev,
        semesters: prev.semesters.map((semester) =>
          semester.id === prev.activeSemesterId
            ? appendSnapshot(semester, '课程更新', next)
            : semester,
        ),
      };
    });
  }, []);

  const createSemesterFromCourses = useCallback((name: string, semesterCourses: Course[]) => {
    setStore((prev) => {
      const fallbackName = `学期 ${prev.semesters.length + 1}`;
      const desiredName = name.trim() || fallbackName;
      const uniqueName = buildUniqueSemesterName(desiredName, prev.semesters);
      const semester = createSemester(uniqueName, semesterCourses);

      return {
        ...prev,
        activeSemesterId: semester.id,
        semesters: [semester, ...prev.semesters],
      };
    });
  }, []);

  const setActiveSemester = useCallback((semesterId: string) => {
    setStore((prev) => {
      if (!prev.semesters.some((s) => s.id === semesterId)) return prev;
      return {
        ...prev,
        activeSemesterId: semesterId,
      };
    });
  }, []);

  const restoreSnapshotToActive = useCallback((snapshotId: string) => {
    setStore((prev) => {
      const active = prev.semesters.find((s) => s.id === prev.activeSemesterId);
      if (!active) return prev;
      const snapshot = active.snapshots.find((s) => s.id === snapshotId);
      if (!snapshot) return prev;

      return {
        ...prev,
        semesters: prev.semesters.map((semester) =>
          semester.id === prev.activeSemesterId
            ? appendSnapshot(semester, `回溯到 ${snapshot.createdAt}`, snapshot.courses)
            : semester,
        ),
      };
    });
  }, []);

  const restoreSnapshotAsNewSemester = useCallback((snapshotId: string, name?: string) => {
    const active = activeSemester;
    if (!active) return;
    const snapshot = active.snapshots.find((s) => s.id === snapshotId);
    if (!snapshot) return;
    createSemesterFromCourses(name || `${active.name}-回溯副本`, snapshot.courses);
  }, [activeSemester, createSemesterFromCourses]);

  const importFromExternal = useCallback((importedCourses: Course[], importedSemesterName?: string) => {
    const importedName = importedSemesterName ? normalizeSemesterName(importedSemesterName) : '';
    const activeName = activeSemester?.name ? normalizeSemesterName(activeSemester.name) : '';
    if (importedName && importedName !== activeName) {
      createSemesterFromCourses(importedSemesterName, importedCourses);
      return;
    }
    updateCourses(importedCourses);
  }, [activeSemester?.name, createSemesterFromCourses, updateCourses]);

  const exportForVoidDrop = useCallback(() => JSON.stringify(store), [store]);

  const importFromVoidDropPayload = useCallback((text: string) => {
    const parsedStore = parseStoredStore(text, defaultData);
    if (parsedStore) {
      backupStorage(storageKey, JSON.stringify(store), 'void_replace_backup');
      setStore(parsedStore);
      return {
        ok: true,
        count: parsedStore.semesters.reduce((acc, s) => acc + s.courses.length, 0),
      };
    }

    const legacyCourses = parseStoredCourses(text);
    if (legacyCourses) {
      updateCourses(legacyCourses);
      return {
        ok: true,
        count: legacyCourses.length,
      };
    }

    return {
      ok: false,
      count: 0,
    };
  }, [defaultData, storageKey, store, updateCourses]);

  const resetCourses = useCallback(() => {
    setStore((prev) => ({
      ...prev,
      semesters: prev.semesters.map((semester) =>
        semester.id === prev.activeSemesterId
          ? appendSnapshot(semester, '重置到默认数据', defaultData)
          : semester,
      ),
    }));
  }, [defaultData]);

  return {
    store,
    semesters: store.semesters,
    activeSemester,
    courses,
    updateCourses,
    resetCourses,
    setActiveSemester,
    createSemesterFromCourses,
    restoreSnapshotToActive,
    restoreSnapshotAsNewSemester,
    importFromExternal,
    exportForVoidDrop,
    importFromVoidDropPayload,
  };
};
