import { Text, TouchableOpacity } from "react-native";
import React from "react";

const CustomButton: React.FC<{
  onPress: () => void;
  title: string;
  IconLeft?: React.FC;
  IconRight?: React.FC;
  className?: string;
  [key: string]: any;
}> = ({ onPress, title, IconLeft, IconRight, className, ...props }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`w-full rounded-lg flex flex-row justify-center items-center shadow-md shadow-neutral-400/70 p-4 ${className}`}
      {...props}
    >
      {IconLeft && <IconLeft />}
      <Text className={`text-lg font-semibold text-white ${className}`}>{title}</Text>
      {IconRight && <IconRight />}
    </TouchableOpacity>
  );
};

export default CustomButton;
