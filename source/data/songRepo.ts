// source/data/songRepo.ts
import songsRaw from "./songs.json";

export type Song = {
  id: string;
  title: string;
  lyrics: string;
  language?: string;
  tags?: string[];
};

// supports songs.json as either: [ ... ] or { "songs": [ ... ] }
const songsArray: any[] = Array.isArray(songsRaw)
  ? songsRaw
  : (songsRaw as any).songs ?? [];

const normalize = (s: any): Song => ({
  id: String(s.id ?? s.slug ?? s.title),
  title: String(s.title ?? "Untitled"),
  lyrics: String(s.lyrics ?? s.text ?? ""),
  language: s.language ? String(s.language) : "English",
  tags: Array.isArray(s.tags) ? s.tags.map(String) : [],
});

const SONGS: Song[] = songsArray.map(normalize);

export function getAllSongs(): Song[] {
  return SONGS;
}

export function getSongById(id: string): Song | undefined {
  return SONGS.find((s) => s.id === id);
}

export function searchSongs(query: string): Song[] {
  const q = query.trim().toLowerCase();
  if (!q) return SONGS;

  return SONGS.filter((s) => {
    const hay = `${s.title}\n${s.lyrics}`.toLowerCase();
    return hay.includes(q);
  });
}
