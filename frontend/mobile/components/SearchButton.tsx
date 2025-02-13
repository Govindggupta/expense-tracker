// SearchButton.js
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface SearchButtonProps {
    onClick: () => void;
    label?: string;
    className?: string;
}

const SearchButton = ({ onClick, label, className = '' }: SearchButtonProps) => {
    return (
        <TouchableOpacity onPress={onClick} className={`flex-row items-center ${className}`}>
            <FontAwesome name="search" size={20} color="white" />
            <Text>{label}</Text>
        </TouchableOpacity>
    );
};

export default SearchButton;
