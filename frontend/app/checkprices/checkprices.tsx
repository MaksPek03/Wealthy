import {View, Text, TouchableOpacity, ActivityIndicator, FlatList} from 'react-native';
import { useRouter} from 'expo-router';
import {useTheme} from "@/app/context/ThemeContext";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, {useEffect, useState} from 'react';

export default function MainMenu() {
    const { isDark, toggleTheme } = useTheme();
    const router = useRouter();
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPrices();
    }, []);

    const fetchPrices = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://wealthy-0mga.onrender.com/api/price/');
            const data = await response.json();
            setPrices(data);
        } catch (err) {
            console.error('Error fetching prices:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className={`flex-1 ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
            <View className={`flex-[1] justify-center items-center relative ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
                <Text className={`text-6xl ${isDark ? "text-headers-text-dark" : "text-headers-text"}`}>CHECK PRICES</Text>
            </View>
            <View className={`flex-[5] justify-center items-center ${isDark ? "bg-background-dark" : "bg-background"}`}>

            <View className={`flex-[5] ${isDark ? "bg-background-dark" : "bg-background"}`}>
                {loading ? (
                    <ActivityIndicator size="large" />
                ):(
                    <FlatList
                        data={prices}
                        keyExtractor={(item) => item.symbol}
                        renderItem={({item}) => (
                            <View className={`flex-row py-2 border-b border-gray-300 px-4`}>
                                <Text className={`flex-1`}>{item.name}</Text>
                                <Text className={`flex-1`}>{item.symbol}</Text>
                                <Text className={`flex-1`}>$ {item.current_price}</Text>
                            </View>
                        )}
                        />
                )
                }
            </View>

            <View className={`flex-[1] justify-center items-center ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
            </View>
        </SafeAreaView>
    );
}
