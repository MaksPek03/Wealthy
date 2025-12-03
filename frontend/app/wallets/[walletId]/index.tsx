import {ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {useTheme} from "@/app/context/ThemeContext";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, {useEffect, useState} from 'react';
import Header from "@/app/components/Header";
import CurrencyChange from "@/app/components/CurrencyChange";
import Menu from "@/app/components/Menu";

interface Wallet {
    id: string;
    name: string;
    user: string;
}

const WalletScreen = () => {
    const { walletId } = useLocalSearchParams();
    const { isDark, toggleTheme } = useTheme();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [wallet, setWallet] = useState<Wallet>({ id: '', name: '', user: '' });
    const [assets, setAssets] = useState([]);
    const [totalPurchase, setTotalPurchase] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    const [totalDifference, setTotalDifference] = useState(0);
    const [differenceInPercentage, setDifferenceInPercentage] = useState(0);
    const [uniqueAssets, setUniqueAssets] = useState<{ name: string, id: string}[]>([]);
    const [exchangeRate, setExchangeRate] = useState(1);
    const [currencySymbol, setCurrencySymbol] = useState("$");

    useEffect(() => {
        if (assets.length > 0) {
            const uniqueMap = new Map();

            assets.forEach((item: any) => {
                uniqueMap.set(item.id, {
                    id: item.id,
                    name: item.asset
                });
            });

            const uniqueList = Array.from(uniqueMap.values());

            setUniqueAssets(uniqueList);
        }
    }, [assets]);

    useEffect(() => {
        fetchDetails();
    }, []);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://wealthy-0mga.onrender.com/api/accounts/profile/wallets/wallet/${walletId}/`);
            const data = await response.json();

            setWallet(data.wallet)
            setAssets(data.assets);

            setTotalPurchase(data.total_purchase);
            setTotalValue(data.total_value);
            setTotalDifference(Number(data.total_difference.toFixed(2)));
            setDifferenceInPercentage(Number(data.difference_in_percentage.toFixed(2)));

        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async () => {
        Alert.alert(
            "Confirmation",
            "Are you sure you want to remove this wallet?",
            [
                {
                    text: "Yes",
                    onPress: async () => {
                        try {
                            const response = await fetch(`https://wealthy-0mga.onrender.com/api/accounts/profile/wallets/remove_wallet/${walletId}/`);
                        } catch (err) {
                            console.error('Error removing wallet:', err);
                        }finally {
                            router.replace('/wallets');
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

            <Header title={`${wallet.name} WALLET`} back={`/wallets`} />

            <View className={`flex-[5] z-0 ${isDark ? "bg-background-dark" : "bg-background"}`}>
                <CurrencyChange setExchangeRate={onSelectedExchangeRate} setCurrencySymbol={onSelectedCurrencySymbol} />
                <View className={`w-max ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}>
                    <Text className={`text-2xl text-center mt-3  ${isDark ? "text-text-dark" : "text-text"}`}>
                        total purchase price: {(totalPurchase / exchangeRate).toFixed(2)}{currencySymbol}
                    </Text>
                    <Text className={`text-2xl text-center mt-3  ${isDark ? "text-text-dark" : "text-text"}`}>
                        total actual price: {(totalValue / exchangeRate).toFixed(2)}{currencySymbol}
                    </Text>
                    <Text className={`text-2xl text-center mt-3  ${isDark ? "text-text-dark" : "text-text"}`}>
                        balance: {(totalDifference / exchangeRate).toFixed(2)}{currencySymbol} in percentage: {differenceInPercentage.toFixed(2)}%
                    </Text>
                </View>

                <View className={`flex-row justify-around py-5`}>
                    <TouchableOpacity className={`w-25 ${isDark ? "bg-buttons-dark" : "bg-buttons"} py-2.5 px-2.5`}
                                      onPress={() => router.replace(`/wallets/${walletId}/addAsset`)}>
                        <Text>
                            add asset
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className={`w-25 ${isDark ? "bg-buttons-dark" : "bg-buttons"} py-2.5 px-2.5`}
                                      onPress={handleRemove}>
                        <Text>
                            remove wallet
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="items-center">
                    {loading ? (
                        <ActivityIndicator size="large" />
                    ) : (
                        <FlatList
                            data={uniqueAssets}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{ alignItems: 'center' }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => router.replace(`/wallets/${walletId}/assets/${item.id}`)}
                                    className={`w-60 py-3 px-2.5 m-3 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                                >
                                    <Text className={`text-center text-3xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>


            </View>

            <Menu  page={"WALLETS"}/>

        </SafeAreaView>
    );
}

export default WalletScreen;
