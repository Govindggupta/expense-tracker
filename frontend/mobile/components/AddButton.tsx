import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AddCircleButtonProps {
  color?: string;
  size?: number;
  onPress?: () => void;
}

const AddCircleButton: React.FC<AddCircleButtonProps> = ({ color = 'blue', size = 24, onPress }) => {
  return (
    <TouchableOpacity className="justify-center items-center" onPress={onPress}>
      <Ionicons name="add-circle" size={size} color={color} />
    </TouchableOpacity>
  );
};

export default AddCircleButton;
