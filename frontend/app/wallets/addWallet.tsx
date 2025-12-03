import {
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useRouter} from 'expo-router';
import {useTheme} from "@/app/context/ThemeContext";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, {useState} from 'react';
import Header from "@/app/components/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Menu from "@/app/components/Menu";

const addWallet = () => {
    const { isDark, toggleTheme } = useTheme();
    const router = useRouter()
    const [newWallet, setNewWallet] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAdding = async () => {
        if (!newWallet) {
            Alert.alert("Missing data", "Please enter name of new wallet.");
            return;
        }

        setLoading(true);
        try {
            const userId = await AsyncStorage.getItem('user_id');
            const response = await fetch('https://wealthy-0mga.onrender.com/api/accounts/profile/wallets/add_wallet/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newWallet, userId: userId }),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert("Adding new wallet failed", data.message || "An error occurred.");
                return;
            }

            Alert.alert("New wallet added successfully.");
            router.replace('/wallets');
        } catch (error) {
            Alert.alert("Error", "Could not connect to the server.");
            console.error("Adding wallet:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className={`flex-1 ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
            <Header title={"ADD WALLET"} back={`/wallets`} />

            <View className={`flex-[5] items-center ${isDark ? "bg-background-dark" : "bg-background"}`}>
                <TextInput
                    className={`px-8 py-4 min-h-14 min-w-60 mt-12 text-center text-lg font-bold ${isDark ?
                        "bg-buttons-dark text-text-dark" : "bg-buttons text-text"}`}
                    placeholder={"New wallet name:"}
                    placeholderTextColor={"#000000"}
                    value={newWallet}
                    onChangeText={setNewWallet}
                    autoCapitalize="none"
                />
                <TouchableOpacity
                    onPress={handleAdding}
                    disabled={loading}
                    className={`px-8 py-4 rounded-3xl min-h-10 min-w-32 mt-14 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                >
                    <Text className={`text-1xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                        {loading ? "Logging in..." : "CONFIRM"}
                    </Text>
                </TouchableOpacity>
            </View>

            <Menu  page={"WALLETS"}/>

        </SafeAreaView>
    );
}

export default addWallet;
