import {
    ActivityIndicator,
    FlatList,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useRouter} from 'expo-router';
import {useTheme} from "@/app/context/ThemeContext";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, {useEffect, useState} from 'react';
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Wallet {
    id: string;
    name: string;
}

const wallets = () => {
    const { isDark, toggleTheme } = useTheme();
    const router = useRouter();
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchWallets();
    }, []);

    useEffect(() => {
        console.log('WALLETS STATE UPDATED:', wallets);
    }, [wallets]);


    const fetchWallets = async () => {
        setLoading(true);
        try {
            const userId = await AsyncStorage.getItem('user_id');
            console.log('USER ID:', userId);

            const response = await fetch(`https://wealthy-0mga.onrender.com/api/accounts/profile/wallets/${userId}`);
            const data: Wallet[] = await response.json();

            setWallets(data);
        } catch (err) {
            console.error('Error fetching wallets:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className={`flex-1 ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
            <Header title={"WALLETS"} />

            <View className={`flex-[5] w-full ${isDark ? "bg-background-dark" : "bg-background"}`}>
                {loading ? (
                    <ActivityIndicator size="large" />
                ):(
                    <FlatList
                        data={wallets}
                        keyExtractor={(item) => item.id.toString()}
                        ListEmptyComponent={
                            <Text className={`text-xl text-center ${isDark ? "text-text-dark" : "text-text"}`}>
                                You don't have any wallets!
                            </Text>
                        }
                        renderItem={({item}) => (
                            <TouchableOpacity
                            >
                                <View className={`flex-row py-2 border-b-2 border-gray-300 px-4`}>
                                    <Text className={`flex-1 text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>{item.name}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                )
                }
                <TouchableOpacity
                    onPress={() => router.push(`/wallets/addWallet`)}
                    className={`px-8 py-4 min-h-14 min-w-72 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                >
                    <Text className={`text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>ADD WALLET</Text>
                </TouchableOpacity>
            </View>

            <Footer />

        </SafeAreaView>
    );
}

export default wallets;
