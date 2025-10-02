import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, TextInput } from 'react-native';
import { useRouter} from 'expo-router';
import { useTheme } from "@/app/context/ThemeContext";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, {useEffect, useState} from 'react';
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

interface Price {
    name: string;
    symbol: string;
    current_price: number;
}

const history = () => {
    const { isDark, toggleTheme } = useTheme();
    const router = useRouter();
    const [prices, setPrices] = useState<Price[]>([]);
    const [filteredPrices, setFilteredPrices] = useState<Price[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchListOfAssets();
    }, []);

    const fetchListOfAssets = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://wealthy-0mga.onrender.com/api/price/');
            const data: Price[] = await response.json();

            const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));

            setPrices(sorted);
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

    const renderHeader = () => (
        <View className={`flex-row ${isDark ? "bg-buttons-dark" : "bg-buttons"} p-2 px-4 border-b border-gray-300`}>
            <Text className={`font-bold text-xl flex-1 ${isDark ? "text-text-dark" : "text-text"}`}>
                Name
            </Text>
            <Text className={`font-bold text-xl flex-1 ${isDark ? "text-text-dark" : "text-text"}`}>
                Symbol
            </Text>
        </View>
    );


    return (
        <SafeAreaView className={`flex-1 ${isDark ? "bg-headers-dark" : "bg-headers"}`}>

            <Header title={"CHECK HISTORY"}/>

            <View className={`flex-[5] ${isDark ? "bg-background-dark" : "bg-background"}`}>
                <TextInput
                    className={`p-2 mb-2 ${isDark ? "text-text-dark" : "text-text"}`}
                    placeholder="Search by name..."
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
                            <TouchableOpacity
                                onPress={() => router.replace(`/history/${item.symbol}`)}
                            >
                                <View className={`flex-row py-2 border-b-2 border-gray-300 px-4`}>
                                    <Text className={`flex-1 text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>{item.name}</Text>
                                    <Text className={`flex-1 text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>{item.symbol}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                )
                }
            </View>

            <Footer path={`/menu`}/>

        </SafeAreaView>
    );
}

export default history;
