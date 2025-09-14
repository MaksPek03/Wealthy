import React, {useEffect, useState} from "react";
import {ActivityIndicator, Alert, FlatList, SafeAreaView, Text, TextInput, TouchableOpacity, View} from "react-native";
import {useTheme} from "@/app/context/ThemeContext";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {router} from "expo-router";

interface User {
    id: number;
    username: string;
}

const addFriend = () => {
    const { isDark, toggleTheme } = useTheme();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://wealthy-0mga.onrender.com/api/users/`);
            const data = await response.json();
            console.log(data);

            setUsers(data);
        } catch (err) {
            console.error('Error fetching users:',err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text: string) => {
        setSearch(text);
        const filtered = users.filter(item =>
            item.username.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredUsers(filtered);
    };

    const handleAdd = async (userId: number) => {
        Alert.alert(
            "Confirmation",
            "Are you sure you want to send friend request to this user?",
            [
                {
                    text: "Yes",
                    onPress: async () => {
                        try {
                            const response = await fetch(`https://wealthy-0mga.onrender.com/api/friends/send-request/${userId}/`);
                        } catch (err) {
                            console.error('Error sending request friend:', err);
                        }
                    }
                },
                {
                    text: "No",
                    style: "cancel",
                }
            ]
        )
    };

    return (
        <SafeAreaView className={`flex-1 ${isDark ? "bg-headers-dark" : "bg-headers"}`}>

            <Header title={"ADD FRIEND"}/>

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
                        data={filteredUsers.length > 0 || search ? filteredUsers : users}
                        keyExtractor={(item) => item.id.toString()}
                        ListEmptyComponent={
                            <Text className={`text-xl text-center ${isDark ? "text-text-dark" : "text-text"}`}>
                                No users found.
                            </Text>
                        }
                        renderItem={({item}) => (
                            <TouchableOpacity
                                onPress={() => handleAdd(item.id)}
                            >
                                <View className={`flex-row py-2 border-b-2 border-gray-300 px-4`}>
                                    <Text className={`flex-1 text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>{item.username}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                )
                }

            </View>

            <Footer />

        </SafeAreaView>
    )
};

export default addFriend;
