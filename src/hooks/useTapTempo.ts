import { useState, useCallback, useRef } from 'react';

export function useTapTempo(onBpmChange: (bpm: number) => void) {
  const [taps, setTaps] = useState<number[]>([]);
  const timeoutRef = useRef<number | null>(null);

  const handleTap = useCallback(() => {
    const now = performance.now();

    setTaps((prevTaps) => {
      // Keep only taps from the last 3 seconds
      const recentTaps = prevTaps.filter((t) => now - t < 3000);
      const newTaps = [...recentTaps, now];

      if (newTaps.length >= 2) {
        // Calculate intervals between taps
        const intervals = [];
        for (let i = 1; i < newTaps.length; i++) {
          intervals.push(newTaps[i] - newTaps[i - 1]);
        }

        // Average interval
        const avgInterval =
        intervals.reduce((a, b) => a + b, 0) / intervals.length;

        // Convert to BPM
        const calculatedBpm = Math.round(60000 / avgInterval);

        // Clamp between reasonable values
        if (calculatedBpm >= 40 && calculatedBpm <= 250) {
          onBpmChange(calculatedBpm);
        }
      }

      return newTaps;
    });

    // Clear taps after 3 seconds of inactivity
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setTaps([]);
    }, 3000);
  }, [onBpmChange]);

  return { handleTap };
}