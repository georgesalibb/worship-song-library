import React, { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getAllSongs, searchSongs, Song } from "@/source/data/songRepo";
import { songHref } from "@/source/navigation/songHref";

import { SearchBarWithHistory } from "@/source/components/SearchBarWithHistory";
import { useSearchHistory } from "@/source/stores/useSearchHistory";

export default function HomeScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme ?? "light"];
  const router = useRouter();

  const [query, setQuery] = useState("");
  const { add: addToHistory } = useSearchHistory();

  const songs = useMemo(() => {
    return query.trim() ? searchSongs(query) : getAllSongs();
  }, [query]);

  const onSubmitSearch = (q: string) => {
    setQuery(q);
  };

  const renderItem = ({ item }: { item: Song }) => (
    <Pressable
      onPress={async () => {
        // ✅ store only explicit song selections
          await addToHistory(item.title);

          // optional but recommended UX
          setQuery(item.title);
        
        router.push(songHref(item.id));
      }}
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
          Songs
        </Text>

        <SearchBarWithHistory
          value={query}
          onChangeText={setQuery}
          onSubmit={onSubmitSearch}
          placeholder="Search songs..."
        />

        <FlatList
          data={songs}
          keyExtractor={(s) => s.id}
          renderItem={renderItem}
          contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text style={{ marginTop: 12, color: c.tabIconDefault }}>
              No results.
            </Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}
