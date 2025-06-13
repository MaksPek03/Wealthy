import {View, Text, TouchableOpacity} from 'react-native';
import { useRouter} from 'expo-router';
import {useTheme} from "@/app/context/ThemeContext";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, {useEffect, useState} from 'react';

export default function MainMenu() {
    const { isDark, toggleTheme } = useTheme();
    const router = useRouter();
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(false);

    return (
        <SafeAreaView className={`flex-1 ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
            <View className={`flex-[1] justify-center items-center relative ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
                <Text className={`text-6xl ${isDark ? "text-headers-text-dark" : "text-headers-text"}`}>CHECK PRICES</Text>
            </View>
            <View className={`flex-[5] justify-center items-center ${isDark ? "bg-background-dark" : "bg-background"}`}>

            </View>

            <View className={`flex-[1] justify-center items-center ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
            </View>
        </SafeAreaView>
    );
}
