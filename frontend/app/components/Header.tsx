import { useTheme } from "@/app/context/ThemeContext";
import {Animated, Image, Text, TouchableOpacity, View} from "react-native";
import React, {useState} from "react";
import {useRouter} from "expo-router";
import {Ionicons} from "@expo/vector-icons";

interface Props {
    title?: string;
    back?: string;
    alerts?: boolean;
}

const Header = ({ title = "", back = "", alerts = false }: Props) => {
    const { isDark, toggleTheme } = useTheme();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));

    const toggleMenu = () => {
        if (open) {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }).start(() => setOpen(false));
        } else {
            setOpen(true);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }).start();
        }
    };

    return (
        <View
            className={`relative justify-center items-center overflow-visible z-50 ${isDark ? "bg-headers-dark" : "bg-headers"}`}
            style={{ paddingVertical: 20 }}
        >
            {back && (
                <TouchableOpacity
                    onPress={() => router.replace(back)}
                    className="absolute left-5 top-5 p-2"
                >
                    <Image
                        source={require("../../assets/icons/back.png")}
                        className="w-6 h-6"
                        style={{ tintColor: isDark ? "#fff" : "#000" }}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            )}

            <Text className={`text-4xl text-center mr-16 ml-16 ${isDark ? "text-text-dark" : "text-text"}`}>
                {title.toUpperCase()}
            </Text>

            {/* Menu button */}
            <View className="absolute top-5 right-5 z-50">
                <TouchableOpacity onPress={toggleMenu} className="p-2">
                    <Image
                        source={require("../../assets/icons/menu.png")}
                        className="w-6 h-6"
                        style={{ tintColor: isDark ? "#fff" : "#000" }}
                        resizeMode="contain"
                    />
                </TouchableOpacity>

                {open && (
                    <Animated.View
                        style={{ opacity: fadeAnim }}
                        className={`absolute top-10 right-0 z-50 rounded-lg py-2 w-40 shadow-lg shadow-black/40 ${isDark ? "bg-headers-dark" : "bg-headers"}`}
                    >
                        <TouchableOpacity
                            className="flex-row items-center px-3 py-2 active:bg-background-dark"
                            onPress={() => {
                                setOpen(false);
                                router.replace(`/alerts`);
                            }}
                        >
                            <Image
                                source={require("../../assets/icons/alert.png")}
                                className="w-5 h-5"
                                style={{ tintColor: isDark ? "#fff" : "#000" }}
                                resizeMode="contain"
                            />
                            <Text className={`text-xs text-center ml-2 ${isDark ? "text-text-dark" : "text-text"}`}>
                                ALERTS
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-row items-center px-3 py-2 active:bg-background-dark"
                            onPress={() => {
                                setOpen(false);
                                toggleTheme();
                            }}
                        >
                            <Image
                                source={require("../../assets/icons/darkmode.png")}
                                className="w-5 h-5"
                                style={{ tintColor: isDark ? "#fff" : "#000" }}
                                resizeMode="contain"
                            />
                            <Text className={`text-xs text-center ml-2 ${isDark ? "text-text-dark" : "text-text"}`}>
                                SWITCH MODE
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-row items-center px-3 py-2 active:bg-red-500"
                            onPress={() => {
                                setOpen(false);
                                router.replace(`/start`);
                            }}
                        >
                            <Image
                                source={require("../../assets/icons/logout.png")}
                                className="w-5 h-5"
                                style={{ tintColor: isDark ? "#fff" : "#000" }}
                                resizeMode="contain"
                            />
                            <Text className={`text-xs text-center ml-2 ${isDark ? "text-text-dark" : "text-text"}`}>
                                LOG OUT
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </View>
        </View>
    );
};

export default Header;
