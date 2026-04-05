import { useEffect, useRef } from 'react';

export function useAnimationFrame(
  callback: (deltaTime: number) => void,
  active: boolean
) {
  const callbackRef = useRef(callback);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  callbackRef.current = callback;

  useEffect(() => {
    if (!active) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        lastTimeRef.current = null;
      }
      return;
    }

    const loop = (time: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;
      callbackRef.current(delta);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        lastTimeRef.current = null;
      }
    };
  }, [active]);
}
