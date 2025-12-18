import {View, Text, TouchableOpacity, ActivityIndicator, FlatList, TextInput} from 'react-native';
import {useTheme} from "@/app/context/ThemeContext";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, {useEffect, useState} from 'react';
import Header from "@/app/components/Header";
import CurrencyChange from "@/app/components/CurrencyChange";
import {router} from "expo-router";
import Menu from "@/app/components/Menu";

interface Price {
    id: string;
    name: string;
    symbol: string;
    current_price: number;
}

type PriceKey = keyof Price;

const prices = () => {
    const { isDark, toggleTheme } = useTheme();
    const [prices, setPrices] = useState<Price[]>([]);
    const [filteredPrices, setFilteredPrices] = useState<Price[]>([]);
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState('name');
    const [sortAsc, setSortAsc] = useState(true);
    const [loading, setLoading] = useState(false);
    const [exchangeRate, setExchangeRate] = useState(1);
    const [currencySymbol, setCurrencySymbol] = useState("$");

    useEffect(() => {
        fetchPrices();
    }, []);

    const fetchPrices = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://wealthy-0mga.onrender.com/api/price/');
            const data: Price[] = await response.json();
            setPrices(data);
        } catch (err) {
            console.error('Error fetching prices:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text: string) => {
        setSearch(text);
        const filtered = prices.filter(item =>
            item.name.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredPrices(filtered);
    };

    const handleSort = (key: PriceKey) => {
        const asc = key === sortKey ? !sortAsc : true;
        setSortKey(key);
        setSortAsc(asc);

        const source = filteredPrices.length > 0 || search ? filteredPrices : prices;

        const sorted = [...source].sort((a, b) => {
            const valA = key === 'current_price' ? Number(a[key]) : a[key];
            const valB = key === 'current_price' ? Number(b[key]) : b[key];

            if (valA < valB) return asc ? -1 : 1;
            if (valA > valB) return asc ? 1 : -1;
            return 0;
        });
        setFilteredPrices(sorted);
    };



    const renderHeader = () => (
        <View className={`flex-row ${isDark ? "bg-buttons-dark" : "bg-buttons"} p-2 px-4 border-b border-gray-300`}>
            <TouchableOpacity onPress={() => handleSort('name')} className="flex-1">
                <Text className={`font-bold text-xl ${isDark ? "text-text-dark" : "text-text"}`}>
                    Name {sortKey === 'name' ? (sortAsc ? '↑' : '↓') : ''}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSort('symbol')} className="flex-1">
                <Text className={`font-bold text-xl ${isDark ? "text-text-dark" : "text-text"}`}>
                    Symbol {sortKey === 'symbol' ? (sortAsc ? '↑' : '↓') : ''}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSort('current_price')} className="flex-1">
                <Text className={`font-bold text-xl ${isDark ? "text-text-dark" : "text-text"}`}>
                    Current price {sortKey === 'current_price' ? (sortAsc ? '↑' : '↓') : ''}
                </Text>
            </TouchableOpacity>
            <Text className={`font-bold text-xl ${isDark ? "text-text-dark" : "text-text"}`}>
                Add alert
            </Text>
        </View>
    );

    const onSelectedExchangeRate = (selectedExchangeRate: number) => {
        setExchangeRate(selectedExchangeRate);
    }

    const onSelectedCurrencySymbol = (selectedCurrencySymbol: string) => {
        setCurrencySymbol(selectedCurrencySymbol);
    }

    return (
        <SafeAreaView className={`flex-1 ${isDark ? "bg-headers-dark" : "bg-headers"}`}>

            <Header title={"CHECK PRICES"} />

            <View className={`flex-[5] z-0 ${isDark ? "bg-background-dark" : "bg-background"}`}>
                <CurrencyChange setExchangeRate={onSelectedExchangeRate} setCurrencySymbol={onSelectedCurrencySymbol} />
                <TextInput
                    className={`p-2 mb-2 ${isDark ? "text-text-dark" : "text-text"}`}
                    placeholder={"Search by name..."}
                    placeholderTextColor={isDark ? '#ffffff' : '#000000'}
                    value={search}
                    onChangeText={handleSearch}
                />

                {loading ? (
                    <ActivityIndicator size="large" />
                ):(
                    <FlatList
                        data={filteredPrices.length > 0 || search ? filteredPrices : prices}
                        keyExtractor={(item) => item.symbol}
                        ListHeaderComponent={renderHeader}
                        stickyHeaderIndices={[0]}
                        renderItem={({item}) => (
                            <View className={`flex-row py-2 border-b border-gray-300 px-4`}>
                                <Text className={`flex-1 text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                    {item.name}
                                </Text>
                                <Text className={`flex-1 text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                    {item.symbol}
                                </Text>
                                <Text className={`flex-1 text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                    {currencySymbol} {(item.current_price / exchangeRate).toFixed(2)}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => router.replace(`/alerts/${item.id}`)}
                                    className={`px-8 py-3 min-h-12 min-w-10`}
                                >
                                    <Text className={`text-l text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                                        ➕
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        />
                )
                }
            </View>

            <Menu  page={"PRICES"}/>

        </SafeAreaView>
    );
}

export default prices;
