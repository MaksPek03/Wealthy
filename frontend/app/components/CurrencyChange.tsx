import {useTheme} from "@/app/context/ThemeContext";
import React, {useEffect, useState} from "react";
import DropDownPicker from "react-native-dropdown-picker";


interface Props {
    setExchangeRate: (exchangeRate: number) => void;
    setCurrencySymbol: (currencySymbol: string) => void;
}

interface ExchangeRate {
    currency: string;
    currentPrice: number;
}

const CurrencyChange = ({ setExchangeRate, setCurrencySymbol }: Props) => {
    const { isDark, toggleTheme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [rates, setRates] = useState<ExchangeRate[]>([])
    const [items, setItems] = useState<{ label: string; value: string }[]>([]);
    const [open, setOpen] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
    const symbolCurrencyDict: Record<string, string> = {
        usd: '$',
        eur: '€',
        gbp: '£',
        jpy: '¥',
        cad: '$'
    }

    useEffect(() => {
        fetchExchangeRates();
    }, []);

    useEffect(() => {
        if (selectedCurrency) {
            const rate = rates.find(r => r.currency === selectedCurrency)?.currentPrice;
            if (rate !== undefined) {
                setExchangeRate(rate);
                setCurrencySymbol(symbolCurrencyDict[selectedCurrency.toLowerCase()]);
            }
        }
    }, [selectedCurrency]);

    const fetchExchangeRates = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://wealthy-0mga.onrender.com/api/exchange_rates/`)

            const data: Record<string, number> = await response.json();

            const mapped : ExchangeRate[] = Object.entries(data).map(([currency, price]) => ({
                currency,
                currentPrice: price
            }))

            setRates(mapped);
            setItems(mapped.map(a => ({ label: a.currency, value: a.currency })));
        } catch (err) {
            console.error('Error fetching rates:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DropDownPicker
            open={open}
            value={selectedCurrency}
            items={items}
            setOpen={setOpen}
            setValue={setSelectedCurrency}
            setItems={setItems}
            placeholder="Select currency"
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
    );
}

export default CurrencyChange;
