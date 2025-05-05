import {View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useRouter} from 'expo-router';
import {useTheme} from "@/app/context/ThemeContext";
import {useState} from "react";

export default function Register() {
    const { isDark, toggleTheme } = useTheme();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <View className={`flex-1 justify-between items-center ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
            <View className="items-center">
                <Text className={`text-6xl mt-40  ${isDark ? "text-headers-text-dark" : "text-headers-text"}`}>WEALTHY</Text>
                <Text className={`text-3xl  ${isDark ? "text-headers-text-dark" : "text-headers-text"}`}>LOGIN</Text>

                <TextInput
                    className={`px-8 py-4 min-h-14 min-w-60 mt-12 text-center text-lg font-bold ${isDark ?
                        "bg-buttons-dark text-text-dark" : "bg-buttons text-text"}`}
                    placeholder={"email:"}
                    placeholderTextColor={"#000000"}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />

                <TextInput
                    className={`px-8 py-4 min-h-14 min-w-60 mt-8 text-center text-lg font-bold ${isDark ?
                        "bg-buttons-dark text-text-dark" : "bg-buttons text-text"}`}
                    placeholder={"password:"}
                    placeholderTextColor={"#000000"}
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                />

                <TouchableOpacity
                    onPress={() => router.push('/menu/mainmenu')}
                    className={`px-8 py-4 rounded-3xl min-h-10 min-w-32 mt-14 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                >
                    <Text className={`text-1xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>CONFIRM</Text>
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
