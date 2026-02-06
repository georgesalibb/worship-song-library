import React from "react";
import { View, Text, TextInput, Pressable, FlatList } from "react-native";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSearchHistory } from "@/source/stores/useSearchHistory";

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  onSubmit: (q: string) => void; // called when user hits Search or taps a history item
  placeholder?: string;
};

export function SearchBarWithHistory({
  value,
  onChangeText,
  onSubmit,
  placeholder = "Search songs…",
}: Props) {
  const scheme = useColorScheme();
  const c = Colors[scheme ?? "light"];
  const { hydrated, items, remove, clear } = useSearchHistory();

  const [focused, setFocused] = React.useState(false);

  const showDropdown = focused && hydrated && items.length > 0;

  const submit = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <View style={{ gap: 8 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: 14,
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: "#E5E5EA",
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={c.tabIconDefault}
          style={{
            flex: 1,
            color: c.text,
            fontSize: 16,
            paddingVertical: 0,
          }}
          returnKeyType="search"
          onSubmitEditing={() => submit(value)}
        />

        <Pressable
          onPress={() => submit(value)}
          style={({ pressed }) => ({
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 12,
            backgroundColor: c.tint,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "900" }}>Search</Text>
        </Pressable>
      </View>

      {showDropdown ? (
        <View
          style={{
            borderRadius: 14,
            backgroundColor: "#FFFFFF",
            borderWidth: 1,
            borderColor: "#E5E5EA",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 10,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottomWidth: 1,
              borderBottomColor: "#F2F2F7",
            }}
          >
            <Text style={{ fontWeight: "900", color: c.text }}>Recent</Text>

            <Pressable
              onPress={() => clear()}
              style={({ pressed }) => ({
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 10,
                backgroundColor: "#F2F2F7",
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ fontWeight: "900", color: c.text }}>Clear</Text>
            </Pressable>
          </View>

          <FlatList
            data={items}
            keyExtractor={(x) => x}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: "#F2F2F7",
                }}
              >
                <Pressable
                  onPress={() => {
                    onChangeText(item);
                    // keep focus? doesn’t matter; user wants results now
                    onSubmit(item);
                  }}
                  style={({ pressed }) => ({
                    flex: 1,
                    paddingVertical: 4,
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <Text style={{ color: c.text, fontWeight: "700" }}>{item}</Text>
                </Pressable>

                <Pressable
                  onPress={() => remove(item)}
                  hitSlop={10}
                  style={({ pressed }) => ({
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "#FFD1D1",
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <Text style={{ color: "#FF3B30", fontWeight: "900" }}>×</Text>
                </Pressable>
              </View>
            )}
          />
        </View>
      ) : null}
    </View>
  );
}
