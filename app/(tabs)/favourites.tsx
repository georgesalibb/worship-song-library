import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, FlatList, Pressable, TextInput, Alert } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getSongById, Song } from "@/source/data/songRepo";
import { getFavourites } from "@/source/data/userState";
import { songHref } from "@/source/navigation/songHref";
import { useLibraries } from "@/source/stores/useLibraries";

type Mode = "favourites" | "libraries";

export default function FavouritesScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme ?? "light"];
  const router = useRouter();

  const [mode, setMode] = React.useState<Mode>("favourites");

  // favourites
  const [songs, setSongs] = React.useState<Song[]>([]);

  // libraries
  const { libraries, createLibrary, deleteLibrary } = useLibraries();
  const [newLibName, setNewLibName] = React.useState("");

  const loadFavourites = React.useCallback(async () => {
    const favIds = await getFavourites();
    const favSongs = favIds
      .map((id) => getSongById(id))
      .filter((s): s is Song => Boolean(s));
    setSongs(favSongs);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadFavourites();
    }, [loadFavourites])
  );

  const renderFavItem = ({ item }: { item: Song }) => (
    <Pressable
      onPress={() => router.push(songHref(item.id))}
      style={({ pressed }) => ({
        padding: 14,
        borderRadius: 14,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E5EA",
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Text style={{ fontSize: 16, fontWeight: "700", color: c.text }}>
        {item.title}
      </Text>
      <Text style={{ marginTop: 6, color: c.tabIconDefault }} numberOfLines={2}>
        {item.lyrics}
      </Text>
    </Pressable>
  );

  const openLibrary = (id: string) => {
    router.push({
      pathname: "/(tabs)/favourites/[id]",
      params: { id },
    });
  };

  const onCreateLibrary = async () => {
    const name = newLibName.trim();
    if (!name) {
      Alert.alert("Name required", "Give your library a name.");
      return;
    }
    await createLibrary(name);
    setNewLibName("");
  };

  const onDeleteLibrary = (id: string) => {
    Alert.alert("Delete library?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteLibrary(id) },
    ]);
  };

  const SegButton = ({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: active ? c.tint : "#FFFFFF",
        borderWidth: 1,
        borderColor: active ? c.tint : "#E5E5EA",
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text
        style={{
          fontWeight: "800",
          color: active ? "#FFFFFF" : c.text,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ padding: 16, gap: 12, flex: 1 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", color: c.text }}>
          Favourites
        </Text>

        {/* Segmented toggle */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <SegButton
            label="Favourites"
            active={mode === "favourites"}
            onPress={() => setMode("favourites")}
          />
          <SegButton
            label="Libraries"
            active={mode === "libraries"}
            onPress={() => setMode("libraries")}
          />
        </View>

        {mode === "favourites" ? (
          <FlatList
            data={songs}
            keyExtractor={(s) => s.id}
            renderItem={renderFavItem}
            contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
            ListEmptyComponent={
              <Text style={{ color: c.tabIconDefault }}>
                No favourites yet. Tap ♥ on a song.
              </Text>
            }
          />
        ) : (
          <>
            {/* Create library */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TextInput
                value={newLibName}
                onChangeText={setNewLibName}
                placeholder="New library name…"
                placeholderTextColor={c.tabIconDefault}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 14,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E5E5EA",
                  color: c.text,
                }}
              />
              <Pressable
                onPress={onCreateLibrary}
                style={({ pressed }) => ({
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 14,
                  backgroundColor: c.tint,
                  opacity: pressed ? 0.85 : 1,
                  justifyContent: "center",
                })}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>
                  Create
                </Text>
              </Pressable>
            </View>

            {/* Libraries list */}
            <FlatList
              data={libraries}
              keyExtractor={(l) => l.id}
              contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
              ListEmptyComponent={
                <Text style={{ color: c.tabIconDefault }}>
                  No libraries yet. Create one above.
                </Text>
              }
              renderItem={({ item }) => (
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
                    onPress={() => openLibrary(item.id)}
                    style={({ pressed }) => ({
                      flex: 1,
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <Text style={{ fontSize: 16, fontWeight: "800", color: c.text }}>
                      {item.name}
                    </Text>
                    <Text style={{ marginTop: 6, color: c.tabIconDefault }}>
                      {item.items.length} songs
                    </Text>
                  </Pressable>

                  <Pressable onPress={() => onDeleteLibrary(item.id)} hitSlop={10}>
                    <Text style={{ color: "#FF3B30", fontWeight: "900" }}>
                      Delete
                    </Text>
                  </Pressable>
                </View>
              )}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
