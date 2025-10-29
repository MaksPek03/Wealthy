import {useTheme} from "@/app/context/ThemeContext";
import React, {useEffect, useState} from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import Header from "@/app/components/Header";
import {ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View} from "react-native";
import {router} from "expo-router";
import Menu from "@/app/components/Menu";

interface User {
    id: number;
    username: string;
}

const friends = () => {
    const { isDark, toggleTheme } = useTheme();
    const [friends, setFriends ] = useState<User[]>([]);
    const [filteredFriends, setFilteredFriends] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchFriends();
    }, []);

    const fetchFriends = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://wealthy-0mga.onrender.com/api/friends/`);
            const data = await response.json();
            console.log(data);

            setFriends(data);
        } catch (err) {
            console.error('Error fetching friends:',err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text: string) => {
        setSearch(text);
        const filtered = friends.filter(item =>
            item.username.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredFriends(filtered);
    };

    const handleRemove = async (friendId: number) => {
        Alert.alert(
            "Confirmation",
            "Are you sure you want to remove this friend?",
            [
                {
                    text: "Yes",
                    onPress: async () => {
                        try {
                            const response = await fetch(`https://wealthy-0mga.onrender.com/api/friends/remove-friend/${friendId}/`);
                        } catch (err) {
                            console.error('Error removing friend:', err);
                        } finally {
                            fetchFriends();
                        }
                    }
                },
                {
                    text: "No",
                    style: "cancel",
                }
            ]
        );
    };

    return (
        <SafeAreaView className={`flex-1 ${isDark ? "bg-headers-dark" : "bg-headers"}`}>

            <Header title={"FRIENDS"}/>

            <View className={`flex-[5] ${isDark ? "bg-background-dark" : "bg-background"}`}>
                <TextInput
                    className={`p-2 mb-2 ${isDark ? "text-text-dark" : "text-text"}`}
                    placeholder="Search by name..."
                    value={search}
                    onChangeText={handleSearch}
                />

                {loading ? (
                    <ActivityIndicator size="large" />
                ):(
                    <FlatList
                        data={filteredFriends.length > 0 || search ? filteredFriends : friends}
                        keyExtractor={(item) => item.id.toString()}
                        ListEmptyComponent={
                            <Text className={`text-xl text-center ${isDark ? "text-text-dark" : "text-text"}`}>
                                You don't have any friends!
                            </Text>
                        }
                        renderItem={({item}) => (
                            <View className={`flex-row py-2 border-b-2 border-gray-300 px-4`}>
                                <Text className={`flex-1 text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>{item.username}</Text>
                                <TouchableOpacity className={`w-25 ${isDark ? "bg-buttons-dark" : "bg-buttons"} py-2.5 px-2.5`}
                                                  onPress={() => handleRemove(item.id)}>
                                        <Text>Remove Friend</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                )
                }

                <TouchableOpacity
                    onPress={() => router.replace(`/friends/requests`)}
                    className={`px-8 py-4 min-h-14 min-w-72 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                >
                    <Text className={`text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>YOUR FRIEND REQUESTS</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.replace(`/friends/addFriend`)}
                    className={`px-8 py-4 min-h-14 min-w-72 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                >
                    <Text className={`text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>ADD NEW FRIEND</Text>
                </TouchableOpacity>

            </View>

            <Menu />

        </SafeAreaView>
    );
}

export default friends;
