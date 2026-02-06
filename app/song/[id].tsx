import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getSongById } from "@/source/data/songRepo";
import { getFavourites, pushRecent, toggleFavourite } from "@/source/data/userState";

export default function SongDetailsScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme ?? "light"];

  const { id } = useLocalSearchParams<{ id: string }>();
  const songId = useMemo(
    () => (typeof id === "string" ? decodeURIComponent(id) : ""),
    [id]
  );

  const song = getSongById(songId);

  const [favs, setFavs] = useState<string[]>([]);
  const isFav = favs.includes(songId);

  useEffect(() => {
    (async () => {
      const current = await getFavourites();
      setFavs(current);
    })();
  }, []);

  useEffect(() => {
    if (!songId) return;
    // mark as recent when opened
    pushRecent(songId).catch(() => {});
  }, [songId]);

  async function onToggleFav() {
    if (!songId) return;
    const next = await toggleFavourite(songId);
    setFavs(next);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {!song ? (
          <Text style={{ color: c.text }}>Song not found.</Text>
        ) : (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Text style={{ flex: 1, fontSize: 24, fontWeight: "800", color: c.text }}>
                {song.title}
              </Text>

              <Pressable
                onPress={onToggleFav}
                style={({ pressed }) => ({
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#E5E5EA",
                  backgroundColor: "#FFFFFF",
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ color: isFav ? c.tint : c.tabIconDefault, fontWeight: "700" }}>
                  {isFav ? "♥" : "♡"}
                </Text>
              </Pressable>
            </View>

            <Text style={{ color: c.tabIconDefault }}>
              {song.language ?? "English"}
            </Text>

            <Text style={{ fontSize: 16, lineHeight: 24, color: c.text }}>
              {song.lyrics}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
