import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SessionProvider } from "@/store/session.store";
import { SessionRouter } from "@/store/SessionRouter";
import { ChatRuntimeProvider } from "@/store/chat.store";
import { BridgeColors } from "@/ui";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={BridgeColors.Background} />
        <SessionProvider>
          <ChatRuntimeProvider>
            <SessionRouter />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: BridgeColors.Background },
                animation: "fade",
              }}
            />
          </ChatRuntimeProvider>
        </SessionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
