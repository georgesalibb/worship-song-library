import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Pressable, Image, Alert } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { useLibraries } from "@/source/stores/useLibraries";
import { getFavourites } from "@/source/data/userState";

// Optional: profile picture (Expo ImagePicker + AsyncStorage)
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

const PROFILE_KEYS = {
  avatarUri: "wsl_profile_avatar_uri_v1",
} as const;

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <View
      style={{
        flex: 1,
        padding: 14,
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E5EA",
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: "800", color: "#8E8E93" }}>
        {label}
      </Text>
      <Text style={{ marginTop: 8, fontSize: 22, fontWeight: "900", color: "#111" }}>
        {value}
      </Text>
    </View>
  );
}

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme ?? "light"];

  const { hydrated: libsHydrated, libraries } = useLibraries();

  const [favsCount, setFavsCount] = React.useState<number>(0);
  const [avatarUri, setAvatarUri] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const [favs, uri] = await Promise.all([
      getFavourites(),
      AsyncStorage.getItem(PROFILE_KEYS.avatarUri),
    ]);
    setFavsCount(favs.length);
    setAvatarUri(uri);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Please allow photo access to pick a profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const uri = result.assets?.[0]?.uri;
    if (!uri) return;

    await AsyncStorage.setItem(PROFILE_KEYS.avatarUri, uri);
    setAvatarUri(uri);
  };

  const removeAvatar = async () => {
    await AsyncStorage.removeItem(PROFILE_KEYS.avatarUri);
    setAvatarUri(null);
  };

  const onAvatarPress = () => {
    Alert.alert("Profile picture", "Choose an option:", [
      { text: "Pick photo", onPress: pickAvatar },
      ...(avatarUri ? [{ text: "Remove", style: "destructive" as const, onPress: removeAvatar }] : []),
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ padding: 16, gap: 14, flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable
            onPress={onAvatarPress}
            style={({ pressed }) => ({
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E5E5EA",
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.85 : 1,
              overflow: "hidden",
            })}
          >
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={{ width: 64, height: 64 }}
              />
            ) : (
              <Text style={{ fontSize: 20, fontWeight: "900", color: c.text }}>
                +
              </Text>
            )}
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: "900", color: c.text }}>
              Profile
            </Text>
            <Text style={{ marginTop: 4, color: c.tabIconDefault }}>
              Your stats + settings.
            </Text>
          </View>

          <Pressable
            onPress={() => Alert.alert("Settings", "Settings page coming next.")}
            style={({ pressed }) => ({
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 14,
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E5E5EA",
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ fontWeight: "900", color: c.text }}>Settings</Text>
          </Pressable>
        </View>

        {/* Stats: ONLY favourites + libraries */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <StatCard label="Favourites" value={favsCount} />
          <StatCard label="Libraries" value={libsHydrated ? libraries.length : "…"} />
        </View>

        <Text style={{ color: c.tabIconDefault, marginTop: 4 }}>
          Settings will live under the Settings button (font size, language, etc.).
        </Text>
      </View>
    </SafeAreaView>
  );
}
