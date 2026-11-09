import { useEffect } from 'react';
import { loadFont } from '../constants/fontLoaders';

/** Ensures the self-hosted font for a font-style id is loading; text repaints when it arrives. */
export default function useFont(fontId) {
  useEffect(() => {
    loadFont(fontId);
  }, [fontId]);
}
