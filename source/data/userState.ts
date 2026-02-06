import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  favourites: "ws:favourites",
  recents: "ws:recents",
} as const;

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getFavourites(): Promise<string[]> {
  return readJson<string[]>(KEYS.favourites, []);
}

export async function toggleFavourite(songId: string): Promise<string[]> {
  const favs = await getFavourites();
  const next = favs.includes(songId)
    ? favs.filter((id) => id !== songId)
    : [songId, ...favs];
  await writeJson(KEYS.favourites, next);
  return next;
}

export async function getRecents(): Promise<string[]> {
  return readJson<string[]>(KEYS.recents, []);
}

export async function pushRecent(songId: string): Promise<string[]> {
  const recents = await getRecents();
  const next = [songId, ...recents.filter((id) => id !== songId)].slice(0, 50);
  await writeJson(KEYS.recents, next);
  return next;
}

export async function clearRecents(): Promise<void> {
  await writeJson(KEYS.recents, []);
}

export async function clearFavourites(): Promise<void> {
  await writeJson(KEYS.favourites, []);
}

