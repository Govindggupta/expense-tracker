import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';

const AddExpense = () => {
  const [selectedOption, setSelectedOption] = useState('Expense');
  const [note, setNote] = useState('');
  const [inputValue, setInputValue] = useState('');

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleNumpadPress = (value: string) => {
    Vibration.vibrate(60);
    const numbersOnly = inputValue.replace(/[^0-9]/g, '');
    if (numbersOnly.length >= 12 && !['+', '-', 'x', '÷', '='].includes(value)) {
      Alert.alert('Limit Exceeded', 'You can only enter a maximum of 12 numbers.');
      return;
    }

    if (['+', '-', 'x', '÷'].includes(value)) {
      setInputValue((prev) => prev + ' ' + value + ' ');
    } else if (value === '=') {
      try {
        const sanitizedInput = inputValue.replace(/x/g, '*').replace(/÷/g, '/');
        const result = eval(sanitizedInput);
        setInputValue(result.toString());
      } catch (error) {
        console.error('Invalid expression:', error);
      }
    } else {
      setInputValue((prev) => prev + value);
    }
  };

  const handleUndo = () => {
    Vibration.vibrate(60);
    setInputValue((prev) => prev.slice(0, -1));
  };

  const handleLongPress = () => {
    Vibration.vibrate(65);
    setInputValue((prev) => prev.slice(0, 0));
  };

  const handleSave = () => {
    // Handle save logic
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace('/');
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View className="flex-1 p-5">
        {/* Income and Expense Options */}
        <View className="flex-row justify-center gap-20 mb-5 mt-3">
          <TouchableOpacity onPress={() => handleOptionSelect('Income')}>
            <Text
              className={`text-xl p-2 ${
                selectedOption === 'Income' ? 'font-bold text-blue-500' : ''
              }`}
            >
              Income
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleOptionSelect('Expense')}>
            <Text
              className={`text-xl p-2 ${
                selectedOption === 'Expense' ? 'font-bold text-blue-500' : ''
              }`}
            >
              Expense
            </Text>
          </TouchableOpacity>
        </View>

        {/* Icon Boxes */}
        <View className="flex-row justify-center mb-3 gap-2 w-full">
          <TouchableOpacity className="w-16 h-16 justify-center items-center border border-gray-400 rounded-xl">
            <Ionicons name="attach" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 h-16 justify-center items-center border border-gray-400 rounded-xl">
            <Ionicons name="wallet" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 h-16 justify-center items-center border border-gray-400 rounded-xl">
            <Ionicons name="pricetag" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Note Input */}
        <TextInput
          className="border border-gray-400 rounded-xl h-40 p-2 mb-3"
          placeholder="Add a note"
          value={note}
          onChangeText={setNote}
        />

        {/* Numpad */}
        <View className="mb-3">
          <View className="flex-row justify-between items-center mb-3 border border-gray-400 rounded-lg h-20">
            <Text className="text-4xl m-5 font-semibold">{inputValue}</Text>
            <TouchableOpacity onPress={handleUndo} onLongPress={handleLongPress}>
              <Ionicons className="mr-4" name="backspace" size={27} color="black" />
            </TouchableOpacity>
          </View>
          {['123+', '456-', '789x', '=0.÷'].map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row justify-between mb-3 pl-5 pr-5">
              {row.split('').map((item) => (
                <TouchableOpacity
                  key={item}
                  className={`w-20 h-20 justify-center items-center border border-gray-400 rounded-lg ${
                    ['+', '-', 'x', '÷', '='].includes(item) ? 'bg-gray-300' : ''
                  }`}
                  onPress={() => handleNumpadPress(item)}
                >
                  <Text className="text-lg">{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {/* Save and Cancel Buttons */}
        <View className="flex-row justify-between mb-3">
          <TouchableOpacity
            className="flex-1 mx-1 p-3 bg-blue-500 rounded-lg justify-center items-center"
            onPress={handleSave}
          >
            <Text className="text-white text-lg">Save</Text>
          </TouchableOpacity>
          <Link
            href="/"
            className="flex-1 mx-1 p-3 bg-gray-500 rounded-lg justify-center items-center"
          >
            <Text className="text-white text-lg text-center">Cancel</Text>
          </Link>
        </View>

        {/* Date and Month */}
        <View className="items-center">
          <Text className="text-lg font-semibold text-gray-600">
            Date: {new Date().toLocaleDateString()}
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AddExpense;
