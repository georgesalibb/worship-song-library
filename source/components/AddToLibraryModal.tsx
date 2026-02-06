import React, { useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import { colors } from "../theme/colors";
import { useLibraries } from "../stores/useLibraries";

type Props = {
  visible: boolean;
  onClose: () => void;
  songId: string | null;
};

export function AddToLibraryModal({ visible, onClose, songId }: Props) {
  const { libraries, addSongToLibrary, createLibrary } = useLibraries();
  const [newName, setNewName] = useState("");

  const list = useMemo(() => libraries, [libraries]);

  const onAdd = async (libraryId: string) => {
    if (!songId) return;
    await addSongToLibrary(libraryId, songId);
    onClose();
  };

  const onCreate = async () => {
    const name = newName.trim();
    if (!name) {
      Alert.alert("Name required", "Give your library a name.");
      return;
    }
    const id = await createLibrary(name);
    setNewName("");
    if (songId) await addSongToLibrary(id, songId);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <Text style={styles.title}>Add to Library</Text>

        <View style={styles.createRow}>
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="New library name…"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <Pressable onPress={onCreate} style={styles.primaryBtn} disabled={!songId}>
            <Text style={styles.primaryBtnText}>Create</Text>
          </Pressable>
        </View>

        <View style={{ height: 10 }} />

        {libraries.length === 0 ? (
          <Text style={styles.empty}>No libraries yet. Create one above.</Text>
        ) : (
          <FlatList
            data={list}
            keyExtractor={(l) => l.id}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            renderItem={({ item }) => (
              <Pressable onPress={() => onAdd(item.id)} style={styles.row} disabled={!songId}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{item.name}</Text>
                  <Text style={styles.rowMeta}>{item.items.length} songs</Text>
                </View>
                <Text style={styles.rowPlus}>＋</Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    maxHeight: "70%",
  },
  title: { color: colors.text, fontSize: 18, fontWeight: "900", marginBottom: 12 },
  createRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  primaryBtn: { backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14 },
  primaryBtnText: { color: colors.text, fontWeight: "900" },
  empty: { color: colors.muted, paddingVertical: 10 },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowTitle: { color: colors.text, fontWeight: "800", fontSize: 16 },
  rowMeta: { color: colors.muted, marginTop: 2, fontSize: 12 },
  rowPlus: { color: colors.primary, fontSize: 22, fontWeight: "900" },
  sep: { height: 1, backgroundColor: colors.border },
});
