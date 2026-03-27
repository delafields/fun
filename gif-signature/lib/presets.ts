export interface SignaturePreset {
  id: string;
  name: string;
  description: string;
  fontFile: string;
  fontFamily: string;
  color: string;
  strokeWidth: number;
  speed: number; // frames for full animation
  fontSize: number;
}

export const PRESETS: SignaturePreset[] = [
  {
    id: "executive",
    name: "Executive",
    description: "Refined & elegant",
    fontFile: "/fonts/GreatVibes.ttf",
    fontFamily: "Great Vibes",
    color: "#1a365d",
    strokeWidth: 2,
    speed: 60,
    fontSize: 72,
  },
  {
    id: "classic",
    name: "Classic",
    description: "Timeless cursive",
    fontFile: "/fonts/DancingScript.ttf",
    fontFamily: "Dancing Script",
    color: "#1a1a1a",
    strokeWidth: 2.5,
    speed: 50,
    fontSize: 68,
  },
  {
    id: "creative",
    name: "Creative",
    description: "Playful & friendly",
    fontFile: "/fonts/Caveat.ttf",
    fontFamily: "Caveat",
    color: "#6d28d9",
    strokeWidth: 3,
    speed: 40,
    fontSize: 74,
  },
  {
    id: "modern",
    name: "Modern",
    description: "Clean & minimal",
    fontFile: "/fonts/Sacramento.ttf",
    fontFamily: "Sacramento",
    color: "#374151",
    strokeWidth: 1.8,
    speed: 55,
    fontSize: 76,
  },
  {
    id: "bold",
    name: "Bold",
    description: "Confident & strong",
    fontFile: "/fonts/Pacifico.ttf",
    fontFamily: "Pacifico",
    color: "#0f172a",
    strokeWidth: 3.5,
    speed: 45,
    fontSize: 64,
  },
];

export function getPreset(id: string): SignaturePreset {
  return PRESETS.find((p) => p.id === id) || PRESETS[0];
}
