import { useCallback, useState } from 'react';
import { AppMode } from '../types';

export const useModeSwitch = (initialMode: AppMode = 'schedule') => {
  const [activeMode, setActiveMode] = useState<AppMode>(initialMode);

  const switchMode = useCallback((mode: AppMode) => {
    setActiveMode(mode);
  }, []);

  const openEditor = useCallback(() => {
    setActiveMode('editor');
  }, []);

  const closeEditor = useCallback(() => {
    setActiveMode('schedule');
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
