import React, { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, FlatList, Pressable, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useLibraries } from "@/source/stores/useLibraries";

// if you already use songs.json here keep it
import songsJson from "@/source/data/songs.json";
import type { Song } from "@/source/data/songRepo";

export default function AddSongsToLibraryScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme ?? "light"];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { hydrated, byId, addSongToLibrary } = useLibraries();
  const lib = byId.get(String(id));

  const allSongs = songsJson as Song[];

  const [q, setQ] = useState("");

  // ✅ wait for hydration (prevents "Library not found" flash)
  if (!hydrated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "800", color: c.text }}>
            Loading…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!lib) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "800", color: c.text }}>
            Library not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const addedSet = useMemo(
    () => new Set(lib.items.map((it) => it.songId)),
    [lib.items]
  );

  const results = useMemo(() => {
    const v = q.trim().toLowerCase();
    if (!v) return allSongs;
    return allSongs.filter((s) => {
      const title = (s.title ?? "").toLowerCase();
      const lyrics = (s.lyrics ?? "").toLowerCase();
      return title.includes(v) || lyrics.includes(v);
    });
  }, [q, allSongs]);

  const onAdd = async (songId: string) => {
    await addSongToLibrary(lib.id, songId);
    // ✅ no alert needed; button will flip to "Added"
  };

  const onDone = () => {
    // ✅ explicit return to the library detail screen (NOT Home)
    router.replace({
      pathname: "/(tabs)/favourites/[id]",
      params: { id: lib.id },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ padding: 16, gap: 12, flex: 1 }}>
        <Text style={{ fontSize: 20, fontWeight: "900", color: c.text }}>
          Add songs
        </Text>
        <Text style={{ color: c.tabIconDefault }}>Adding to: {lib.name}</Text>

        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search songs…"
          placeholderTextColor={c.tabIconDefault}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 14,
            backgroundColor: "#FFFFFF",
            borderWidth: 1,
            borderColor: "#E5E5EA",
            color: c.text,
          }}
        />

        <FlatList
          data={results}
          keyExtractor={(s) => s.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          renderItem={({ item }) => {
            const alreadyAdded = addedSet.has(item.id);

            return (
              <View
                style={{
                  padding: 14,
                  borderRadius: 14,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E5E5EA",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "800", color: c.text }}>
                    {item.title}
                  </Text>
                  <Text style={{ marginTop: 6, color: c.tabIconDefault }} numberOfLines={2}>
                    {item.lyrics}
                  </Text>
                </View>

                <Pressable
                  disabled={alreadyAdded}
                  onPress={() => onAdd(item.id)}
                  style={({ pressed }) => ({
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 14,
                    backgroundColor: alreadyAdded ? "#E5E5EA" : c.tint,
                    opacity: alreadyAdded ? 1 : pressed ? 0.85 : 1,
                  })}
                >
                  <Text
                    style={{
                      color: alreadyAdded ? c.text : "#FFFFFF",
                      fontWeight: "900",
                    }}
                  >
                    {alreadyAdded ? "Added" : "Add"}
                  </Text>
                </Pressable>
              </View>
            );
          }}
        />

        <Pressable
          onPress={onDone}
          style={({ pressed }) => ({
            paddingVertical: 12,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "#E5E5EA",
            backgroundColor: "#FFFFFF",
            alignItems: "center",
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ fontWeight: "900", color: c.text }}>Done</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
