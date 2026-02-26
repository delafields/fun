export interface Member {
  id: "creator" | "partner";
  name: string;
  emoji: string;
  joinedAt: string;
}

export interface Item {
  id: string;
  text: string;
  addedBy: "creator" | "partner";
  addedAt: string;
  note?: string;
}

export interface HistoryEntry {
  id: string;
  itemText: string;
  pickedBy: "creator" | "partner";
  pickedAt: string;
  rating?: number;
}

export interface Streak {
  by: "creator" | "partner";
  count: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  isDefault: boolean;
  currentTurn: "creator" | "partner";
  streak: Streak;
  items: Item[];
  history: HistoryEntry[];
}

export interface CoupleData {
  code: string;
  version: number;
  createdAt: string;
  members: {
    creator: Member;
    partner: Member | null;
  };
  categories: Category[];
}

export interface Session {
  coupleCode: string;
  role: "creator" | "partner";
}
