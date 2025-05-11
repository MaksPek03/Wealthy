import { Stack } from "expo-router";
import './globals.css';
import { ThemeProvider } from "./context/ThemeContext"
// import {LanguageProvider} from "@/app/context/LanguageContext";

export default function RootLayout() {
  return (
      <ThemeProvider>
          {/*<LanguageProvider>*/}
              <Stack screenOptions={{ headerShown: false }} />
          {/*</LanguageProvider>*/}
      </ThemeProvider>
  );
}
