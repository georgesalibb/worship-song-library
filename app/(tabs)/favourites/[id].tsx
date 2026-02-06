import React, { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, FlatList, Pressable, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useLibraries } from "@/source/stores/useLibraries";
import { getSongById } from "@/source/data/songRepo";
import { songHref } from "@/source/navigation/songHref";
import type { LibrarySortMode } from "@/source/types/library";

function sortLabel(mode: LibrarySortMode | undefined) {
  switch (mode) {
    case "TITLE_ASC":
      return "Title A → Z";
    case "TITLE_DESC":
      return "Title Z → A";
    case "ADDED_NEWEST":
      return "Date added (newest)";
    case "ADDED_OLDEST":
      return "Date added (oldest)";
    default:
      return "Date added (newest)";
  }
}

export default function LibraryDetailScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme ?? "light"];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    hydrated,
    byId,
    deleteLibrary,
    removeSongFromLibrary,
    setLibrarySortMode,
  } = useLibraries();

  const lib = byId.get(String(id));

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
    router.replace("/(tabs)/favourites");
    return null;
  }

  const currentSort: LibrarySortMode = lib.sortMode ?? "ADDED_NEWEST";

  const sortedItems = useMemo(() => {
    const items = [...lib.items];

    const titleFor = (songId: string) =>
      (getSongById(songId)?.title ?? "").toLowerCase();

    switch (currentSort) {
      case "TITLE_ASC":
        items.sort((a, b) => titleFor(a.songId).localeCompare(titleFor(b.songId)));
        break;
      case "TITLE_DESC":
        items.sort((a, b) => titleFor(b.songId).localeCompare(titleFor(a.songId)));
        break;
      case "ADDED_OLDEST":
        items.sort((a, b) => a.addedAt - b.addedAt);
        break;
      case "ADDED_NEWEST":
      default:
        items.sort((a, b) => b.addedAt - a.addedAt);
        break;
    }

    return items;
  }, [lib.items, currentSort]);

  const onDeleteLibrary = () => {
    Alert.alert("Delete library?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteLibrary(lib.id);
          router.replace("/(tabs)/favourites");
        },
      },
    ]);
  };

  const goAddSongs = () => {
    router.push({
      pathname: "/(tabs)/favourites/[id]/add",
      params: { id: lib.id },
    });
  };

  const openSortMenu = () => {
    Alert.alert("Order songs by", "Choose a sort option:", [
      {
        text: "Title A → Z",
        onPress: () => setLibrarySortMode(lib.id, "TITLE_ASC"),
      },
      {
        text: "Title Z → A",
        onPress: () => setLibrarySortMode(lib.id, "TITLE_DESC"),
      },
      {
        text: "Date added (newest → oldest)",
        onPress: () => setLibrarySortMode(lib.id, "ADDED_NEWEST"),
      },
      {
        text: "Date added (oldest → newest)",
        onPress: () => setLibrarySortMode(lib.id, "ADDED_OLDEST"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ padding: 16, gap: 12, flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: "900", color: c.text }}>
              {lib.name}
            </Text>
            <Text style={{ marginTop: 6, color: c.tabIconDefault }}>
              {lib.items.length} songs • {sortLabel(currentSort)}
            </Text>
          </View>

          <Pressable onPress={onDeleteLibrary} hitSlop={10}>
            <Text style={{ color: "#FF3B30", fontWeight: "900" }}>Delete</Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={goAddSongs}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 12,
              borderRadius: 14,
              backgroundColor: c.tint,
              alignItems: "center",
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Add songs</Text>
          </Pressable>

          <Pressable
            onPress={openSortMenu}
            style={({ pressed }) => ({
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 14,
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E5E5EA",
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ fontWeight: "900", color: c.text }}>Filter</Text>
          </Pressable>
        </View>

        <FlatList
          data={sortedItems}
          keyExtractor={(it) => it.songId}
          contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          ListEmptyComponent={
            <Text style={{ color: c.tabIconDefault }}>
              No songs yet. Tap “Add songs”.
            </Text>
          }
          renderItem={({ item }) => {
            const song = getSongById(item.songId);

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
                <Pressable
                  onPress={() => song && router.push(songHref(song.id))}
                  style={({ pressed }) => ({
                    flex: 1,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text style={{ fontSize: 16, fontWeight: "800", color: c.text }}>
                    {song?.title ?? `Unknown song (${item.songId})`}
                  </Text>

                  {song?.lyrics ? (
                    <Text style={{ marginTop: 6, color: c.tabIconDefault }} numberOfLines={2}>
                      {song.lyrics}
                    </Text>
                  ) : null}
                </Pressable>

                <Pressable
                  onPress={() => removeSongFromLibrary(lib.id, item.songId)}
                  style={({ pressed }) => ({
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#FFD1D1",
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text style={{ fontWeight: "900", color: "#FF3B30" }}>×</Text>
                </Pressable>
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}
