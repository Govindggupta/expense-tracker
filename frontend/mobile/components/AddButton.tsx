import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AddButtonProps {
  color?: string;
  size?: number;
  onPress?: () => void;
}

const AddButton: React.FC<AddButtonProps> = ({ color, size = 24, onPress }) => {
  return (
    <TouchableOpacity className="justify-center items-center" onPress={onPress}>
      <Ionicons name="add-circle" size={size} color={color} />
    </TouchableOpacity>
  );
};

export default AddButton;
