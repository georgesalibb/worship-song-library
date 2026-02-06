import { useSyncExternalStore } from "react";
import { STORAGE_KEYS } from "../storage/keys";
import { readJSON, writeJSON } from "../storage/json";

type Snapshot = {
  hydrated: boolean;
  items: string[];
  add: (query: string) => Promise<void>;
  remove: (query: string) => Promise<void>;
  clear: () => Promise<void>;
};

const MAX_ITEMS = 12;

let _hydrated = false;
let _hydrating: Promise<void> | null = null;
let _items: string[] = [];
let _version = 0;

const _listeners = new Set<() => void>();
let _cached: (Snapshot & { __v: number }) | null = null;

function emit() {
  _version++;
  _cached = null;
  for (const l of _listeners) l();
}

async function ensureHydrated() {
  if (_hydrated) return;
  if (_hydrating) return _hydrating;

  _hydrating = (async () => {
    const saved = await readJSON<string[]>(STORAGE_KEYS.searchHistory, []);
    _items = Array.isArray(saved) ? saved.filter((x) => typeof x === "string") : [];
    _hydrated = true;
    emit();
  })();

  return _hydrating;
}

async function persist(next: string[]) {
  _items = next;
  emit();
  await writeJSON(STORAGE_KEYS.searchHistory, next);
}

function normalize(q: string) {
  return q.trim().replace(/\s+/g, " ");
}

async function add(query: string) {
  await ensureHydrated();
  const q = normalize(query);
  if (!q) return;

  // dedupe case-insensitive, keep most recent at top
  const lower = q.toLowerCase();
  const next = [q, ..._items.filter((x) => x.toLowerCase() !== lower)].slice(0, MAX_ITEMS);
  await persist(next);
}

async function remove(query: string) {
  await ensureHydrated();
  const q = normalize(query);
  if (!q) return;

  const lower = q.toLowerCase();
  await persist(_items.filter((x) => x.toLowerCase() !== lower));
}

async function clear() {
  await ensureHydrated();
  await persist([]);
}

function buildSnapshot(): Snapshot {
  return {
    hydrated: _hydrated,
    items: _items,
    add,
    remove,
    clear,
  };
}

function getSnapshot() {
  if (_cached && _cached.__v === _version) return _cached;
  _cached = Object.assign(buildSnapshot(), { __v: _version });
  return _cached;
}

function subscribe(cb: () => void) {
  _listeners.add(cb);
  void ensureHydrated();
  return () => _listeners.delete(cb);
}

export function useSearchHistory() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
