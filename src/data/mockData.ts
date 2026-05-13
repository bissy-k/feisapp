export type DanceStyle = {
  id: string;
  name: string;
  description: string;
  timeSignature: string;
  bpmRange: [number, number];
  shoeType: 'Light' | 'Heavy' | 'Both';
  color: string;
};

export type Track = {
  id: string;
  title: string;
  artist: string;
  styleId: string;
  bpm: number;
  duration: number; // in seconds
  artworkColor: string;
};

export type Playlist = {
  id: string;
  name: string;
  description: string;
  trackIds: string[];
  coverColor: string;
};

export const DANCE_STYLES: DanceStyle[] = [
{
  id: 'reel',
  name: 'Reel',
  description: 'Fast, energetic 4/4 — light shoe',
  timeSignature: '4/4',
  bpmRange: [112, 116],
  shoeType: 'Light',
  color: '#10B981' // Emerald
},
{
  id: 'light-jig',
  name: 'Light Jig',
  description: 'Bouncy, lively 6/8 — light shoe',
  timeSignature: '6/8',
  bpmRange: [115, 116],
  shoeType: 'Light',
  color: '#3B82F6' // Blue
},
{
  id: 'slip-jig',
  name: 'Slip Jig',
  description: 'Graceful, flowing 9/8 — light shoe',
  timeSignature: '9/8',
  bpmRange: [112, 114],
  shoeType: 'Light',
  color: '#8B5CF6' // Purple
},
{
  id: 'single-jig',
  name: 'Single Jig',
  description: 'Quick, sharp 6/8 — light shoe',
  timeSignature: '6/8',
  bpmRange: [122, 124],
  shoeType: 'Light',
  color: '#F59E0B' // Amber
},
{
  id: 'treble-jig',
  name: 'Treble Jig',
  description: 'Heavy, rhythmic 6/8 — heavy shoe',
  timeSignature: '6/8',
  bpmRange: [72, 74],
  shoeType: 'Heavy',
  color: '#EF4444' // Red
},
{
  id: 'hornpipe',
  name: 'Hornpipe',
  description: 'Slower, strong rhythm 4/4 — heavy shoe',
  timeSignature: '4/4',
  bpmRange: [112, 114],
  shoeType: 'Heavy',
  color: '#06B6D4' // Cyan
},
{
  id: 'set-dance',
  name: 'Set Dance',
  description: 'Specific traditional tunes — heavy shoe',
  timeSignature: 'Varies',
  bpmRange: [66, 110],
  shoeType: 'Heavy',
  color: '#EC4899' // Pink
},
{
  id: 'traditional-set',
  name: 'Traditional Set',
  description: 'Standardized set dances — heavy shoe',
  timeSignature: 'Varies',
  bpmRange: [90, 130],
  shoeType: 'Heavy',
  color: '#6366F1' // Indigo
}];


