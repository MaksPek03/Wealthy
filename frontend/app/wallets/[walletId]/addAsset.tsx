import {
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {useTheme} from "@/app/context/ThemeContext";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, {useEffect, useState} from 'react';
import Header from "@/app/components/Header";
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Menu from "@/app/components/Menu";

interface Asset {
    id: string;
    name: string;
}

const addAsset = () => {
    const { walletId } = useLocalSearchParams();
    const { isDark, toggleTheme } = useTheme();
    const [open, setOpen] = useState(false);
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [items, setItems] = useState<{ label: string; value: string }[]>([]);
    const router = useRouter()
    const [quantity, setQuantity] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [loading, setLoading] = useState(false);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [purchaseDate, setPurchaseDate] = useState<Date | null>(null);

    const showDatePicker = () => setDatePickerVisibility(true);
    const hideDatePicker = () => setDatePickerVisibility(false);

    const handleConfirmDate = (date: Date) => {
        setPurchaseDate(date);
        hideDatePicker();
    };


    useEffect(() => {
        fetchListOfAssets();
    }, []);

    const fetchListOfAssets = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://wealthy-0mga.onrender.com/api/assets/');
            const data: Asset[] = await response.json();

            const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));

            setAssets(sorted);
            setItems(sorted.map(a => ({ label: a.name, value: a.id })));
        } catch (err) {
            console.error('Error fetching prices:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAsset = async (quantityParsed: number, priceParsed: number, formattedDate: String) => {
        try {
            const response = await fetch(
                `https://wealthy-0mga.onrender.com/api/account/profile/wallets/${walletId}/add_wallet_asset/${selectedAssetId}/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        quantity: quantityParsed,
                        purchase_price: priceParsed,
                        purchase_date: formattedDate,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                Alert.alert("Error", data.error || "Failed to add asset");
                return;
            }

            Alert.alert("Success", "Asset added to wallet!");
            router.replace(`/wallets/${walletId}`);

        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Could not connect to server");
        }
    };

    const onConfirm = () => {
        const quantityParsed = parseFloat(quantity.replace(',', '.'));
        const priceParsed = parseFloat(purchasePrice.replace(',', '.'));

        if (isNaN(quantityParsed) || isNaN(priceParsed)) {
            Alert.alert("Invalid input", "Quantity and Purchase price must be numeric values.");
            return;
        }

        if (!selectedAssetId) {
            Alert.alert("Missing asset", "Please select an asset.");
            return;
        }

        if (!purchaseDate) {
            Alert.alert("Missing date", "Please select a purchase date.");
            return;
        }

        const formattedDate = purchaseDate.toISOString().split('T')[0];

        handleAddAsset(quantityParsed, priceParsed, formattedDate)
    };

    return (
        <SafeAreaView className={`flex-1 ${isDark ? "bg-headers-dark" : "bg-headers"}`}>
            <Header title={"ADD ASSET"} back={`/wallets/${walletId}`}/>

            <View className={`flex-[5] items-center ${isDark ? "bg-background-dark" : "bg-background"}`}>
                <View className={`w-1/2 mt-16`}>
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
                            backgroundColor: isDark ? '#868686' : '#ffffff',
                            borderColor: isDark ? '#444' : '#ccc',
                        }}
                        dropDownContainerStyle={{
                            backgroundColor: isDark ? '#868686' : '#ffffff',
                            borderColor: isDark ? '#444' : '#ccc',
                        }}
                        textStyle={{
                            color: isDark ? '#ffffff' : '#000000'
                        }}
                        listMode="SCROLLVIEW"
                    />
                </View>

                <Text className={`text-1xl text-center mt-12 font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                    Quantity:
                </Text>

                <TextInput
                    className={`px-8 py-4 min-h-14 min-w-60 text-center text-lg font-bold ${isDark ?
                        "bg-buttons-dark text-text-dark" : "bg-buttons text-text"}`}
                    keyboardType={"decimal-pad"}
                    placeholder={"Quantity:"}
                    placeholderTextColor={isDark ? '#ffffff' : '#000000'}
                    value={quantity}
                    onChangeText={setQuantity}
                    autoCapitalize="none"
                />

                <Text className={`text-1xl text-center mt-12 font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                    Purchase price:
                </Text>

                <TextInput
                    className={`px-8 py-4 min-h-14 min-w-60 text-center text-lg font-bold ${isDark ?
                        "bg-buttons-dark text-text-dark" : "bg-buttons text-text"}`}
                    keyboardType={"decimal-pad"}
                    placeholder={"Purchase price:"}
                    placeholderTextColor={isDark ? '#ffffff' : '#000000'}
                    value={purchasePrice}
                    onChangeText={setPurchasePrice}
                    autoCapitalize="none"
                />

                <Text className={`text-1xl text-center mt-12 font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                    Purchase date:
                </Text>

                <TouchableOpacity
                    onPress={showDatePicker}
                    className={`px-8 py-4 rounded-3xl min-h-10 min-w-48 ${isDark ? "bg-buttons-dark" : "bg-buttons"}`}
                >
                    <Text className={`text-1xl text-center font-bold ${isDark ? "text-text-dark" : "text-text"}`}>
                        {purchaseDate ? purchaseDate.toLocaleDateString() : "Pick purchase date"}
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

            <Menu  page={"WALLETS"}/>

        </SafeAreaView>
    );
}

export default addAsset;
