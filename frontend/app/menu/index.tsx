import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
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

            <Header title={"MAIN PAGE"} settings={true} alerts={true} />

            <View className={`flex-[5] justify-center items-center ${isDark ? "bg-background-dark" : "bg-background"}`}>

                <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                    <TouchableOpacity
                        onPress={() => router.replace('/wallets')}
                        className={`px-8 py-4 min-h-14 min-w-72 mt-14 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                    >
                        <Text className={`text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>WALLETS</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.replace('/prices')}
                        className={`px-8 py-4 min-h-14 min-w-72 mt-14 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                    >
                        <Text className={`text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>CHECK PRICES</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.replace('/history')}
                        className={`px-10 py-4 min-h-14 min-w-72 mt-14 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                    >
                        <Text className={`text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>CHECK HISTORY</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.replace('/friends')}
                        className={`px-10 py-4 min-h-14 min-w-72 mt-14 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                    >
                        <Text className={`text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>FRIENDS</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.replace('/trends')}
                        className={`px-10 py-4 min-h-14 min-w-72 mt-14 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                    >
                        <Text className={`text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>CHECK TRENDS</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.replace('/goals')}
                        className={`px-10 py-4 min-h-14 min-w-72 mt-14 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                    >
                        <Text className={`text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>GOALS</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.replace('/groups')}
                        className={`px-10 py-4 min-h-14 min-w-72 mt-14 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                    >
                        <Text className={`text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>GROUPS</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <Footer backButton={false}/>

        </SafeAreaView>
    );
}

export default MainMenu;
