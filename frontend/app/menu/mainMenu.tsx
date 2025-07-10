import {View, Text, TouchableOpacity} from 'react-native';
import { useRouter} from 'expo-router';
import {useTheme} from "@/app/context/ThemeContext";
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

const MainMenu = () => {
    const { isDark, toggleTheme } = useTheme();
    const router = useRouter();

    return (
        <SafeAreaView className={`flex-1 ${isDark ? "bg-headers-dark" : "bg-headers"}`}>

            <Header title={"MAIN PAGE"} settings={true}/>

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

            <Footer backButton={false}/>

        </SafeAreaView>
    );
}

export default MainMenu;
