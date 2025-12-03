
import {useTheme} from "@/app/context/ThemeContext";
import {router, useRouter} from "expo-router";
import React, {useEffect, useState} from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import Header from "@/app/components/Header";
import {ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View} from "react-native";
import CurrencyChange from "@/app/components/CurrencyChange";
import Menu from "@/app/components/Menu";

interface Goal {
    goal_id: string;
    name: string;
    targetAmount: number;
    totalValue: number;
    deadline: string;
    percent: number;
}

const goals = () => {
    const { isDark, toggleTheme } = useTheme();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [exchangeRate, setExchangeRate] = useState(1);
    const [currencySymbol, setCurrencySymbol] = useState("$");


    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        setLoading(true);
        try {
            const  response = await fetch(`https://wealthy-0mga.onrender.com/api/goals/`)
            const data = await response.json();

            console.log(data);

            setGoals(data['goalsList']);
        } catch (err) {
            console.error('Error fetching goals', err);
        } finally {
            setLoading(false);
        }

    }

    const handleRemoveGoal = async (goal_id: string) => {
        Alert.alert(
            "Confirmation",
            "Are you sure you want to remove this goal?",
            [
                {
                    text: "Yes",
                    onPress: async () => {
                        try {
                            const response = await fetch(`https://wealthy-0mga.onrender.com/api/goals/delete/${goal_id}/`)
                        } catch (err) {
                            console.error('Error removing goal:', err);
                        } finally {
                            router.replace(`/goals`);
                        }
                    }
                },
                {
                    text: "No",
                    style: "cancel",
                }
            ]
        )
    }

    const onSelectedExchangeRate = (selectedExchangeRate: number) => {
        setExchangeRate(selectedExchangeRate);
    }

    const onSelectedCurrencySymbol = (selectedCurrencySymbol: string) => {
        setCurrencySymbol(selectedCurrencySymbol);
    }

    return (
        <SafeAreaView className={`flex-1 ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
            <Header title={"GOALS"} />

            <View className={`flex-[5] w-full z-0 ${isDark ? "bg-background-dark" : "bg-background"}`}>
                <CurrencyChange setExchangeRate={onSelectedExchangeRate} setCurrencySymbol={onSelectedCurrencySymbol} />

                {loading ? (
                    <ActivityIndicator size="large" />
                ):(
                    <FlatList
                        data={goals}
                        keyExtractor={(item) => item.goal_id.toString()}
                        ListEmptyComponent={
                            <Text className={`text-xl text-center ${isDark ? "text-text-dark" : "text-text"}`}>
                                You don't have any goals!
                            </Text>
                        }
                        renderItem={({item}) => (
                            <View className={`flex-row py-2 border-b-2 border-gray-300 px-4`}>
                                <Text className={`flex-1 text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                    {item.name}{"\n"}
                                    Current value: {(item.totalValue / exchangeRate).toFixed(2)}{currencySymbol}{"\n"}
                                    Target value: {(item.targetAmount / exchangeRate).toFixed(2)}{currencySymbol}{"\n"}
                                    Percentage: {item.percent}%{"\n"}
                                    deadline: {item.deadline}
                                </Text>
                                <TouchableOpacity
                                    className={`py-3 px-2.5 m-3 max-h-10 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                                    onPress={() =>handleRemoveGoal(item.goal_id)}
                                >
                                    <Text>
                                        DEL
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                )
                }
                <TouchableOpacity
                    onPress={() => router.replace(`/goals/addGoal`)}
                    className={`px-8 py-4 min-h-14 min-w-72 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                >
                    <Text className={`text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>ADD GOAL</Text>
                </TouchableOpacity>
            </View>

            <Menu  page={"GOALS"}/>

        </SafeAreaView>
    );
}

export default goals;
