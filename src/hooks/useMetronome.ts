import { useState, useEffect, useRef, useCallback } from 'react';

export type MetronomeSound = 'beep' | 'click' | 'woodblock';

export function useMetronome() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(112);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [accentFirstBeat, setAccentFirstBeat] = useState(true);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [sound, setSound] = useState<MetronomeSound>('beep');

  const audioContextRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef(0);
  const currentBeatInBarRef = useRef(0);
  const timerIDRef = useRef<number | null>(null);
  const volumeRef = useRef(volume);
  const isMutedRef = useRef(isMuted);
  const soundRef = useRef<MetronomeSound>(sound);
  const lookahead = 25.0; // ms
  const scheduleAheadTime = 0.1; // s

  // Keep refs in sync so scheduled notes pick up latest values
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);
  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  const nextNote = useCallback(() => {
    const secondsPerBeat = 60.0 / bpm;
    nextNoteTimeRef.current += secondsPerBeat;
    currentBeatInBarRef.current =
    (currentBeatInBarRef.current + 1) % beatsPerMeasure;
  }, [bpm, beatsPerMeasure]);

  const scheduleNote = useCallback(
    (beatNumber: number, time: number) => {
      if (!audioContextRef.current) return;

      // Update visual state slightly before the audio plays to account for React render cycle
      setTimeout(
        () => {
          setCurrentBeat(beatNumber);
        },
        (time - audioContextRef.current.currentTime) * 1000
      );

      if (isMutedRef.current) return;

      const osc = audioContextRef.current.createOscillator();
      const envelope = audioContextRef.current.createGain();

      const isAccent = accentFirstBeat && beatNumber === 0;
      const currentSound = soundRef.current;

      // Sound profiles
      if (currentSound === 'beep') {
        osc.type = 'sine';
        osc.frequency.value = isAccent ? 1500 : 800;
      } else if (currentSound === 'click') {
        osc.type = 'square';
        osc.frequency.value = isAccent ? 2000 : 1200;
      } else {
        // woodblock
        osc.type = 'triangle';
        osc.frequency.value = isAccent ? 1000 : 600;
      }

      const v = volumeRef.current;
      envelope.gain.value = v;
      envelope.gain.exponentialRampToValueAtTime(
        Math.max(v, 0.001),
        time + 0.001
      );
      envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

      osc.connect(envelope);
      envelope.connect(audioContextRef.current.destination);

      osc.start(time);
      osc.stop(time + 0.05);
    },
    [accentFirstBeat]
  );

  const scheduler = useCallback(() => {
    if (!audioContextRef.current) return;
    while (
    nextNoteTimeRef.current <
    audioContextRef.current.currentTime + scheduleAheadTime)
    {
      scheduleNote(currentBeatInBarRef.current, nextNoteTimeRef.current);
      nextNote();
    }
    timerIDRef.current = window.setTimeout(scheduler, lookahead);
  }, [nextNote, scheduleNote]);

  useEffect(() => {
    if (isPlaying) {
      initAudio();
      if (audioContextRef.current) {
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
        nextNoteTimeRef.current = audioContextRef.current.currentTime + 0.05;
        currentBeatInBarRef.current = 0;
        scheduler();
      }
    } else {
      if (timerIDRef.current !== null) {
        window.clearTimeout(timerIDRef.current);
        timerIDRef.current = null;
      }
    }

    return () => {
      if (timerIDRef.current !== null) {
        window.clearTimeout(timerIDRef.current);
      }
    };
  }, [isPlaying, scheduler, initAudio]);

  const togglePlay = useCallback(() => {
    if (!isPlaying) {
      initAudio();
    }
    setIsPlaying((prev) => !prev);
  }, [isPlaying, initAudio]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setCurrentBeat(0);
  }, []);

  const previewClicks = useCallback(
    (count: number) => {
      if (!audioContextRef.current) {
        initAudio();
      }
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }

      let time = audioContextRef.current!.currentTime + 0.1;
      const secondsPerBeat = 60.0 / bpm;

      for (let i = 0; i < count; i++) {
        const osc = audioContextRef.current!.createOscillator();
        const envelope = audioContextRef.current!.createGain();

        const isAccent = accentFirstBeat && i === 0;
        osc.frequency.value = isAccent ? 1500 : 800;

        envelope.gain.value = 1;
        envelope.gain.exponentialRampToValueAtTime(1, time + 0.001);
        envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

        osc.connect(envelope);
        envelope.connect(audioContextRef.current!.destination);

        osc.start(time);
        osc.stop(time + 0.05);

        time += secondsPerBeat;
      }

      return count * secondsPerBeat * 1000; // Return duration in ms
    },
    [bpm, accentFirstBeat, initAudio]
  );

  return {
    isPlaying,
    togglePlay,
    stop,
    previewClicks,
    bpm,
    setBpm,
    beatsPerMeasure,
    setBeatsPerMeasure,
    accentFirstBeat,
    setAccentFirstBeat,
    currentBeat,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    sound,
    setSound
  };
}