import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from "@/app/context/ThemeContext";
import React from 'react';

const Welcome = () => {
    const { isDark, toggleTheme } = useTheme();
    const router = useRouter();

    return (
        <View className={`flex-1 justify-start items-center ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
            <Text className={`text-6xl mt-40  ${isDark ? "text-headers-text-dark" : "text-headers-text"}`}>WEALTHY</Text>
            <TouchableOpacity
                onPress={() => router.replace('/start/login')}
                className={`px-8 py-4 rounded-3xl min-h-14 min-w-40 mt-20 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
            >
                <Text className={`text-2xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>LOG IN</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => router.replace('/start/register')}
                className={`px-8 py-4 rounded-3xl min-h-14 min-w-40 mt-14 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
            >
                <Text className={`text-2xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>REGISTER</Text>
            </TouchableOpacity>
        </View>
    );
}

export default Welcome;
