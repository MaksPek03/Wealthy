import {useTheme} from "@/app/context/ThemeContext";
import React, {useEffect, useState} from "react";
import Header from "@/app/components/Header";
import {ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View} from "react-native";
import CurrencyChange from "@/app/components/CurrencyChange";
import {SafeAreaView} from "react-native-safe-area-context";
import {router} from "expo-router";
import Menu from "@/app/components/Menu";


interface Alert {
    alertId: string;
    asset: string;
    alertPrice: number;
    currentPrice: number;
    difference: number;
    above: boolean;
    reached: boolean;
}

const alerts = () => {
    const { isDark, toggleTheme } = useTheme();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(false);
    const [exchangeRate, setExchangeRate] = useState(1);
    const [currencySymbol, setCurrencySymbol] = useState("$");


    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://wealthy-0mga.onrender.com/api/my_alerts/');
            const data = await response.json();
            setAlerts(data['alerts']);
        } catch (err) {
            console.error('Error fetching alerts:', err);
        } finally {
            setLoading(false);
        }
    };

    const onSelectedExchangeRate = (selectedExchangeRate: number) => {
        setExchangeRate(selectedExchangeRate);
    }

    const onSelectedCurrencySymbol = (selectedCurrencySymbol: string) => {
        setCurrencySymbol(selectedCurrencySymbol);
    }

    const renderHeader = () => (
        <View className={`flex-row ${isDark ? "bg-buttons-dark" : "bg-buttons"} p-2 px-4 border-b border-gray-300`}>
            <Text className={`font-bold text-l ${isDark ? "text-text-dark" : "text-text"}`}>
                Asset
            </Text>
            <Text className={`font-bold text-l ${isDark ? "text-text-dark" : "text-text"}`}>
                Alert price
            </Text>
            <Text className={`font-bold text-l ${isDark ? "text-text-dark" : "text-text"}`}>
                Current price
            </Text>
            <Text className={`font-bold text-l ${isDark ? "text-text-dark" : "text-text"}`}>
                Difference
            </Text>
            <Text className={`font-bold text-l ${isDark ? "text-text-dark" : "text-text"}`}>
                Below/above status
            </Text>
            <Text className={`font-bold text-l ${isDark ? "text-text-dark" : "text-text"}`}>
                Reached
            </Text>
        </View>
    );

    return (
        <SafeAreaView className={`flex-1 ${isDark ? "bg-headers-dark" : "bg-headers"}`}>

            <Header title={"ALERTS"} back={`/trends`} />

            <View className={`flex-[5] z-0 ${isDark ? "bg-background-dark" : "bg-background"}`}>
                <CurrencyChange setExchangeRate={onSelectedExchangeRate} setCurrencySymbol={onSelectedCurrencySymbol} />

                {loading ? (
                    <ActivityIndicator size="large" />
                ):(
                    <FlatList
                        data={alerts}
                        keyExtractor={(item) => item.alertId}
                        ListHeaderComponent={renderHeader}
                        stickyHeaderIndices={[0]}
                        renderItem={({item}) => (
                            <View className={`flex-row py-2 border-b border-gray-300 px-4`}>
                                <Text className={`flex-1 text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                    {item.asset}
                                </Text>
                                <Text className={`flex-1 text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                    {(item.alertPrice / exchangeRate).toFixed(2)}{currencySymbol}
                                </Text>
                                <Text className={`flex-1 text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                    {(item.currentPrice / exchangeRate).toFixed(2)}{currencySymbol}
                                </Text>
                                <Text className={`flex-1 text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                     {(item.difference / exchangeRate).toFixed(2)}{currencySymbol}
                                </Text>
                                <Text className={`flex-1 text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                    {item.above ? "Above" : "Below"}
                                </Text>
                                <Text className={`flex-1 text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                    {item.reached ? "✔️" : "❌"}
                                </Text>
                            </View>
                        )}
                    />
                )
                }
                <TouchableOpacity
                    onPress={() => router.replace(`/prices`)}
                    className={`px-8 py-4 min-h-14 min-w-72 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                >
                    <Text className={`text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                        ADD
                    </Text>
                </TouchableOpacity>
            </View>

            <Menu />

        </SafeAreaView>
    );
}

export default alerts;
