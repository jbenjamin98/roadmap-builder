import { createContext, useContext } from 'react';

/** Holds the value returned by hooks/useRoadmapState so the workspace tree can read it directly. */
export const RoadmapContext = createContext(null);

export function useRoadmap() {
  const value = useContext(RoadmapContext);
  if (!value) throw new Error('useRoadmap must be used inside <RoadmapContext.Provider>');
  return value;
}
