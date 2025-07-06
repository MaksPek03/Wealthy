import React from 'react';
import { View, Text } from 'react-native';
import { LineChart } from 'react-native-wagmi-charts'
import { useTheme } from "@/app/context/ThemeContext";


interface Point {
    timestamp: number;
    value: number;
}

const Graph = (props: { points: Point[] ; currentPrice: string}) => {
    const { points, currentPrice } = props;
    const { isDark, toggleTheme } = useTheme();

    return (
        <View>
            <View className={`flex-row mt-7 ml-7`}>
                <Text>
                    Current price: {currentPrice}
                </Text>

            </View>
            <View>
                <LineChart.Provider data={points}>
                    <LineChart>
                        <LineChart.Path />
                        <LineChart.CursorCrosshair/>
                    </LineChart>
                    <LineChart.PriceText style={{textAlign:"center"}}/>
                    <LineChart.DatetimeText style={{textAlign:"center"}}/>
                </LineChart.Provider>
            </View>
        </View>

    )
}

export default Graph;
