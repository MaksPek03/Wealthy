import {useTheme} from "@/app/context/ThemeContext";
import React, {useEffect, useState} from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import Header from "@/app/components/Header";
import {ActivityIndicator, FlatList, Text, TouchableOpacity, View} from "react-native";
import Footer from "@/app/components/Footer";
import {router} from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";


interface Group {
    groupId: string;
    name: string;
    active: string;
    purchaseStatus: string;
    summaryStatus: string;
    memberCount: number;
}

const groups = () => {
    const { isDark, toggleTheme } = useTheme();
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const userId = await AsyncStorage.getItem('user_id');

            const response = await fetch(`https://wealthy-0mga.onrender.com/api/group_list/`);
            const data = await response.json();

            setGroups(data['groups']);
        } catch (err) {
            console.error('Error fetching groups:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className={`flex-1 ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
            <Header title={"GROUPS"} />

            <View className={`flex-[5] w-full ${isDark ? "bg-background-dark" : "bg-background"}`}>
                {loading ? (
                    <ActivityIndicator size="large" />
                ):(
                    <FlatList
                        data={groups}
                        keyExtractor={(item) => item.groupId}
                        ListEmptyComponent={
                            <Text className={`text-xl text-center ${isDark ? "text-text-dark" : "text-text"}`}>
                                There are no groups!
                            </Text>
                        }
                        renderItem={({item}) => (
                            <View className={`border-gray-300 border-b-2 `}>
                                <TouchableOpacity
                                    onPress={() => router.replace(`/groups/${item.groupId}`)}
                                >
                                    <View className={`flex-row py-2 px-4`}>
                                        <Text className={`flex-1 text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                                            {item.name}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                                <Text className={`flex-1 text-2xl text-center ${isDark ? "text-text-dark" : "text-text"}`}>
                                    Status: {item.active? 'Active' : 'Closed'} {item.purchaseStatus}
                                </Text>
                                <Text className={`flex-1 text-2xl text-center ${isDark ? "text-text-dark" : "text-text"}`}>
                                    {item.summaryStatus} {item.memberCount} members
                                </Text>
                            </View>
                        )}
                    />
                )
                }
                <TouchableOpacity
                    onPress={() => router.replace(`/groups/createGroup`)}
                    className={`px-8 py-4 min-h-14 min-w-72 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                >
                    <Text className={`text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                        CREATE GROUP
                    </Text>
                </TouchableOpacity>
            </View>

            <Footer path={`/menu`}/>

        </SafeAreaView>
    );
}

export default groups;
