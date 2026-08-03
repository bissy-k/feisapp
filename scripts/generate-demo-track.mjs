// Generates an original, royalty-free reel-style demo track as a WAV file.
// Not a transcription of any known tune — melody is procedurally composed
// over a simple I-IV-V progression in D major, seeded for reproducibility.
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const SAMPLE_RATE = 44100;
const BPM = 113;
const BARS = 16;
const BEAT_SEC = 60 / BPM;
const EIGHTH_SEC = BEAT_SEC / 2;
const BAR_SEC = BEAT_SEC * 4;
const OUT_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'public',
  'audio',
  'demo-reel.wav'
);

// Seeded PRNG (mulberry32) so re-running this script is deterministic.
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(1204);

// D major scale, D4 up through A5 (12 diatonic steps of melodic range).
const SCALE = [
  293.66, 329.63, 369.99, 392.0, 440.0, 493.88, 554.37, 587.33, 659.25,
  739.99, 783.99, 880.0
];
const CHORD_TONES = {
  I: [0, 2, 4, 7, 9, 11], // D F# A
  IV: [0, 3, 5, 7], // D G B
  V: [4, 6, 8, 11] // A C# E
};
const PROGRESSION = [
  'I', 'IV', 'I', 'V', 'I', 'IV', 'V', 'I',
  'IV', 'I', 'V', 'I', 'IV', 'V', 'I', 'I'
];
const PHRASE_END_BARS = new Set([3, 7, 11, 15]);

function nearestChordTone(idx, tones) {
  return tones.reduce((best, t) =>
  Math.abs(t - idx) < Math.abs(best - idx) ? t : best
  , tones[0]);
}

// Build the melody as a flat list of { freq, startSec, durSec }.
const notes = [];
let cursor = 0;
let currentIdx = 0;
for (let bar = 0; bar < BARS; bar += 1) {
  const chord = CHORD_TONES[PROGRESSION[bar]];
  const isPhraseEnd = PHRASE_END_BARS.has(bar);
  const units = isPhraseEnd ?
  [1, 1, 1, 1, 1, 1, 2] :
  [1, 1, 1, 1, 1, 1, 1, 1];
  const isLastBar = bar === BARS - 1;

  units.forEach((unit, slot) => {
    if (slot === 0) {
      currentIdx = nearestChordTone(currentIdx, chord);
    } else if (slot === 4) {
      if (rand() < 0.7) currentIdx = nearestChordTone(currentIdx, chord);
    } else {
      const step = rand() < 0.15 ? (rand() < 0.5 ? -2 : 2) : rand() < 0.5 ? -1 : 1;
      currentIdx = Math.max(0, Math.min(SCALE.length - 1, currentIdx + step));
    }
    if (isLastBar && slot === units.length - 1) {
      currentIdx = nearestChordTone(currentIdx, [0, 7]); // land on D, home tone
    }

    const durSec = unit * EIGHTH_SEC;
    notes.push({ freq: SCALE[currentIdx], startSec: cursor, durSec });
    cursor += durSec;
  });
}

const totalSec = BARS * BAR_SEC;
const totalSamples = Math.round(totalSec * SAMPLE_RATE);
const buffer = new Float32Array(totalSamples);

function addSamples(startSec, durSec, sampleFn) {
  const startIdx = Math.max(0, Math.round(startSec * SAMPLE_RATE));
  const endIdx = Math.min(totalSamples, Math.round((startSec + durSec) * SAMPLE_RATE));
  for (let i = startIdx; i < endIdx; i += 1) {
    const t = (i - startIdx) / SAMPLE_RATE;
    buffer[i] += sampleFn(t);
  }
}

// Melody: bright, quick-decay plucked tone (fundamental + light harmonics).
const NOTE_GAIN = 0.5;
notes.forEach(({ freq, startSec, durSec }) => {
  const attack = 0.006;
  const decayRate = 3 / Math.max(durSec - attack, 0.05);
  addSamples(startSec, durSec, (t) => {
    const env = t < attack ? t / attack : Math.exp(-(t - attack) * decayRate);
    const wave =
    Math.sin(2 * Math.PI * freq * t) +
    0.35 * Math.sin(2 * Math.PI * freq * 3 * t) +
    0.15 * Math.sin(2 * Math.PI * freq * 5 * t);
    return env * (wave / 1.5) * NOTE_GAIN;
  });
});

// Backing pulse: a bodhrán-like thump on beats 1 & 3, a soft tick on every eighth.
for (let bar = 0; bar < BARS; bar += 1) {
  const barStart = bar * BAR_SEC;
  for (let beat = 0; beat < 4; beat += 1) {
    const beatStart = barStart + beat * BEAT_SEC;
    if (beat === 0 || beat === 2) {
      const dur = 0.16;
      addSamples(beatStart, dur, (t) => {
        const env = Math.exp(-t * 18);
        const tone = Math.sin(2 * Math.PI * 70 * t);
        const noise = (rand() * 2 - 1) * 0.4;
        return env * (tone * 0.22 + noise * 0.05);
      });
    }
  }
  for (let eighth = 0; eighth < 8; eighth += 1) {
    const tickStart = barStart + eighth * EIGHTH_SEC;
    const dur = 0.03;
    addSamples(tickStart, dur, (t) => {
      const env = Math.exp(-t * 90);
      const noise = (rand() * 2 - 1);
      return env * noise * 0.035;
    });
  }
}

// Normalize to a safe peak, then encode 16-bit PCM mono WAV.
let peak = 0;
for (let i = 0; i < totalSamples; i += 1) {
  peak = Math.max(peak, Math.abs(buffer[i]));
}
const scale = peak > 0 ? 0.9 / peak : 1;

const dataSize = totalSamples * 2;
const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + dataSize, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20); // PCM
header.writeUInt16LE(1, 22); // mono
header.writeUInt32LE(SAMPLE_RATE, 24);
header.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
header.writeUInt16LE(2, 32); // block align
header.writeUInt16LE(16, 34); // bits per sample
header.write('data', 36);
header.writeUInt32LE(dataSize, 40);

const data = Buffer.alloc(dataSize);
for (let i = 0; i < totalSamples; i += 1) {
  const sample = Math.max(-1, Math.min(1, buffer[i] * scale));
  data.writeInt16LE(Math.round(sample * 32767), i * 2);
}

writeFileSync(OUT_PATH, Buffer.concat([header, data]));
console.log(`Wrote ${OUT_PATH}`);
console.log(`Duration: ${totalSec.toFixed(3)}s, ${totalSamples} samples`);
