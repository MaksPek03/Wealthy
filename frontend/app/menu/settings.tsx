import {View, Text, TouchableOpacity} from 'react-native';
import { useRouter} from 'expo-router';
import {useTheme} from "@/app/context/ThemeContext";
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
// import {useLanguage} from "@/app/context/LanguageContext";

const Settings= ()=> {
    const { isDark, toggleTheme } = useTheme();
    // const { polish, toggleLanguage } = useLanguage();
    const router = useRouter();

    return (
        <SafeAreaView className={`flex-1 ${isDark ? "bg-headers-dark" : "bg-headers"}`}>

            <Header title={"SETTINGS"}/>

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
                    onPress={() => router.push('/start')}
                    className={`px-8 py-4 min-h-14 min-w-96 mt-14 rounded-3xl bg-red-500`}
                >
                    <Text className={`text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                        Log out
                    </Text>
                </TouchableOpacity>
            </View>

            <Footer backButton={true}/>

        </SafeAreaView>
    );
}

export default Settings;
