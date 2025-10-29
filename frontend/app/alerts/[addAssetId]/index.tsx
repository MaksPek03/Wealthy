import {router, useLocalSearchParams} from "expo-router";
import {useTheme} from "@/app/context/ThemeContext";
import Header from "@/app/components/Header";
import React, {useState} from "react";
import {Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Menu from "@/app/components/Menu";


const addAsset = () => {
    const { addAssetId } = useLocalSearchParams();
    const { isDark, toggleTheme } = useTheme();
    const [ targetPrice, setTargetPrice ] = useState('')
    const [isAbove, setIsAbove] = useState<boolean | null>(null);

    const handleAddAlert = async (priceParsed: number) => {
        try {
            const userId = await AsyncStorage.getItem('user_id');
            const response = await fetch(
                `https://wealthy-0mga.onrender.com/api/assets/${addAssetId}/add-alert/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        targetPrice: priceParsed,
                        above: isAbove,
                        userId: userId,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.log(data)
                Alert.alert("Error", data.error || "Failed to add alert");
                return;
            }

            Alert.alert("Success", "Alert added successfully.");
            router.replace(`/alerts`);

        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Could not connect to server");
        }
    };

    const onConfirm = () => {
        const priceParsed = parseFloat(targetPrice.replace(',', '.'));

        if (isNaN(priceParsed)) {
            Alert.alert("Invalid input", "Target price must be a numeric value.");
            return;
        }

        if (isAbove === null) {
            Alert.alert("Missing status", "Please select a status.");
            return;
        }

        handleAddAlert(priceParsed)
    };

    return (
        <SafeAreaView className={`flex-1 ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
            <Header title={"ADD ALERT"} back={`/alerts`} />
            <View className={`flex-[5] items-center ${isDark ? "bg-background-dark" : "bg-background"}`}>
                <Text className={`text-1xl text-center mt-12 font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                    Target price:
                </Text>

                <TextInput
                    className={`px-8 py-4 min-h-14 min-w-60 text-center text-lg font-bold ${isDark ?
                        "bg-buttons-dark text-text-dark" : "bg-buttons text-text"}`}
                    placeholder={"Target price:"}
                    placeholderTextColor={"#000000"}
                    value={targetPrice}
                    onChangeText={setTargetPrice}
                    autoCapitalize="none"
                />

                <View className="flex-row justify-center mt-5">
                    <TouchableOpacity
                        className="flex-row items-center mr-6"
                        onPress={() => setIsAbove(true)}
                    >
                        <View
                            className={`h-5 w-5 rounded-full border-2 items-center justify-center mr-2 ${
                                isAbove === true ? "border-blue-500" : "border-gray-400"
                            }`}
                        >
                            {isAbove === true && <View className="h-2.5 w-2.5 rounded-full bg-blue-500" />}
                        </View>
                        <Text className="text-lg text-text">Above</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center"
                        onPress={() => setIsAbove(false)}
                    >
                        <View
                            className={`h-5 w-5 rounded-full border-2 items-center justify-center mr-2 ${
                                isAbove === false ? "border-blue-500" : "border-gray-400"
                            }`}
                        >
                            {isAbove === false && <View className="h-2.5 w-2.5 rounded-full bg-blue-500" />}
                        </View>
                        <Text className="text-lg text-text">Below</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={onConfirm}
                    className={`px-8 py-4 rounded-3xl min-h-10 min-w-32 mt-14 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                >
                    <Text className={`text-1xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                        CONFIRM
                    </Text>
                </TouchableOpacity>


            </View>

            <Menu />

        </SafeAreaView>
    );
}

export default addAsset;
