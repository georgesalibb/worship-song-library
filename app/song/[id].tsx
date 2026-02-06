import { StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getSongById } from "@/source/data/songRepo";


export default function SongDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const song = getSongById(String(id));

  if (!song) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Song not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">{song.title}</ThemedText>
      <ThemedText style={styles.meta}>{song.language}</ThemedText>
      <ThemedText style={styles.lyrics}>{song.lyrics}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 60 },
  meta: { marginTop: 6, opacity: 0.7 },
  lyrics: { marginTop: 16, lineHeight: 22 },
});
