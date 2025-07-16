import { Stack } from "expo-router";
import './globals.css';
import { ThemeProvider } from "./context/ThemeContext"
import React from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import {LanguageProvider} from "@/app/context/LanguageContext";

export default function RootLayout() {
  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider>
              {/*<LanguageProvider>*/}
                  <Stack screenOptions={{ headerShown: false }} />
              {/*</LanguageProvider>*/}
          </ThemeProvider>
    </GestureHandlerRootView>
  );
}
