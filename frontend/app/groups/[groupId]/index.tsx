import {useLocalSearchParams} from "expo-router";
import {useTheme} from "@/app/context/ThemeContext";
import {useEffect, useState} from "react";
import React from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {ActivityIndicator, Alert, FlatList, SafeAreaView, Text, TextInput, TouchableOpacity, View} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";


interface Group {
    id: string;
    name: string;
    description: string;
    created_by_user_id: string;
    created_at: Date;
    start_time: Date;
    purchase_days: number;
    summary_days: number;
    purchase_end_time: Date;
    summary_time: Date;
}

interface Membership {
    id: string;
    user_id: string;
    user_username: string;
    group_id: string;
    balance: number;
    joined_at: Date;
    total_invested: number;
    portfolio_valie: number;
}

interface Asset {
    id: string;
    name: string;
    type: string;
    symbol: string;
    current_price: number;
}

interface UserPurchases {
    id: string;
    symbol: string;
    quantity: number;
    buy_price: number;
    current_price: number;
    value_now: number;
    difference: number;
    created_at: Date;
}

interface JoinRequest {
    id: string;
    user_id: string;
    user_username: string;
    group_id: string;
    created_at: Date;
    is_approved: boolean;
}

const groupDetails = () => {
    const {groupId} = useLocalSearchParams();
    const { isDark, toggleTheme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [group, setGroup] = useState<Group | null>(null);
    const [members, setMembers] = useState<Membership[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [membership, setMembership] = useState<Membership | null>(null);
    const [timeRemaining, setTimeRemaining] = useState('');
    const [canPurchase, setCanPurchase] = useState(false);
    const [summaryStatus, setSummaryStatus] = useState('');
    const [userTotalValue, setUserTotalValue] = useState(0);
    const [groupTotalValue, setGroupTotalValue] = useState(0);
    const [userPurchases, setUserPurchases] = useState<UserPurchases[]>([]);
    const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [distribution, setDistribution] = useState<string>('');

    useEffect(() => {
        fetchGroupDetails();
    }, [])

    const fetchGroupDetails = async () => {
        const userId = await AsyncStorage.getItem('user_id');
        setUserId(userId)
        setLoading(true);
        try {
            const response = await fetch(`https://wealthy-0mga.onrender.com/api/group_list/${groupId}/`)
            const data = await response.json();

            setGroup(data.group);
            setMembers(data.members);
            setAssets(data.assets);
            setMembership(data.membership);
            setTimeRemaining(data.time_remaining);
            setCanPurchase(data.can_purchase);
            setSummaryStatus(data.summary_status);
            setUserTotalValue(data.user_total_value);
            setGroupTotalValue(data.group_total_value);
            setUserPurchases(data.user_purchases);
            setJoinRequests(data.join_request);

        } catch (err) {
            console.error('Error fetching group details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoining = async () => {
        console.log('Joining...');
    }

    const renderHeader = () => (
        <View className={`flex-row ${isDark ? "bg-buttons-dark" : "bg-buttons"} p-2 px-4 border-b border-gray-300`}>
            <Text className={`font-bold text-xl flex-1 ${isDark ? "text-text-dark" : "text-text"}`}>
                Username
            </Text>
            <Text className={`font-bold text-xl flex-1 ${isDark ? "text-text-dark" : "text-text"}`}>
                Balance
            </Text>
            <Text className={`font-bold text-xl flex-1 ${isDark ? "text-text-dark" : "text-text"}`}>
                Total invested
            </Text>
        </View>
    );

    const onDistributionSet = () => {
        try {
            const distributionParsed = parseFloat(distribution);
        } catch (e) {
            Alert.alert("Invalid input", "Distribution has to be numeric value.");
            return;
        } finally {
            console.log('Setting distribution...');
        }
    }

    const handleBuyingAssets = async () => {
        console.log('Buying ...');
    }

    return (
        <SafeAreaView className={`flex-1 ${isDark ? "bg-headers-dark" : "bg-headers"}`}>

            <Header title={`${group ? group.name : ''} GROUP`} />

            <View className={`flex-[5] ${isDark ? "bg-background-dark" : "bg-background"}`}>
                {loading ? (
                    <ActivityIndicator size="large" />
                ) : (
                    <View>
                        <Text className={`text-2xl text-center mt-3  ${isDark ? "text-text-dark" : "text-text"}`}>
                            Purchase period: {timeRemaining}
                        </Text>
                        <Text className={`text-2xl text-center mt-3  ${isDark ? "text-text-dark" : "text-text"}`}>
                            Summary status: {summaryStatus}
                        </Text>
                        {(userId != group?.created_by_user_id) &&
                            !(membership) && (
                                <TouchableOpacity
                                    onPress={handleJoining}
                                    className={`px-8 py-4 rounded-3xl min-h-10 min-w-32 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                                >
                                    <Text className={`text-1xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                                        Request to join
                                    </Text>
                                </TouchableOpacity>
                        )}
                        {(userId == group?.created_by_user_id) && (
                            <View>
                            <Text className={`text-3xl text-center mt-3  ${isDark ? "text-text-dark" : "text-text"}`}>
                                Pending requests:
                            </Text>
                                {joinRequests && joinRequests.length > 0 ? (
                                <FlatList
                                    data={joinRequests?.filter(item => item.is_approved)}
                                    keyExtractor={(item) => item.id}
                                    contentContainerStyle={{ alignItems: 'center' }}
                                    renderItem={({ item }) => (
                                            <View>
                                                <Text className={`text-center text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                                    {item.user_username}
                                                </Text>
                                                <View className={`flex-row justify-around`}>
                                                    <TouchableOpacity
                                                        // onPress={() => router.replace(`/wallets/${walletId}/assets/${item.id}`)}
                                                        className={`w-60 py-3 px-2.5 m-3 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                                                    >
                                                        <Text className={`text-center text-3xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                                            Accept
                                                        </Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        // onPress={() => router.replace(`/wallets/${walletId}/assets/${item.id}`)}
                                                        className={`w-60 py-3 px-2.5 m-3 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                                                    >
                                                        <Text className={`text-center text-3xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                                            Reject
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )
                                    }
                                />
                            ) : (
                                <Text className={`text-center text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                    No pending requests
                                </Text>
                                )}
                            </View>
                        )}
                        <Text className={`text-3xl text-center mt-3  ${isDark ? "text-text-dark" : "text-text"}`}>
                            Leaderboard
                        </Text>
                        {members && members.length > 0 ? (
                        <FlatList
                            data={members}
                            keyExtractor={(item) => item.id}
                            ListHeaderComponent={renderHeader}
                            renderItem={({ item }) =>(
                                <View className={`flex-row py-2 border-b border-gray-300 px-4`}>
                                    <Text className={`flex-1 text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                        {item.user_username}
                                    </Text>
                                    <Text className={`flex-1 text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                        {item.balance}
                                    </Text>
                                    <Text className={`flex-1 text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                        {item.total_invested}
                                    </Text>
                                </View>
                                )
                            }
                        />
                        ) : (
                        <Text className={`text-center text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>
                            No members
                        </Text>
                        )}
                        <Text className={`text-center text-3xl ${isDark ? "text-text-dark" : "text-text"}`}>
                            Your total investment: {userTotalValue}
                        </Text>
                        <Text className={`text-center text-3xl ${isDark ? "text-text-dark" : "text-text"}`}>
                            Group total investment: {groupTotalValue}
                        </Text>
                        { userId == group?.created_by_user_id ? (
                            <View className={"items-center mt-3"}>
                                <Text className={`text-center text-3xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                    Distribute balance:
                                </Text>
                                <TextInput
                                    className={`px-8 py-4 min-h-14 text-center text-lg font-bold ${isDark ?
                                        "bg-buttons-dark text-text-dark" : "bg-buttons text-text"}`}
                                    placeholder={"Distribution value:"}
                                    placeholderTextColor={"#000000"}
                                    value={distribution}
                                    onChangeText={setDistribution}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    onPress={onDistributionSet}
                                    className={`px-8 py-4 rounded-3xl min-h-10 min-w-32 mt-4 mb-4 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                                >
                                    <Text className={`text-1xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                                        Set distribution
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : null}
                        <Text className={`text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                            Buy assets
                        </Text>
                        { membership ? (
                            <View>
                                {canPurchase ? (
                                    <TouchableOpacity
                                        onPress={handleBuyingAssets}
                                        className={`px-8 py-4 rounded-3xl min-h-10 min-w-32 mt-4 mb-4 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                                    >
                                        <Text className={`text-1xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                                            Buy assets
                                        </Text>
                                    </TouchableOpacity>
                                 ) : (
                                     <Text className={`text-2xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                                         Purchases are currently closed
                                     </Text>
                                )}
                            </View>
                        ) : null }
                    </View>
                )}

            </View>

            <Footer path={`/groups`}/>

        </SafeAreaView>

    );
}

export default groupDetails;









































