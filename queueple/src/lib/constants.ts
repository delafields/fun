export const DEFAULT_CATEGORIES = [
  { name: "Restaurants", icon: "🍽️" },
  { name: "Movies", icon: "🎬" },
  { name: "Date Nights", icon: "💕" },
  { name: "Activities", icon: "🎯" },
  { name: "TV Shows", icon: "📺" },
  { name: "Recipes to Cook", icon: "👩‍🍳" },
  { name: "Travel Destinations", icon: "✈️" },
  { name: "Weekend Plans", icon: "☀️" },
] as const;

export const EMOJI_OPTIONS = [
  "😊", "😎", "🥰", "😏", "🤓", "😴",
  "🦊", "🐻", "🐼", "🐨", "🦁", "🐸",
  "🌸", "🌊", "🔥", "⭐", "🌙", "🍀",
  "🍕", "🍦", "🧁", "🍷", "☕", "🍜",
] as const;

export const CATEGORY_ICON_OPTIONS = [
  "🍽️", "🎬", "💕", "🎯", "📺", "👩‍🍳", "✈️", "☀️",
  "🎮", "🎵", "📚", "🛍️", "🏋️", "🎨", "🍸", "🎪",
] as const;

export const POLL_INTERVAL = 5000;
