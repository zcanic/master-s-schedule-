import { useCallback, useEffect, useState } from 'react';
import { Course } from '../types';
import { normalizeCourses } from '../courseValidation';

interface UseCoursesStoreOptions {
  storageKey: string;
  defaultData: Course[];
  voidKeyStorageKey: string;
  voidApiBase?: string;
}

const readStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn(`Failed to read ${key} from localStorage.`);
    return null;
  }
};

const writeStorage = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`Failed to write ${key} to localStorage.`);
  }
};

export const useCoursesStore = ({
  storageKey,
  defaultData,
  voidKeyStorageKey,
  voidApiBase,
}: UseCoursesStoreOptions) => {
  const [courses, setCourses] = useState<Course[]>(defaultData);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const saved = readStorage(storageKey);
      const savedVoidKey = readStorage(voidKeyStorageKey);

      if (savedVoidKey && savedVoidKey.length >= 3 && voidApiBase) {
        try {
          const response = await fetch(`${voidApiBase}/${savedVoidKey}`);
          if (response.ok) {
            const text = await response.text();
            if (text && text !== 'null') {
              const cloudData = normalizeCourses(JSON.parse(text));
              if (!cancelled) {
                setCourses(cloudData);
                writeStorage(storageKey, JSON.stringify(cloudData));
                setIsInitialized(true);
                return;
              }
            }
          }
        } catch (e) {
          console.warn('Failed to load courses from cloud, fallback to local/default.');
        }
      }

      if (!cancelled) {
        if (saved) {
          try {
            setCourses(normalizeCourses(JSON.parse(saved)));
          } catch (e) {
            setCourses(defaultData);
          }
        } else {
          setCourses(defaultData);
        }
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
    writeStorage(storageKey, JSON.stringify(courses));
  }, [courses, isInitialized, storageKey]);

  const updateCourses = useCallback((next: Course[]) => {
    setCourses(next);
  }, []);

  const resetCourses = useCallback(() => {
    setCourses(defaultData);
    writeStorage(storageKey, JSON.stringify(defaultData));
  }, [defaultData, storageKey]);

  return {
    courses,
    updateCourses,
    resetCourses,
  };
};
