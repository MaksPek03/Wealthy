import React from 'react';
import { Text, Pressable } from 'react-native';
import { useTheme } from "@/app/context/ThemeContext";

interface Props {
    filterDay: string;
    filterText: string;
    selectedFilter: string;
    setSelectedFilter: (filterDay: string) => void;
}

const FilterHistory = ({ filterDay, filterText, selectedFilter, setSelectedFilter}: Props) => {
    const { isDark, toggleTheme } = useTheme();
    const isSelectedFilter = (filter: string) => filter === selectedFilter;

    return (
        <Pressable className={`${isSelectedFilter(filterDay) ? "bg-selected" : "bg-transparent"} py-2.5 px-2.5 rounded-xl`}
            onPress={() => {setSelectedFilter(filterDay)}}>
            <Text className={`text-white`}>{filterText}</Text>
        </Pressable>
    )
}

export default FilterHistory;
