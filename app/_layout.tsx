import { Stack } from "expo-router";

import { useFirebaseSync } from "@/hooks/useFirebaseSync";

export default function RootLayout() {
  useFirebaseSync();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
