import {useTheme} from "@/app/context/ThemeContext";
import {useRouter} from "expo-router";
import React from "react";
import {Text, TouchableOpacity, Image, View} from "react-native";


const Menu = () => {
    const { isDark, toggleTheme } = useTheme();
    const router = useRouter();

    const buttons = [
        { id: 1, icon: require("../../assets/icons/group.png"), label: "GROUPS", path: `/groups` },
        { id: 2, icon: require("../../assets/icons/wallet.png"), label: "WALLETS", path: `/wallets` },
        { id: 3, icon: require("../../assets/icons/price.png"), label: "PRICES", path: `/prices` },
        { id: 4, icon: require("../../assets/icons/trend.png"), label: "TRENDS", path: `/trends` },
        { id: 5, icon: require("../../assets/icons/history.png"), label: "HISTORY", path: `/history` },
        { id: 6, icon: require("../../assets/icons/goal.png"), label: "GOALS", path: `/goals` },
        { id: 7, icon: require("../../assets/icons/friends.png"), label: "FRIENDS", path: `/friends` }
    ];

    return (
        <View className={`flex-[0.1] justify-center flex-wrap flex-row gap-6 mt-4 mb-4  ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
            {buttons.map((btn) => (
                <TouchableOpacity
                    key={btn.id}
                    onPress={() => router.replace(btn.path)}
                    className={`items-center`}
                >
                    <Image source={btn.icon} className={`w-5 h-5`}
                           style={{ tintColor: isDark ? '#ffffff' : '#000000' }} resizeMode="contain" />
                    <Text className={`text-xs text-center ${isDark ? "text-text-dark" : "text-text"}`}>{btn.label}</Text>
                </TouchableOpacity>
            ))}
        </View>

    )
}

export default Menu;
