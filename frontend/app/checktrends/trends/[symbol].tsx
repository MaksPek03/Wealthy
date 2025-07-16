import {View, Text, TouchableOpacity, ActivityIndicator, FlatList, TextInput} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {useTheme} from "@/app/context/ThemeContext";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, {useEffect, useState} from 'react';
import Graph from "@/app/components/Graph";
import FilterHistory from "@/app/components/filterHistory";


interface Price {
    price: number;
    date_recorded: Date;
}

export default function AssetScreen() {
    const { symbol } = useLocalSearchParams();
    const { isDark, toggleTheme } = useTheme();
    const router = useRouter();
    const [prices, setPrices] = useState<Price[]>([]);
    const [name, setName] = useState<string>('');
    const [price, setPrice] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<string>("1");

    useEffect(() => {
        fetchAssetData();
        fetchHistory();
    }, [symbol]);

    useEffect(() => {
        fetchHistory();
    }, [selectedFilter, symbol]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://wealthy-0mga.onrender.com/api/asset/${symbol}/history/${selectedFilter}/`);
            const raw: Price[] = await response.json();

            const data: Price[] = raw.map((item: any) => ({
                price: parseFloat(item.price),
                date_recorded: new Date(item.date_recorded),
            })).sort((a, b) => a.date_recorded.getTime() - b.date_recorded.getTime());

            setPrices(data);
        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssetData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://wealthy-0mga.onrender.com/api/asset/${symbol}/price/`);
            const json = await response.json();

            setName(json.name.toUpperCase());
            setPrice(json.current_price);
        } catch (err) {
            console.error('Error fetching name:', err);
        } finally {
            setLoading(false);
        }
    }

    const onSelectedFilter = (selectedFilter: string) => {

        setSelectedFilter(selectedFilter)
    }

    const graphPoints = prices.map(p => ({
        timestamp: p.date_recorded.getTime(),
        value: p.price,
    }));

    return (
        <SafeAreaView className={`flex-1 ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
            <View className={`flex-[1] justify-center items-center relative ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
                <Text className={`text-6xl ${isDark ? "text-headers-text-dark" : "text-headers-text"}`}>{name} TRENDS</Text>
            </View>
            <View className={`flex-[5] ${isDark ? "bg-background-dark" : "bg-background"}`}>

                <View className={`flex-row justify-around py-5 bg-no-selected`}>
                    <FilterHistory filterDay={"1"} filterText={"24h"} selectedFilter={selectedFilter} setSelectedFilter={onSelectedFilter} />
                    <FilterHistory filterDay={"7"} filterText={"7d"} selectedFilter={selectedFilter} setSelectedFilter={onSelectedFilter} />
                    <FilterHistory filterDay={"30"} filterText={"30d"} selectedFilter={selectedFilter} setSelectedFilter={onSelectedFilter} />
                    <FilterHistory filterDay={"365"} filterText={"1y"} selectedFilter={selectedFilter} setSelectedFilter={onSelectedFilter} />
                    <FilterHistory filterDay={"max"} filterText={"All"} selectedFilter={selectedFilter} setSelectedFilter={onSelectedFilter} />
                </View>
                {graphPoints.length === 0 ? (
                    <ActivityIndicator size="large" />
                ):(
                    <View >
                        <Graph points={graphPoints} currentPrice={price} />
                    </View>
                )}
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
