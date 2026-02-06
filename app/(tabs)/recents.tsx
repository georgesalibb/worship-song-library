import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, FlatList, Pressable } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getSongById, Song } from "@/source/data/songRepo";
import { getRecents } from "@/source/data/userState";
import { songHref } from "@/source/navigation/songHref";

export default function RecentsScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme ?? "light"];
  const router = useRouter();

  const [songs, setSongs] = React.useState<Song[]>([]);

  const load = React.useCallback(async () => {
    const ids = await getRecents();
    const recentSongs = ids
      .map((id) => getSongById(id))
      .filter((s): s is Song => Boolean(s));
    setSongs(recentSongs);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [load])
  );

  const renderItem = ({ item }: { item: Song }) => (
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ padding: 16, gap: 12, flex: 1 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", color: c.text }}>
          Recents
        </Text>

        <FlatList
          data={songs}
          keyExtractor={(s) => s.id}
          renderItem={renderItem}
          contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          ListEmptyComponent={
            <Text style={{ color: c.tabIconDefault }}>
              No recents yet. Open a song from Home.
            </Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}
