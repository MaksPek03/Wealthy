import {View, Text, TouchableOpacity} from 'react-native';
import { useRouter} from 'expo-router';
import {useTheme} from "@/app/context/ThemeContext";
import { SafeAreaView } from 'react-native-safe-area-context';
// import {useLanguage} from "@/app/context/LanguageContext";

export default function Settings() {
    const { isDark, toggleTheme } = useTheme();
    // const { polish, toggleLanguage } = useLanguage();
    const router = useRouter();

    return (
        <SafeAreaView className={`flex-1 ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
            <View className={`flex-[1] justify-center items-center relative ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
                <Text className={`text-6xl ${isDark ? "text-headers-text-dark" : "text-headers-text"}`}>SETTINGS</Text>
            </View>
            <View className={`flex-[5] justify-center items-center ${isDark ? "bg-background-dark" : "bg-background"}`}>
                <TouchableOpacity
                    // onPress={toggleLanguage}
                    className={`px-8 py-4 min-h-14 min-w-96  rounded-3xl ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                >
                    {/*<Text className={`text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>*/}
                    {/*    {polish ? "Zmień język na angielski" : "Change language to polish"}*/}
                    {/*</Text>*/}
                    <Text className={`text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                        Change language to polish
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={toggleTheme}
                    className={`px-8 py-4 min-h-14 min-w-96 mt-14 rounded-3xl ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                >
                    <Text className={`text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                        Change theme to {isDark ? "light" : "dark"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push('/welcome_pages/welcome')}
                    className={`px-8 py-4 min-h-14 min-w-96 mt-14 rounded-3xl bg-red-500`}
                >
                    <Text className={`text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                        Log out
                    </Text>
                </TouchableOpacity>
            </View>

            <View className={`flex-[1] justify-center items-center ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className={`px-8 py-4 rounded-3xl min-h-10 min-w-40 mb-8 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                >
                    <Text className={`text-1xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>GO BACK</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
