import { startTransition, useCallback, useState } from 'react';
import { AppMode } from '../types';

export const useModeSwitch = (initialMode: AppMode = 'schedule') => {
  const [activeMode, setActiveMode] = useState<AppMode>(initialMode);

  const switchMode = useCallback((mode: AppMode) => {
    startTransition(() => {
      setActiveMode(mode);
    });
  }, []);

  const openEditor = useCallback(() => {
    startTransition(() => {
      setActiveMode('editor');
    });
  }, []);

  const closeEditor = useCallback(() => {
    startTransition(() => {
      setActiveMode('schedule');
    });
  }, []);

  const isEditor = activeMode === 'editor';

  return {
    activeMode,
    isEditor,
    switchMode,
    openEditor,
    closeEditor,
  };
};
