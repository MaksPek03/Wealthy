import Header from "@/app/components/Header";
import {ActivityIndicator, Alert, FlatList, SafeAreaView, Text, TouchableOpacity, View} from "react-native";
import React, {useEffect, useState} from "react";
import {useTheme} from "@/app/context/ThemeContext";
import Menu from "@/app/components/Menu";

interface Request {
    id: number;
    sender_id: number;
    sender_username: string;
}

const requests = () => {
    const { isDark, toggleTheme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState<Request[]>([]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://wealthy-0mga.onrender.com/api/friend_requests/`);
            const data = await response.json();
            console.log(data);

            setRequests(data);
        } catch (err) {
            console.error('Error fetching requests:',err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (requestId: number) => {
        Alert.alert(
            "Confirmation",
            "Are you sure you want to accept friend request from this user?",
            [
                {
                    text: "Yes",
                    onPress: async () => {
                        try {
                            const response = await fetch(`https://wealthy-0mga.onrender.com/api/friends/accept-request/${requestId}/`);
                        } catch (err) {
                            console.error('Error accepting friend request:', err);
                        }
                        finally {
                            fetchRequests();
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

    const handleDecline = async (requestId: number) => {
        Alert.alert(
            "Confirmation",
            "Are you sure you want to decline friend request from this user?",
            [
                {
                    text: "Yes",
                    onPress: async () => {
                        try {
                            const response = await fetch(`https://wealthy-0mga.onrender.com/api/friends/decline-request/${requestId}/`);
                        } catch (err) {
                            console.error('Error declining friend request:', err);
                        }
                        finally {
                            fetchRequests();
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

            <Header title={"FRIEND REQUESTS"} back={`/friends`}/>

            <View className={`flex-[5] ${isDark ? "bg-background-dark" : "bg-background"}`}>
                {loading ? (
                    <ActivityIndicator size="large" />
                ):(
                    <FlatList
                        data={requests}
                        keyExtractor={(item) => item.id.toString()}
                        ListEmptyComponent={
                            <Text className={`text-xl text-center ${isDark ? "text-text-dark" : "text-text"}`}>
                                You don't have any requests!
                            </Text>
                        }
                        renderItem={({item}) => (
                            <View className={`flex-row py-2 border-b-2 border-gray-300 px-4`}>
                                <Text className={`flex-1 text-2xl m-1 ${isDark ? "text-text-dark" : "text-text"}`}>{item.sender_username}</Text>
                                <TouchableOpacity className={`w-25 ${isDark ? "bg-buttons-dark" : "bg-buttons"} py-2.5 px-2.5 m-1`}
                                                  onPress={() => handleAccept(item.id)}>
                                    <Text>Accept</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className={`w-25 ${isDark ? "bg-buttons-dark" : "bg-buttons"} py-2.5 px-2.5 m-1`}
                                                  onPress={() => handleDecline(item.id)}>
                                    <Text>Decline</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                )
                }

            </View>

            <Menu />

        </SafeAreaView>
    )
}

export default requests;
