import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "react-native";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme ?? "light"];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: c.text }}>
          Profile
        </Text>
        <Text style={{ marginTop: 8, color: c.tabIconDefault }}>
          Settings will live here (font size, language later, etc.).
        </Text>
      </View>
    </SafeAreaView>
  );
}