export const TRACKS: Track[] = [
{
  id: 't1',
  title: 'The Banks of the Lee',
  artist: 'Trad Collective',
  styleId: 'reel',
  bpm: 113,
  duration: 184,
  artworkColor: '#10B981'
},
{
  id: 't2',
  title: 'Drowsy Maggie',
  artist: 'Comhaltas Sessions',
  styleId: 'reel',
  bpm: 114,
  duration: 210,
  artworkColor: '#059669'
},
{
  id: 't3',
  title: 'The Kesh Jig',
  artist: 'Deirdre Ní Bhriain',
  styleId: 'light-jig',
  bpm: 116,
  duration: 195,
  artworkColor: '#3B82F6'
},
{
  id: 't4',
  title: "Morrison's Jig",
  artist: 'Trad Collective',
  styleId: 'light-jig',
  bpm: 115,
  duration: 180,
  artworkColor: '#2563EB'
},
{
  id: 't5',
  title: 'The Butterfly',
  artist: 'Comhaltas Sessions',
  styleId: 'slip-jig',
  bpm: 113,
  duration: 220,
  artworkColor: '#8B5CF6'
},
{
  id: 't6',
  title: "Foxhunter's",
  artist: 'Deirdre Ní Bhriain',
  styleId: 'slip-jig',
  bpm: 112,
  duration: 205,
  artworkColor: '#7C3AED'
},
{
  id: 't7',
  title: 'Off She Goes',
  artist: 'Trad Collective',
  styleId: 'single-jig',
  bpm: 123,
  duration: 175,
  artworkColor: '#F59E0B'
},
{
  id: 't8',
  title: 'Smash the Windows',
  artist: 'Comhaltas Sessions',
  styleId: 'single-jig',
  bpm: 124,
  duration: 190,
  artworkColor: '#D97706'
},
{
  id: 't9',
  title: 'The Blackbird',
  artist: 'Deirdre Ní Bhriain',
  styleId: 'treble-jig',
  bpm: 73,
  duration: 240,
  artworkColor: '#EF4444'
},
{
  id: 't10',
  title: "St. Patrick's Day",
  artist: 'Trad Collective',
  styleId: 'treble-jig',
  bpm: 74,
  duration: 230,
  artworkColor: '#DC2626'
},
{
  id: 't11',
  title: 'The Boys of Bluehill',
  artist: 'Comhaltas Sessions',
  styleId: 'hornpipe',
  bpm: 113,
  duration: 215,
  artworkColor: '#06B6D4'
},
{
  id: 't12',
  title: 'Harvest Home',
  artist: 'Deirdre Ní Bhriain',
  styleId: 'hornpipe',
  bpm: 114,
  duration: 200,
  artworkColor: '#0891B2'
},
{
  id: 't13',
  title: 'King of the Fairies',
  artist: 'Trad Collective',
  styleId: 'set-dance',
  bpm: 130,
  duration: 250,
  artworkColor: '#EC4899'
},
{
  id: 't14',
  title: 'Job of Journeywork',
  artist: 'Comhaltas Sessions',
  styleId: 'traditional-set',
  bpm: 138,
  duration: 260,
  artworkColor: '#6366F1'
},
{
  id: 't15',
  title: 'The Star of Munster',
  artist: 'Deirdre Ní Bhriain',
  styleId: 'reel',
  bpm: 113,
  duration: 190,
  artworkColor: '#10B981'
},
{
  id: 't16',
  title: "Cooley's Reel",
  artist: 'Trad Collective',
  styleId: 'reel',
  bpm: 114,
  duration: 205,
  artworkColor: '#059669'
},
{
  id: 't17',
  title: "The Connaughtman's Rambles",
  artist: 'Comhaltas Sessions',
  styleId: 'light-jig',
  bpm: 116,
  duration: 185,
  artworkColor: '#3B82F6'
},
{
  id: 't18',
  title: 'A Fig for a Kiss',
  artist: 'Deirdre Ní Bhriain',
  styleId: 'slip-jig',
  bpm: 113,
  duration: 210,
  artworkColor: '#8B5CF6'
},
{
  id: 't19',
  title: 'The Humours of Bandon',
  artist: 'Trad Collective',
  styleId: 'treble-jig',
  bpm: 73,
  duration: 225,
  artworkColor: '#EF4444'
},
{
  id: 't20',
  title: "Chief O'Neill's",
  artist: 'Comhaltas Sessions',
  styleId: 'hornpipe',
  bpm: 113,
  duration: 210,
  artworkColor: '#06B6D4'
}];


export const PLAYLISTS: Playlist[] = [
{
  id: 'p1',
  name: 'Warm-up',
  description: 'Gentle reels and light jigs to get started.',
  trackIds: ['t1', 't3', 't15', 't17'],
  coverColor: '#F59E0B'
},
{
  id: 'p2',
  name: 'Reel Practice',
  description: 'Continuous reels for stamina and drills.',
  trackIds: ['t1', 't2', 't15', 't16'],
  coverColor: '#10B981'
},
{
  id: 'p3',
  name: 'Heavy Shoe Drills',
  description: 'Slow treble jigs and hornpipes for precision.',
  trackIds: ['t9', 't10', 't11', 't12', 't19', 't20'],
  coverColor: '#EF4444'
},
{
  id: 'p4',
  name: 'Feis Prep',
  description: 'Competition speed tracks across all styles.',
  trackIds: ['t1', 't3', 't5', 't9', 't11'],
  coverColor: '#8B5CF6'
}];


export const RECENTLY_PLAYED_IDS = ['t1', 't5', 't11', 't9'];
export const RECOMMENDED_IDS = ['t2', 't4', 't6', 't12'];