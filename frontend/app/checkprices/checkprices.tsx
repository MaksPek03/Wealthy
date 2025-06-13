import {View, Text, TouchableOpacity, ActivityIndicator, FlatList, TextInput} from 'react-native';
import { useRouter} from 'expo-router';
import {useTheme} from "@/app/context/ThemeContext";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, {useEffect, useState} from 'react';

export default function MainMenu() {
    const { isDark, toggleTheme } = useTheme();
    const router = useRouter();
    const [prices, setPrices] = useState([]);
    const [filteredPrices, setFilteredPrices] = useState([]);
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState('name');
    const [sortAsc, setSortAsc] = useState(true);
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

    const handleSearch = (text) => {
        setSearch(text);
        const filtered = prices.filter(item =>
            item.name.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredPrices(filtered);
    };

    const handleSort = (key) => {
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
        <View className="flex-row bg-gray-200 p-2 px-4 border-b border-gray-300">
            <TouchableOpacity onPress={() => handleSort('name')} className="flex-1">
                <Text className="font-bold">
                    Name {sortKey === 'name' ? (sortAsc ? '↑' : '↓') : ''}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSort('symbol')} className="flex-1">
                <Text className="font-bold">
                    Symbol {sortKey === 'symbol' ? (sortAsc ? '↑' : '↓') : ''}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSort('current_price')} className="flex-1">
                <Text className="font-bold">
                    Current price {sortKey === 'current_price' ? (sortAsc ? '↑' : '↓') : ''}
                </Text>
            </TouchableOpacity>
        </View>
    );


    return (
        <SafeAreaView className={`flex-1 ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
            <View className={`flex-[1] justify-center items-center relative ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
                <Text className={`text-6xl ${isDark ? "text-headers-text-dark" : "text-headers-text"}`}>CHECK PRICES</Text>
            </View>
            <View className={`flex-[5] ${isDark ? "bg-background-dark" : "bg-background"}`}>
                <TextInput
                    className=" p-2 mb-2"
                    placeholder="Search by name..."
                    value={search}
                    onChangeText={handleSearch}
                />

                renderHeader
                {loading ? (
                    <ActivityIndicator size="large" />
                ):(
                    <FlatList
                        data={filteredPrices.length > 0 || search ? filteredPrices : prices}
                        keyExtractor={(item) => item.symbol}
                        ListHeaderComponent={renderHeader}
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
