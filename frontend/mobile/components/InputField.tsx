import { TextInput, View, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';

const InputField: React.FC<{
  label: string;
  secureTextEntry?: boolean;
  labelStyle?: string;
  containerStyle?: string;
  inputStyle?: string;
  className?: string;
  [key: string]: any;
}> = ({
  label,
  secureTextEntry = false,
  labelStyle,
  containerStyle,
  inputStyle,
  className,
  ...props
}) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="my-4 w-full">
        <Text className={`text-lg mb-2 font-semibold ${labelStyle}`}>{label}</Text>
        <View
          className={`flex flex-row items-center bg-neutral-100 rounded-lg border-[1.5px] border-[#2A7C76] focus:border-primary-500 px-4 py-1 min-h-[50px] ${containerStyle}`}
        >
          <TextInput
            className={`text-[15px] flex-1 text-gray-900 ${inputStyle}`}
            secureTextEntry={secureTextEntry}
            {...props}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default InputField;
