import {useLocalSearchParams} from "expo-router";
import {useTheme} from "@/app/context/ThemeContext";
import {useEffect, useState} from "react";
import React from "react";
import Header from "@/app/components/Header";
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DropDownPicker from "react-native-dropdown-picker";
import Menu from "@/app/components/Menu";


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

interface GroupPurchases {
    quantity: number;
    asset_symbol: string;
    price_at_purchase: number;
    created_at: Date;
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
    group_purchases: GroupPurchases[];
}

interface Asset {
    id: string;
    name: string;
    type: string;
    symbol: string;
    current_price: string;
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
    const [open, setOpen] = useState(false);
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [items, setItems] = useState<{ label: string; value: string }[]>([]);
    const [quantity, setQuantity] = useState<string>('');
    const [value, setValue] = useState<number | null>(null);

    useEffect(() => {
        fetchGroupDetails();
    }, [])

    useEffect(() => {
        try {
            const price = assets.find(a => a.id === selectedAssetId)?.current_price;
            if (price) {
                setValue(Number(quantity.replace(',', '.')) * Number(price));
            }
        } catch (e) {
            setValue(null);
        }
    }, [selectedAssetId, quantity]);

    const fetchGroupDetails = async () => {
        const userId = await AsyncStorage.getItem('user_id');
        setUserId(userId)
        setLoading(true);
        try {
            const response = await fetch(`https://wealthy-0mga.onrender.com/api/group_list/${groupId}/`)
            const data = await response.json();

            setGroup(data.group);
            setMembers(data.members);
            setMembership(data.membership);
            setTimeRemaining(data.time_remaining);
            setCanPurchase(data.can_purchase);
            setSummaryStatus(data.summary_status);
            setUserTotalValue(data.user_total_value);
            setGroupTotalValue(data.group_total_value);
            setUserPurchases(data.user_purchases);
            setJoinRequests(data.join_requests);

            const sorted = [...data.assets].sort((a, b) => a.name.localeCompare(b.name));

            setAssets(sorted);
            setItems(sorted.map(a => ({
                label: `${a.name} - ${Number(a.current_price).toFixed(2)}$`,
                value: a.id
            })));

        } catch (err) {
            console.error('Error fetching group details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoining = async () => {
        Alert.alert(
            "Confirmation",
            "Are you sure you want to send request to this group?",
            [
                {
                    text: "Yes",
                    onPress: async () => {
                        try {
                            const response = await fetch(`https://wealthy-0mga.onrender.com/api/group_list/${groupId}/request/`);
                        } catch (err) {
                            console.error('Error sending request:', err);
                        }
                    }
                },
                {
                    text: "No",
                    style: "cancel",
                }
            ]
        )
    }

    const onAcceptRequest = async (requestId: string) => {
        Alert.alert(
            "Confirmation",
            "Are you sure you want to accept request from this user?",
            [
                {
                    text: "Yes",
                    onPress: async () => {
                        try {
                            const response = await fetch(`https://wealthy-0mga.onrender.com/api/group_list/${groupId}/${requestId}/approve/`);
                        } catch (err) {
                            console.error('Error accepting request:', err);
                        }
                        finally {
                            fetchGroupDetails();
                        }
                    }
                },
                {
                    text: "No",
                    style: "cancel",
                }
            ]
        )
    }

    const onDeclineRequest = async (requestId: string) => {
        Alert.alert(
            "Confirmation",
            "Are you sure you want to decline request from this user?",
            [
                {
                    text: "Yes",
                    onPress: async () => {
                        try {
                            const response = await fetch(`https://wealthy-0mga.onrender.com/api/group_list/${groupId}/${requestId}/reject/`);
                        } catch (err) {
                            console.error('Error declining request:', err);
                        }
                        finally {
                            fetchGroupDetails();
                        }
                    }
                },
                {
                    text: "No",
                    style: "cancel",
                }
            ]
        )
    }

    const renderHeaderLeaderboard = () => (
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

    const renderHeaderPurchases = () => (
        <View className={`flex-row ${isDark ? "bg-buttons-dark" : "bg-buttons"} p-2 px-4 border-b border-gray-300`}>
            <Text className={`font-bold text-xl flex-1 ${isDark ? "text-text-dark" : "text-text"}`}>
                Asset
            </Text>
            <Text className={`font-bold text-xl flex-1 ${isDark ? "text-text-dark" : "text-text"}`}>
                Quantity
            </Text>
            <Text className={`font-bold text-xl flex-1 ${isDark ? "text-text-dark" : "text-text"}`}>
                Buy price
            </Text>
            <Text className={`font-bold text-xl flex-1 ${isDark ? "text-text-dark" : "text-text"}`}>
                Current price
            </Text>
            <Text className={`font-bold text-xl flex-1 ${isDark ? "text-text-dark" : "text-text"}`}>
                Value now
            </Text>
            <Text className={`font-bold text-xl flex-1 ${isDark ? "text-text-dark" : "text-text"}`}>
                Profit/Loss
            </Text>
            <Text className={`font-bold text-xl flex-1 ${isDark ? "text-text-dark" : "text-text"}`}>
                Date
            </Text>
        </View>
    );

    const handleDistributionSet = async (distributionParsed: number) => {
        try {
            const response = await fetch(
                `https://wealthy-0mga.onrender.com/api/group_list/${groupId}/distribute/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: distributionParsed,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                Alert.alert("Error", data.error || "Failed to set distribution");
                return;
            }

            Alert.alert("Success", "Succeeded to set distribution!");
            fetchGroupDetails()

        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Could not connect to server");
        }
    }

    const onDistributionSet = () => {
        try {
            const distributionParsed = parseFloat(distribution);
        } catch (e) {
            Alert.alert("Invalid input", "Distribution has to be numeric value.");
            return;
        } finally {
            handleDistributionSet(parseFloat(distribution))
        }
    }

    const handleBuyingAsset = async () => {
        try {
            const response = await fetch(
                `https://wealthy-0mga.onrender.com/api/group_list/${groupId}/buy/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        quantity: quantity.replace(',', '.'),
                        asset_symbol: assets.find(a => a.id === selectedAssetId)?.symbol
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                Alert.alert("Error", data.error || "Failed to buy asset");
                return;
            }

            Alert.alert("Success", "Succeeded to buy asset!");
            fetchGroupDetails()

        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Could not connect to server");
        }
    }

    const onBuyingAsset = async () => {
        try {
            const quantityParsed = parseFloat(quantity)

            if (value === null || membership?.balance === null) {
                Alert.alert("Invalid input");
                return;
            }

            if (quantityParsed < 0) {
                Alert.alert("Invalid input", "Quantity must be positive.");
                return;
            }
            if (value > membership?.balance) {
                Alert.alert("Invalid input", "Value must be smaller than balance.");
                return;
            }
        } catch (e) {
            Alert.alert("Invalid input", "Quantity has to be numeric value.");
            return;
        }
        handleBuyingAsset()
    }

    const formatDate = (input: string |  Date) => {

        const date = typeof input === "string" ? new Date(input) : input;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    return (
        <SafeAreaView className={`flex-1 ${isDark ? "bg-headers-dark" : "bg-headers"}`}>

            <Header title={`${group ? group.name : ''}`} back={`/groups`} />

            <View className={`flex-[5] ${isDark ? "bg-background-dark" : "bg-background"}`}>
                {loading ? (
                    <ActivityIndicator size="large" />
                ) : (
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                        <View>
                            <Text className={`text-2xl text-center mt-3  ${isDark ? "text-text-dark" : "text-text"}`}>
                                Purchase period: {timeRemaining}
                            </Text>
                            <Text className={`text-2xl text-center mt-3  ${isDark ? "text-text-dark" : "text-text"}`}>
                                Summary status: {summaryStatus}
                            </Text>
                            {(userId != group?.created_by_user_id) &&
                                !(membership) && (
                                    <View>
                                        {!joinRequests.some(req => req.user_id === userId) ? (
                                        <View className={`items-center`}>
                                            <TouchableOpacity
                                                onPress={handleJoining}
                                                className={`px-8 py-4 rounded-3xl min-h-10 min-w-32 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                                            >
                                                <Text className={`text-1xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                                                    Request to join
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                        ) : (
                                            <Text className={`text-2xl text-center mt-3  ${isDark ? "text-text-dark" : "text-text"}`}>
                                                Request already sent.
                                            </Text>
                                        )
                                        }
                                    </View>
                            )}
                            {(userId == group?.created_by_user_id) && (
                                <View>
                                <Text className={`text-3xl text-center mt-3  ${isDark ? "text-text-dark" : "text-text"}`}>
                                    Pending requests:
                                </Text>
                                    {joinRequests && joinRequests?.filter(item => !item.is_approved).length > 0 ? (
                                        <View>
                                            {joinRequests?.filter(item => !item.is_approved).map((item, index) => (
                                                <View key={index} className={`justify-around flex-row py-2 border-b border-gray-300 px-4`}>
                                                    <Text className={`text-center font-bold text-1xl py-2.5 px-2.5 ${isDark ? "text-text-dark" : "text-text"}`}>
                                                        {item.user_username}
                                                    </Text>
                                                        <TouchableOpacity
                                                            onPress={() => onAcceptRequest(item.id)}
                                                            className={`min-w-32 py-2.5 px-2.5 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                                                        >
                                                            <Text className={`text-center text-1xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                                                Accept
                                                            </Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            onPress={() => onDeclineRequest(item.id)}
                                                            className={`min-w-32 py-2.5 px-2.5 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                                                                             >
                                                            <Text className={`text-center text-1xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                                                Reject
                                                            </Text>
                                                        </TouchableOpacity>
                                                </View>
                                            ))}
                                        </View>
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
                                <View>
                                    {renderHeaderLeaderboard()}
                                        {members.map((item, index) => (
                                            <View key={index} className={`flex-row py-2 border-b border-gray-300 px-4`}>
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
                                    ))}
                                </View>
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
                                        className={`px-8 py-4 min-h-14 min-w-32 text-center text-lg font-bold ${isDark ?
                                            "bg-buttons-dark text-text-dark" : "bg-buttons text-text"}`}
                                        keyboardType={"decimal-pad"}
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
                            { membership ? (
                                <View>
                                    <Text className={`text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                                        Buy assets
                                    </Text>
                                    {canPurchase ? (
                                        <View className={`items-center`}>
                                            <Text className={`text-1xl text-center ${isDark ? "text-text-dark" : "text-text"}`}>
                                                Your balance: {membership.balance}$
                                            </Text>
                                            <View className={`w-1/2`}>
                                                <DropDownPicker
                                                    open={open}
                                                    value={selectedAssetId}
                                                    items={items}
                                                    setOpen={setOpen}
                                                    setValue={setSelectedAssetId}
                                                    setItems={setItems}
                                                    placeholder="Select asset"
                                                    loading={loading}
                                                    style={{
                                                        backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
                                                        borderColor: isDark ? '#444' : '#ccc',
                                                    }}
                                                    dropDownContainerStyle={{
                                                        backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
                                                        borderColor: isDark ? '#444' : '#ccc',
                                                    }}
                                                    listMode="SCROLLVIEW"
                                                        />
                                            </View>
                                            <Text className={`text-1xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                                                Quantity:
                                            </Text>
                                            <TextInput
                                                className={`px-8 py-4 min-h-14 min-w-60 text-center text-lg font-bold ${isDark ?
                                                    "bg-buttons-dark text-text-dark" : "bg-buttons text-text"}`}
                                                keyboardType={"decimal-pad"}
                                                placeholder={"Quantity:"}
                                                placeholderTextColor={"#000000"}
                                                value={quantity}
                                                onChangeText={setQuantity}
                                                autoCapitalize="none"
                                            />
                                            {(value && value <= membership.balance) ? (
                                            <Text className={`text-1xl text-center ${isDark ? "text-text-dark" : "text-text"}`}>
                                                Value of buying assets: {value}$
                                            </Text>
                                                ): null
                                            }
                                            {(value && value > membership.balance) ? (
                                                <Text className={`text-1xl text-center ${isDark ? "text-text-dark" : "text-text"}`}>
                                                    The value is too big by: {value - membership.balance}$
                                                </Text>
                                            ): null
                                            }
                                            <TouchableOpacity
                                                onPress={() => onBuyingAsset()}
                                                className={`px-8 py-4 rounded-3xl min-h-10 min-w-32 mt-4 mb-4 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                                            >
                                                <Text className={`text-1xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                                                    Buy assets
                                                </Text>
                                            </TouchableOpacity>
                                        </View>

                                     ) : (
                                         <Text className={`text-2xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                                             Purchases are currently closed
                                         </Text>
                                    )}
                                </View>
                            ) : null }
                            <View>
                                <Text className={`text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                                    Your purchases
                                </Text>
                                { userPurchases.length > 0 ? (
                                    <View>
                                        {renderHeaderPurchases()}
                                        {userPurchases.map((item, index) => (
                                            <View key={index} className={`flex-row py-2 border-b border-gray-300 px-4`}>
                                                <Text className={`flex-1 text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                                    {item.symbol}
                                                </Text>
                                                <Text className={`flex-1 text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                                    {item.quantity}
                                                </Text>
                                                <Text className={`flex-1 text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                                    {item.buy_price}
                                                </Text>
                                                <Text className={`flex-1 text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                                    {item.current_price}
                                                </Text>
                                                <Text className={`flex-1 text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                                    {item.value_now}
                                                </Text>
                                                <Text className={`flex-1 text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                                    {item.difference}
                                                </Text>
                                                <Text className={`flex-1 text-2xl ${isDark ? "text-text-dark" : "text-text"}`}>
                                                    {formatDate(item.created_at)}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                ) : (
                                    <Text className={`text-2xl text-center ${isDark ? "text-text-dark" : "text-text"}`}>
                                        You don't have any purchases yet.
                                    </Text>
                                )}
                            </View>
                            <View>
                                <Text className={`text-3xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                                    All group purchases
                                </Text>
                                {members.map((item, index) => (
                                    <View key={index} >
                                        <Text className={`text-2xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                                            {item.user_username} bought:
                                        </Text>
                                        {item.group_purchases.length > 0 ? (
                                            <View className={`items-center`}>
                                                {item.group_purchases.map((p, i) => (
                                                    <View key={i} className={`flex-row py-2 border-b border-gray-300 px-4`}>
                                                        <Text className={`text-2xl text-center ${isDark ? "text-text-dark" : "text-text"}`}>
                                                            {p.quantity} {p.asset_symbol} at {p.price_at_purchase} {formatDate(p.created_at)}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                        ) : (
                                            <Text className={`text-1xl text-center ${isDark ? "text-text-dark" : "text-text"}`}>
                                                No purchases yet.
                                            </Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    </ScrollView>
                )}

            </View>

            <Menu />

        </SafeAreaView>

    );
}

export default groupDetails;
