import { useTheme } from "@/app/context/ThemeContext";
import {Text, TouchableOpacity, View} from "react-native";
import React from "react";
import {useRouter} from "expo-router";

interface Props {
    title?: string;
    settings?: boolean;
}

const Header = ({ title = "", settings = false}: Props) => {
    const { isDark, toggleTheme } = useTheme();
    const router = useRouter();

    return (
        <View className={`flex-[1] justify-center items-center relative ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
            {settings && (
                <TouchableOpacity
                    onPress={() => router.push('/menu/settings')}
                    className={`absolute top-10 left-5 ${isDark ? "text-headers-text-dark" : "text-headers-text"}`}
                >
                    <Text className={`text-lg font-bold ${isDark ? "text-headers-text-dark" : "text-headers-text"}`}>
                        SET
                    </Text>
                </TouchableOpacity>
            )}

            <Text className={`text-6xl ${isDark ? "text-headers-text-dark" : "text-headers-text"}`}>
                {title.toUpperCase()}
            </Text>
        </View>
    )
}

export default Header;
