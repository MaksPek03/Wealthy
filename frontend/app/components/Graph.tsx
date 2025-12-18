import React from 'react';
import { View, Text } from 'react-native';
import { LineChart } from 'react-native-wagmi-charts'
import { useTheme } from "@/app/context/ThemeContext";

interface Point {
    timestamp: number;
    value: number;
}

interface Props {
    points?: Point[];
    currentPrice: string;
}

const Graph = ({ points = [], currentPrice }: Props) => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <View>
            <View className={`flex-row mt-7 ml-7`}>
                <Text
                    className={`${isDark ? "text-text-dark" : "text-text"}`}>
                    Current price: {currentPrice}
                </Text>

            </View>
            <View>
                {points?.length ? (
                    <LineChart.Provider data={points}>
                        <LineChart>
                            <LineChart.Path
                                color={isDark ? "#ffffff" : "#000000"} />
                            <LineChart.CursorCrosshair
                                color={isDark ? "#ffffff" : "#000000"} />
                        </LineChart>
                        <LineChart.PriceText style={{textAlign:"center",
                            color: isDark ? "#ffffff" : "#000000"}}/>
                        <LineChart.DatetimeText style={{textAlign:"center",
                            color: isDark ? "#ffffff" : "#000000"}}/>
                    </LineChart.Provider>
                    ) : (
                        <Text className={` text-center ${isDark ? "text-text-dark" : "text-text"}`}>
                            We don't have any historic prices to show
                        </Text>
                    )}
            </View>
        </View>

    )
}

export default Graph;
