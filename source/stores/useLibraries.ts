import { useSyncExternalStore } from "react";
import type { Library, LibrarySortMode } from "../types/library";
import { STORAGE_KEYS } from "../storage/keys";
import { readJSON, writeJSON } from "../storage/json";

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** -------- Singleton store (module-level) -------- */
let _hydrated = false;
let _hydrating: Promise<void> | null = null;
let _libraries: Library[] = [];
let _version = 0;

const _listeners = new Set<() => void>();

// Cached snapshot so React doesn't see a "new" snapshot every time
let _cachedSnapshot:
  | (ReturnType<typeof buildSnapshot> & { __v: number })
  | null = null;

function emit() {
  _version++;
  _cachedSnapshot = null; // invalidate cache
  for (const l of _listeners) l();
}

async function ensureHydrated() {
  if (_hydrated) return;
  if (_hydrating) return _hydrating;

  _hydrating = (async () => {
    const saved = await readJSON<Library[]>(STORAGE_KEYS.libraries, []);
    _libraries = Array.isArray(saved) ? saved : [];
    _hydrated = true;
    emit();
  })();

  return _hydrating;
}

async function persist(next: Library[]) {
  _libraries = next;
  emit(); // update UI immediately everywhere
  await writeJSON(STORAGE_KEYS.libraries, next);
}

function buildById(libs: Library[]) {
  const map = new Map<string, Library>();
  for (const l of libs) map.set(l.id, l);
  return map;
}

/** -------- Actions -------- */
async function createLibrary(name: string) {
  await ensureHydrated();
  const now = Date.now();
  const lib: Library = {
    id: uuid(),
    name: name.trim() || "New Library",
    createdAt: now,
    updatedAt: now,
    items: [],
    sortMode: "ADDED_NEWEST",
  };
  await persist([lib, ..._libraries]);
  return lib.id;
}

async function renameLibrary(id: string, name: string) {
  await ensureHydrated();
  const now = Date.now();
  await persist(
    _libraries.map((l) =>
      l.id === id ? { ...l, name: name.trim() || l.name, updatedAt: now } : l
    )
  );
}

async function deleteLibrary(id: string) {
  await ensureHydrated();
  await persist(_libraries.filter((l) => l.id !== id));
}

async function addSongToLibrary(libraryId: string, songId: string) {
  await ensureHydrated();
  const now = Date.now();
  await persist(
    _libraries.map((l) => {
      if (l.id !== libraryId) return l;
      if (l.items.some((it) => it.songId === songId)) return l; // no dupes
      return {
        ...l,
        items: [...l.items, { songId, addedAt: now }],
        updatedAt: now,
      };
    })
  );
}

async function removeSongFromLibrary(libraryId: string, songId: string) {
  await ensureHydrated();
  const now = Date.now();
  await persist(
    _libraries.map((l) => {
      if (l.id !== libraryId) return l;
      return {
        ...l,
        items: l.items.filter((it) => it.songId !== songId),
        updatedAt: now,
      };
    })
  );
}

async function moveSong(libraryId: string, fromIndex: number, toIndex: number) {
  await ensureHydrated();
  const now = Date.now();
  await persist(
    _libraries.map((l) => {
      if (l.id !== libraryId) return l;
      const items = [...l.items];
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= items.length ||
        toIndex >= items.length
      ) {
        return l;
      }
      const [moved] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, moved);
      return { ...l, items, updatedAt: now };
    })
  );
}

// ✅ NEW: set per-library sort mode
async function setLibrarySortMode(libraryId: string, sortMode: LibrarySortMode) {
  await ensureHydrated();
  const now = Date.now();
  await persist(
    _libraries.map((l) =>
      l.id === libraryId ? { ...l, sortMode, updatedAt: now } : l
    )
  );
}

/** -------- Snapshot (cached) -------- */
function buildSnapshot() {
  return {
    hydrated: _hydrated,
    libraries: _libraries,
    byId: buildById(_libraries),

    createLibrary,
    renameLibrary,
    deleteLibrary,
    addSongToLibrary,
    removeSongFromLibrary,
    moveSong,
    setLibrarySortMode,
  };
}

function getSnapshot() {
  if (_cachedSnapshot && _cachedSnapshot.__v === _version) return _cachedSnapshot;
  const snap = Object.assign(buildSnapshot(), { __v: _version });
  _cachedSnapshot = snap;
  return snap;
}

function subscribe(cb: () => void) {
  _listeners.add(cb);
  void ensureHydrated(); // start hydration once anyone subscribes
  return () => _listeners.delete(cb);
}

export function useLibraries() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
