import { useTheme } from "@/app/context/ThemeContext";
import {Text, TouchableOpacity, View} from "react-native";
import React from "react";
import {useRouter} from "expo-router";

interface Props {
    backButton?: boolean;
}

const Footer = ({ backButton = true}: Props) => {
    const { isDark, toggleTheme } = useTheme();
    const router = useRouter();

    return (
        <View className={`flex-[1] justify-center items-center ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
            {backButton && (
                <TouchableOpacity
                    onPress={() => router.back()}
                    className={`px-8 py-4 rounded-3xl min-h-10 min-w-40 mb-8 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                >
                    <Text className={`text-1xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>GO BACK</Text>
                </TouchableOpacity>
            )}
        </View>
    )
}

export default Footer;
