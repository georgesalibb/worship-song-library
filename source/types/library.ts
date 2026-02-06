export type LibrarySortMode =
  | "TITLE_ASC"
  | "TITLE_DESC"
  | "ADDED_NEWEST"
  | "ADDED_OLDEST";

export type LibraryItem = {
  songId: string;
  addedAt: number;
};

export type Library = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  items: LibraryItem[];

  // ✅ per-library sort preference
  sortMode?: LibrarySortMode;
};
