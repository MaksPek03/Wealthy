import {View, Text, TouchableOpacity, TextInput, Alert} from 'react-native';
import { useRouter} from 'expo-router';
import {useTheme} from "@/app/context/ThemeContext";
import {useState} from "react";
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = () => {
    const { isDark, toggleTheme } = useTheme();
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert("Missing data", "Please enter both username and password.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('https://wealthy-0mga.onrender.com/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert("Login failed", data.message || "An error occurred.");
                return;
            }

            await AsyncStorage.setItem('user_id', String(data.user_id));

            router.replace('/menu/mainMenu');
        } catch (error) {
            Alert.alert("Error", "Could not connect to the server.");
            console.error("Login error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className={`flex-1 justify-between items-center ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
            <View className="items-center">
                <Text className={`text-6xl mt-40  ${isDark ? "text-headers-text-dark" : "text-headers-text"}`}>WEALTHY</Text>
                <Text className={`text-3xl  ${isDark ? "text-headers-text-dark" : "text-headers-text"}`}>LOGIN</Text>

                <TextInput
                    className={`px-8 py-4 min-h-14 min-w-60 mt-12 text-center text-lg font-bold ${isDark ?
                        "bg-buttons-dark text-text-dark" : "bg-buttons text-text"}`}
                    placeholder={"username:"}
                    placeholderTextColor={"#000000"}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />

                <TextInput
                    className={`px-8 py-4 min-h-14 min-w-60 mt-8 text-center text-lg font-bold ${isDark ?
                        "bg-buttons-dark text-text-dark" : "bg-buttons text-text"}`}
                    placeholder={"password:"}
                    placeholderTextColor={"#000000"}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                    autoCapitalize="none"
                />

                <TouchableOpacity
                    onPress={handleLogin}
                    disabled={loading}
                    className={`px-8 py-4 rounded-3xl min-h-10 min-w-32 mt-14 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                >
                    <Text className={`text-1xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                        {loading ? "Logging in..." : "CONFIRM"}
                    </Text>
                </TouchableOpacity>
            </View>


            <TouchableOpacity
                onPress={() => router.push('/welcome_pages/welcome')}
                className={`px-8 py-4 rounded-3xl min-h-10 min-w-40 mb-16 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
            >
                <Text className={`text-1xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>GO BACK</Text>
            </TouchableOpacity>
        </View>
    );
}

export default Login;
