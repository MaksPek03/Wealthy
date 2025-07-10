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
                <Text>
                    Current price: {currentPrice}
                </Text>

            </View>
            <View>
                {points?.length ? (
                    <LineChart.Provider data={points}>
                        <LineChart>
                            <LineChart.Path />
                            <LineChart.CursorCrosshair/>
                        </LineChart>
                        <LineChart.PriceText style={{textAlign:"center"}}/>
                        <LineChart.DatetimeText style={{textAlign:"center"}}/>
                    </LineChart.Provider>
                    ) : (
                        <Text className={` text-center `}>
                            We don't have any historic prices to show
                        </Text>
                    )}
            </View>
        </View>

    )
}

export default Graph;
