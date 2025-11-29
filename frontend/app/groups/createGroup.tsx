import {useTheme} from "@/app/context/ThemeContext";
import React, {useState} from "react";
import Header from "@/app/components/Header";
import {Alert, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {router} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Menu from "@/app/components/Menu";


const createGroup = () => {
    const { isDark, toggleTheme } = useTheme();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [purchaseDays, setPurchaseDays] = useState('7');
    const [summaryDays, setSummaryDays] = useState('14');
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const showDatePicker = () => setDatePickerVisibility(true);
    const hideDatePicker = () => setDatePickerVisibility(false);

    const handleConfirmDate = (date: Date) => {
        setStartTime(date);
        hideDatePicker();
    };

    const handleAddGroup = async (purchaseDaysParsed: number, summaryDaysParsed: number, formattedDate: String) => {
        try {
            const userId = await AsyncStorage.getItem('user_id');
            const response = await fetch(
                `https://wealthy-0mga.onrender.com/api/group_list/new/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name,
                        description: description,
                        purchase_days: purchaseDaysParsed,
                        summary_days: summaryDaysParsed,
                        start_time: formattedDate,
                        user_id: userId,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                Alert.alert("Error", data.error || "Failed to create group");
                return;
            }

            Alert.alert("Success", "Group successfully created!");
            router.replace(`/groups`);

        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Could not connect to server");
        }
    };

    const onConfirm = () => {
        try {
            const purchaseDaysParsed = parseInt(purchaseDays);
            const summaryDaysParsed = parseInt(summaryDays);
        } catch (e) {
            Alert.alert("Invalid input", "Both purchase days and summary days must be integer values.");
            return;
        } finally {
            const purchaseDaysParsed = parseInt(purchaseDays);
            const summaryDaysParsed = parseInt(summaryDays);
            if (name == '') {
                Alert.alert("Missing name", "Please add name.");
                return;
            }
            if (!startTime) {
                Alert.alert("Missing date", "Please select a start time.");
                return;
            }
            const formattedDate = startTime.toISOString().split('T')[0];

            handleAddGroup(purchaseDaysParsed, summaryDaysParsed, formattedDate)
        }
    };

    return (
        <SafeAreaView className={`flex-1 ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
            <Header title={"CREATE GROUP"} back={`/groups`}/>

            <View className={`flex-[5] items-center ${isDark ? "bg-background-dark" : "bg-background"}`}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                    <Text className={`text-2xl text-center mt-12 font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
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

                    <Text className={`text-2xl text-center mt-12 font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
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

                    <Text className={`text-2xl text-center mt-12 font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                        Purchase days:
                    </Text>

                    <TextInput
                        className={`px-8 py-4 min-h-14 min-w-60 text-center text-lg font-bold ${isDark ?
                            "bg-buttons-dark text-text-dark" : "bg-buttons text-text"}`}
                        keyboardType={"number-pad"}
                        placeholder={purchaseDays}
                        placeholderTextColor={"#000000"}
                        value={purchaseDays}
                        onChangeText={setPurchaseDays}
                        autoCapitalize="none"
                    />

                    <Text className={`text-2xl text-center mt-12 font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                        Summary days:
                    </Text>

                    <TextInput
                        className={`px-8 py-4 min-h-14 min-w-60 text-center text-lg font-bold ${isDark ?
                            "bg-buttons-dark text-text-dark" : "bg-buttons text-text"}`}
                        keyboardType={"number-pad"}
                        placeholder={summaryDays}
                        placeholderTextColor={"#000000"}
                        value={summaryDays}
                        onChangeText={setSummaryDays}
                        autoCapitalize="none"
                    />

                    <Text className={`text-2xl text-center mt-12 font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                        Start time:
                    </Text>

                    <TouchableOpacity
                        onPress={showDatePicker}
                        className={`px-8 py-4 rounded-3xl min-h-10 min-w-48 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                    >
                        <Text className={`text-1xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                            {startTime ? startTime.toLocaleDateString() : "Pick start time"}
                        </Text>
                    </TouchableOpacity>

                    <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="date"
                        onConfirm={handleConfirmDate}
                        onCancel={hideDatePicker}
                    />

                    <TouchableOpacity
                        onPress={onConfirm}
                        className={`px-8 py-4 rounded-3xl min-h-10 min-w-32 mt-14 mb-14 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                    >
                        <Text className={`text-1xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                            CREATE
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <Menu />

        </SafeAreaView>
    );
}

export default createGroup;
