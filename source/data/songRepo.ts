import songsJson from "./songs.json";

export type Language = "EN" | "AR" | "COP";

export type Song = {
  id: string;
  title: string;
  language: Language;
  lyrics: string;
};

export function getAllSongs(): Song[] {
  return songsJson as Song[];
}

export function getSongById(id: string): Song | undefined {
  return getAllSongs().find((s) => s.id === id);
}
