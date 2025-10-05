import React, {useEffect, useState} from "react";
import {ActivityIndicator, SafeAreaView, ScrollView, Text, View} from "react-native";
import Header from "@/app/components/Header";
import {useTheme} from "@/app/context/ThemeContext";
import Footer from "@/app/components/Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FilterHistory from "@/app/components/FilterHistory";
import CurrencyChange from "@/app/components/CurrencyChange";

interface TypeTrendItem {
    name: string;
    [key: string]: number | string | null;
}

interface TrendRecord {
    symbol: string;
    change_pct: number;
}

interface TrendsDataItem {
    best: TrendRecord | null;
    worst: TrendRecord | null;
}

interface ApiResponse {
    total_value: number;
    trends_data: Record<string, TrendsDataItem[]>;
    type_trends: Record<string, Record<string, number | null>>;
    timeframes: string[];
}

const trends = () => {
    const { isDark, toggleTheme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ApiResponse>({
        total_value: 0,
        trends_data: {},
        type_trends: {},
        timeframes: []
    });
    const [selectedFilter, setSelectedFilter] = useState<string>("day");
    const [filteredData, setFilteredData] = useState<TrendsDataItem[] | null>(null);
    const [filteredTrends, setFilteredTrends] = useState<TypeTrendItem[] | null>(null);
    const [exchangeRate, setExchangeRate] = useState(1);
    const [currencySymbol, setCurrencySymbol] = useState("$");

    useEffect(() => {
        fetchTrends();
    }, []);

    useEffect(() => {
        if (data.trends_data[selectedFilter] && data.trends_data[selectedFilter].length > 0) {
            setFilteredData(data.trends_data[selectedFilter]);
        }
    }, [data, selectedFilter]);

    useEffect(() => {
        if (data.type_trends) {
            setFilteredTrends(
                Object.entries(data.type_trends).map(([outerKey, innerDict]) => {
                    return{
                        name: outerKey,
                        ...innerDict
                    } as TypeTrendItem
                })
            );
        }
    }, [data]);


    const fetchTrends = async () => {
        setLoading(true);
        try {
            const userId = await AsyncStorage.getItem('user_id');

            const response = await fetch(`https://wealthy-0mga.onrender.com/api_trends/${userId}`)

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Server error: ${text}`);
            }

            const json: ApiResponse = await response.json();
            setData(json)
        } catch (err) {
            console.error('Error fetching response:', err);
        } finally {
            setLoading(false);
        }
    };

    const onSelectedFilter = (selectedFilter: string) => {
        setSelectedFilter(selectedFilter);
        setFilteredData(data.trends_data[selectedFilter])
    }

    const renderHeader = () => (
        <View className={`flex-row ${isDark ? "bg-buttons-dark" : "bg-buttons"} p-2 px-4 border-b border-gray-300`}>
            <Text className={`font-bold text-xl flex-1 ${isDark ? "text-text-dark" : "text-text"}`}>
                Best
            </Text>
            <Text className={`font-bold text-xl flex-1 ${isDark ? "text-text-dark" : "text-text"}`}>
                Change
            </Text>
            <Text className={`font-bold text-xl flex-1 ${isDark ? "text-text-dark" : "text-text"}`}>
                Worst
            </Text>
            <Text className={`font-bold text-xl flex-1 ${isDark ? "text-text-dark" : "text-text"}`}>
                Change
            </Text>
        </View>
    );

    const renderHeaderType = () => (
        <View className={`flex-row ${isDark ? "bg-buttons-dark" : "bg-buttons"} p-2 px-4 border-b border-gray-300`}>
            <Text className={`font-bold text-xl flex-1 ${isDark ? "text-text-dark" : "text-text"}`}>
                Asset type
            </Text>
            <Text className={`font-bold text-xl flex-1 ${isDark ? "text-text-dark" : "text-text"}`}>
                Day
            </Text>
            <Text className={`font-bold text-xl flex-1 ${isDark ? "text-text-dark" : "text-text"}`}>
                Week
            </Text>
            <Text className={`font-bold text-xl flex-1 ${isDark ? "text-text-dark" : "text-text"}`}>
                Month
            </Text>
            <Text className={`font-bold text-xl flex-1 ${isDark ? "text-text-dark" : "text-text"}`}>
                Year
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
            <Header title={"CHECK TRENDS"} />

            <View className={`flex-[5] ${isDark ? "bg-background-dark" : "bg-background"}`}>
                {loading ? (
                    <ActivityIndicator size="large" />
                ):(
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                        <CurrencyChange setExchangeRate={onSelectedExchangeRate} setCurrencySymbol={onSelectedCurrencySymbol} />
                        <Text className={`text-2xl m-4 text-center ${isDark ? "text-text-dark" : "text-text"}`}>
                            Total Portfolio Value: {(data.total_value / exchangeRate).toFixed(2)}{currencySymbol}
                        </Text>

                        <Text className={`text-2xl text-center m-4 ${isDark ? "text-text-dark" : "text-text"}`}>
                            Best/Worst Assets:
                        </Text>

                        <View className={`flex-row justify-around py-5 bg-no-selected`}>
                            <FilterHistory filterDay={"day"} filterText={"Day"} selectedFilter={selectedFilter} setSelectedFilter={onSelectedFilter} />
                            <FilterHistory filterDay={"week"} filterText={"Week"} selectedFilter={selectedFilter} setSelectedFilter={onSelectedFilter} />
                            <FilterHistory filterDay={"month"} filterText={"Month"} selectedFilter={selectedFilter} setSelectedFilter={onSelectedFilter} />
                            <FilterHistory filterDay={"year"} filterText={"Year"} selectedFilter={selectedFilter} setSelectedFilter={onSelectedFilter} />
                        </View>

                        {renderHeader()}
                        {filteredData?.map((item, index) => (
                            <View key={index} className={`flex-row py-2 border-b border-gray-300 px-4`}>
                                <Text className={`flex-1 text-1xl ${isDark ? "text-text-dark" : "text-text"}`}>{item.best?.symbol ?? "-"}</Text>
                                <Text className={`flex-1 text-1xl ${isDark ? "text-text-dark" : "text-text"}`}>{item.best?.change_pct ?? "-"}%</Text>
                                <Text className={`flex-1 text-1xl ${isDark ? "text-text-dark" : "text-text"}`}>{item.worst?.symbol ?? "-"}</Text>
                                <Text className={`flex-1 text-1xl ${isDark ? "text-text-dark" : "text-text"}`}>{item.worst?.change_pct ?? "-"}%</Text>
                            </View>
                        ))}

                        <Text className={`text-2xl text-center m-4 ${isDark ? "text-text-dark" : "text-text"}`}>
                            Average change by asset type:
                        </Text>

                        {renderHeaderType()}
                        {filteredTrends?.map((item, index) => (
                            <View key={index} className={`flex-row py-2 border-b border-gray-300 px-4`}>
                                <Text className={`flex-1 text-1xl ${isDark ? "text-text-dark" : "text-text"}`}>{item.name ?? "-"}</Text>
                                <Text className={`flex-1 text-1xl ${isDark ? "text-text-dark" : "text-text"}`}>{item.day ?? "-"}%</Text>
                                <Text className={`flex-1 text-1xl ${isDark ? "text-text-dark" : "text-text"}`}>{item.week ?? "-"}%</Text>
                                <Text className={`flex-1 text-1xl ${isDark ? "text-text-dark" : "text-text"}`}>{item.month ?? "-"}%</Text>
                                <Text className={`flex-1 text-1xl ${isDark ? "text-text-dark" : "text-text"}`}>{item.year ?? "-"}%</Text>
                            </View>
                        ))}
                    </ScrollView>
                )
                }
            </View>

            <Footer path={`/menu`}/>
        </SafeAreaView>
    );
}

export default trends;
