import {View, Text, TouchableOpacity} from 'react-native';
import { useRouter} from 'expo-router';
import {useTheme} from "@/app/context/ThemeContext";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Register() {
    const { isDark, toggleTheme } = useTheme();
    const router = useRouter();

    return (
        <SafeAreaView className={`flex-1 ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
            <View className={`flex-[1] justify-center items-center relative ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
                <TouchableOpacity
                    onPress={() => router.push('/menu/settings')}
                    className={`absolute top-10 left-5 ${isDark ? "text-headers-text-dark" : "text-headers-text"}`}
                >
                    <Text className={`text-lg font-bold ${isDark ? "text-headers-text-dark" : "text-headers-text"}`}>SET</Text>
                </TouchableOpacity>

                <Text className={`text-6xl ${isDark ? "text-headers-text-dark" : "text-headers-text"}`}>MAIN PAGE</Text>
            </View>
            <View className={`flex-[5] justify-center items-center ${isDark ? "bg-background-dark" : "bg-background"}`}>
                <TouchableOpacity
                    onPress={() => router.push('/wallets/wallets')}
                    className={`px-8 py-4 min-h-14 min-w-72 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                >
                    <Text className={`text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>WALLETS</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push('/checkprices/checkprices')}
                    className={`px-8 py-4 min-h-14 min-w-72 mt-14 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                >
                    <Text className={`text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>CHECK PRICES</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push('/checktrends/checktrends')}
                    className={`px-10 py-4 min-h-14 min-w-72 mt-14 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                >
                    <Text className={`text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>CHECK TRENDS</Text>
                </TouchableOpacity>
            </View>

            <View className={`flex-[1] justify-center items-center ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
            </View>
        </SafeAreaView>
    );
}
