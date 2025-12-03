import { Stack } from "expo-router";
import './globals.css';
import { ThemeProvider } from "./context/ThemeContext"
import React from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider>
                  <Stack screenOptions={{ headerShown: false }} />
          </ThemeProvider>
    </GestureHandlerRootView>
  );
}
