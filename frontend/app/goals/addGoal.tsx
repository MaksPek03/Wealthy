import {useTheme} from "@/app/context/ThemeContext";
import {useRouter} from "expo-router";
import Header from "@/app/components/Header";
import React, {useState} from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import {ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Menu from "@/app/components/Menu";

const addGoal = () => {
    const { isDark, toggleTheme } = useTheme();
    const router = useRouter();
    const [ name, setName ] = useState("");
    const [ description, setDescription ] = useState("");
    const [ targetAmount, setTargetAmount ] = useState("");
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [deadline, setDeadline] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);

    const showDatePicker = () => setDatePickerVisibility(true);
    const hideDatePicker = () => setDatePickerVisibility(false);

    const handleConfirmDate = (date: Date) => {
        setDeadline(date);
        hideDatePicker();
    };

    const handleAddGoal = async (name:string, amountParsed:number, description:string, formattedDate: string) => {
        try {
            const userId = await AsyncStorage.getItem('user_id');
            const response = await fetch(
                `https://wealthy-0mga.onrender.com/api/goals/add/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name,
                        description: description,
                        targetAmount: amountParsed,
                        deadline: formattedDate,
                        userId: userId,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                Alert.alert("Error", data.error || "Failed to add goal");
                return;
            }

            Alert.alert("Success", "Goal added successfully!");
            router.replace(`/goals`);

        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Could not connect to server");
        }
    };

    const onConfirm = () => {
        const amountParsed = parseFloat(targetAmount.replace(',', '.'));

        if (isNaN(amountParsed)) {
            Alert.alert("Invalid input", "Amount must be numeric values.");
            return;
        }

        if (name === "") {
            Alert.alert("Missing name", "Please add name.");
            return;
        }

        if (!deadline) {
            Alert.alert("Missing date", "Please select a deadline date.");
            return;
        }

        const formattedDate = deadline.toISOString().split('T')[0];

        handleAddGoal(name, amountParsed, description, formattedDate)
    };

    return (
        <SafeAreaView className={`flex-1 ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
            <Header title={"ADD GOAL"} back={`/goals`}/>

            <View className={`flex-[5] items-center ${isDark ? "bg-background-dark" : "bg-background"}`}>

                <View className={`w-1/2`}>
                    <Text className={`text-1xl text-center mt-12 font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                        Name:
                    </Text>

                    <TextInput
                        className={`px-8 py-4 min-h-14 min-w-60 text-center text-lg font-bold ${isDark ?
                            "bg-buttons-dark text-text-dark" : "bg-buttons text-text"}`}
                        placeholder={"Name:"}
                        placeholderTextColor={"#000000"}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="none"
                    />

                    <Text className={`text-1xl text-center mt-12 font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                        Description:
                    </Text>

                    <TextInput
                        className={`px-8 py-4 min-h-14 min-w-60 text-center text-lg font-bold ${isDark ?
                            "bg-buttons-dark text-text-dark" : "bg-buttons text-text"}`}
                        placeholder={"Description:"}
                        placeholderTextColor={"#000000"}
                        value={description}
                        onChangeText={setDescription}
                        autoCapitalize="none"
                    />

                    <Text className={`text-1xl text-center mt-12 font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                        Target amount:
                    </Text>

                    <TextInput
                        className={`px-8 py-4 min-h-14 min-w-60 text-center text-lg font-bold ${isDark ?
                            "bg-buttons-dark text-text-dark" : "bg-buttons text-text"}`}
                        keyboardType={"decimal-pad"}
                        placeholder={"Target amount:"}
                        placeholderTextColor={"#000000"}
                        value={targetAmount}
                        onChangeText={setTargetAmount}
                        autoCapitalize="none"
                    />

                    <Text className={`text-1xl text-center mt-12 font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                        Deadline:
                    </Text>

                    <TouchableOpacity
                        onPress={showDatePicker}
                        className={`px-8 py-4 rounded-3xl min-h-10 min-w-48 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                    >
                        <Text className={`text-1xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                            {deadline ? deadline.toLocaleDateString() : "Pick deadline"}
                        </Text>
                    </TouchableOpacity>

                    <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="date"
                        onConfirm={handleConfirmDate}
                        onCancel={hideDatePicker}
                    />

                    <TouchableOpacity
                        disabled={loading}
                        onPress={onConfirm}
                        className={`px-8 py-4 rounded-3xl min-h-10 min-w-32 mt-14 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                    >
                        <Text className={`text-1xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                            CONFIRM
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>

            <Menu />

        </SafeAreaView>
    );
}

export default addGoal;
