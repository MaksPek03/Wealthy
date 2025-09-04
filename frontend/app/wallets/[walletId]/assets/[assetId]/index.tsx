import {View, Text, ActivityIndicator, FlatList, TouchableOpacity, Alert} from 'react-native';
import {router, useLocalSearchParams} from 'expo-router';
import { useTheme } from "@/app/context/ThemeContext";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, {useEffect, useState} from 'react';
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

interface Wallet {
    id: string;
    name: string;
}

interface Asset {
    id: string;
    name: string;
    symbol: string;
}

interface Transaction {
    id: string;
    quantity: number;
    purchasePrice: number;
    purchaseDate: string;
}

const assetScreen = () => {
    const { walletId, assetId } = useLocalSearchParams();
    const { isDark, toggleTheme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [wallet, setWallet] = useState<Wallet>({ id: '', name: ''});
    const [asset, setAsset] = useState<Asset>({ id: '', name: '', symbol: '' });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [assetTotalPurchasePrice, setAssetTotalPurchasePrice] = useState(0);
    const [totalValueTransactions, setTotalValueTransactions] = useState(0);
    const [totalDifference, setTotalDifference] = useState(0);
    const [totalDifferencePercentage, setTotalDifferencePercentage] = useState(0);
    const [currentPrice, setCurrentPrice] = useState(0);

    useEffect(() => {
        fetchDetails();
    }, []);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://wealthy-0mga.onrender.com/api/accounts/profile/wallets/${walletId}/${assetId}/`)
            const data = await response.json();

            setWallet(data.wallet);
            setAsset(data.asset);

            const mappedTransactions: Transaction[] = data.transactions.map((t: any) => ({
                id: t.id,
                quantity: t.quantity,
                purchasePrice: t.purchase_price,
                purchaseDate: t.purchase_date,
            }));

            setTransactions(mappedTransactions);
            setAssetTotalPurchasePrice(data.asset_total_purchase_value);
            setTotalValueTransactions(data.total_value_transactions);
            setTotalDifference(data.total_difference);
            setTotalDifferencePercentage(data.total_difference_percentage);
            setCurrentPrice(data.current_price)
        } catch (err) {
            console.error('Error fetching assets: ', err)
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveTransaction = async (id: string) => {
        Alert.alert(
            "Confirmation",
            "Are you sure you want to remove this transaction?",
            [
                {
                    text: "Yes",
                    onPress: async () => {
                        try {
                            const response = await fetch(`https://wealthy-0mga.onrender.com/api/wallet/${walletId}/asset/${assetId}/transaction/${id}/delete/`)
                        } catch (err) {
                            console.error('Error removing transaction:', err);
                        } finally {
                            if (transactions.length === 1) {
                                router.replace(`/wallets/${walletId}`);
                            }
                            fetchDetails();
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

    const handleRemoveAsset = async () => {
        Alert.alert(
            "Confirmation",
            "Are you sure you want to remove this asset?",
            [
                {
                    text: "Yes",
                    onPress: async () => {
                        try {
                            const response = await fetch(`https://wealthy-0mga.onrender.com/api/wallet/${walletId}/asset/${assetId}/remove/`)
                        } catch (err) {
                            console.error('Error removing asset:', err);
                        } finally {
                            router.replace(`/wallets/${walletId}`);
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

    return (
        <SafeAreaView className={`flex-1 ${isDark ? "bg-headers-dark" : "bg-headers"}`}>

            <Header title={`${asset.name} WALLET`} />

            <View className={`flex-[5] ${isDark ? "bg-background-dark" : "bg-background"}`}>
                <View className={`w-max ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}>
                    <Text className={`text-2xl text-center mt-3  ${isDark ? "text-text-dark" : "text-text"}`}>total purchase price: {assetTotalPurchasePrice}</Text>
                    <Text className={`text-2xl text-center mt-3  ${isDark ? "text-text-dark" : "text-text"}`}>total actual value assets: {totalValueTransactions}</Text>
                    <Text className={`text-2xl text-center mt-3  ${isDark ? "text-text-dark" : "text-text"}`}>balance: {totalDifference}$ in percentage: {totalDifferencePercentage}%</Text>
                    <Text className={`text-2xl text-center mt-3  ${isDark ? "text-text-dark" : "text-text"}`}>current price: {currentPrice}</Text>
                </View>


                {loading ? (
                    <ActivityIndicator size="large" />
                ):(
                    <FlatList
                        data={transactions}
                        keyExtractor={(item) => item.id.toString()}
                        ListEmptyComponent={
                            <Text className={`text-xl text-center ${isDark ? "text-text-dark" : "text-text"}`}>
                                You don't have any transactions yet!
                            </Text>
                        }
                        renderItem={({item}) => (
                            <View className={`flex-row py-2 border-b-2 border-gray-300 px-4`}>
                                <Text className={`flex-1 text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                    Quantity: {item.quantity} bought for: {item.quantity}$ on: {item.purchaseDate}
                                </Text>
                                <TouchableOpacity
                                    className={`py-3 px-2.5 m-3 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                                    onPress={() =>handleRemoveTransaction(item.id)}
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

                <TouchableOpacity className={`px-10 py-4 min-h-14 min-w-36 mt-14 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                                  onPress={handleRemoveAsset}>
                    <Text className={`text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                        remove asset
                    </Text>
                </TouchableOpacity>
            </View>

            <Footer />

        </SafeAreaView>
    )



}

export default assetScreen;
