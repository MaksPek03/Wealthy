import {View, Text, TouchableOpacity, TextInput, Alert} from 'react-native';
import { useRouter} from 'expo-router';
import {useTheme} from "@/app/context/ThemeContext";
import {useState} from "react";
import React from 'react';

const Register = () => {
    const { isDark, toggleTheme } = useTheme();
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!username || !password || !confirmPassword) {
            Alert.alert("Missing data", "Please enter both username and password.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Incorrect data", "Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('https://wealthy-0mga.onrender.com/api/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                Alert.alert("Register failed", data.message || "An error occurred.");
                return;
            }

            router.replace('/welcome_pages/welcome');
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
                <Text className={`text-3xl  ${isDark ? "text-headers-text-dark" : "text-headers-text"}`}>REGISTER</Text>

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

                <TextInput
                    className={`px-8 py-4 min-h-14 min-w-60 mt-8 text-center text-lg font-bold ${isDark ?
                        "bg-buttons-dark text-text-dark" : "bg-buttons text-text"}`}
                    placeholder={"confirm password:"}
                    placeholderTextColor={"#000000"}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={true}
                    autoCapitalize="none"
                />

                <TouchableOpacity
                    onPress={handleRegister}
                    disabled={loading}
                    className={`px-8 py-4 rounded-3xl min-h-10 min-w-32 mt-14 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                >
                    <Text className={`text-1xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                        {loading ? "Registering..." : "CONFIRM"}
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

export default Register;
