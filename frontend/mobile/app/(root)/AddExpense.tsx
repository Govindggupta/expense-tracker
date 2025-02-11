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
import WalletModal from '@/components/WalletModal';
import CategoryModal from '@/components/CategoryModal';
import { useUser, useAuth } from '@clerk/clerk-expo';
import axios from 'axios';
import DatePickerModal from '@/components/DatePickerModal';

const AddExpense = () => {
  const [isWalletModalVisible, setWalletModalVisible] = useState(false);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const [selectedWallet, setSelectedWallet] = useState<{ id: string; name: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [selectedOption, setSelectedOption] = useState('Expense');
  const [note, setNote] = useState('');
  const [inputValue, setInputValue] = useState('');

  const { user } = useUser();
  const { getToken } = useAuth();

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

  const handleSave = async () => {
    if (!selectedWallet || !selectedCategory || !inputValue) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }

    try {
      const clerkToken = await getToken();
      if (!clerkToken) {
        Alert.alert('Authentication Error', 'Please log in again.');
        return;
      }

      const formattedAmount = parseFloat(inputValue.replace(/[^0-9.]/g, ''));
      if (isNaN(formattedAmount) || formattedAmount <= 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid number.');
        return;
      }

      const type = selectedOption.toUpperCase();

      const expenseData = {
        userId: user?.id,
        amount: formattedAmount,
        description: note,
        attachmentUrl: '',
        categoryId: selectedCategory.id,
        walletId: selectedWallet.id,
        type,
        date: selectedDate.toISOString(),
      };

      const response = await axios.post(
        'https://expense-tracker-ldy5.onrender.com/v1/expenses/',
        expenseData,
        {
          headers: {
            Authorization: `Bearer ${clerkToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      Alert.alert('Success', 'Expense added successfully!');
      setInputValue('');
      setNote('');
      setSelectedWallet(null);
      setSelectedCategory(null);
      setSelectedDate(new Date());
      router.replace('/');
    } catch (error) {
      console.error('Error saving expense:', error);
      Alert.alert('Error', 'Failed to add expense. Please try again.');
    }
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
      className="flex-1 bg-white"
    >
      <View className="flex-1 p-5 max-w-xl mx-auto">
        {/* Income and Expense Options */}
        <View className="flex-row justify-center gap-20 mb-3 mt-2">
          <TouchableOpacity onPress={() => handleOptionSelect('Income')}>
            <Text
              className={`text-xl p-2 ${
                selectedOption === 'Income' ? 'font-bold text-blue-500' : 'text-gray-500'
              }`}
            >
              Income
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleOptionSelect('Expense')}>
            <Text
              className={`text-xl p-2 ${
                selectedOption === 'Expense' ? 'font-bold text-blue-500' : 'text-gray-500'
              }`}
            >
              Expense
            </Text>
          </TouchableOpacity>
        </View>

        {/* Icon Boxes */}
        <View className="flex-row justify-center mb-2 gap-2 w-full">
          <TouchableOpacity className="w-16 h-16 justify-center items-center border border-blue-400 bg-blue-100 rounded-xl">
            <Ionicons name="attach" size={24} color="black" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 h-16 w-16 justify-center items-center border border-gray-400 bg-gray-100 rounded-xl"
            onPress={() => setWalletModalVisible(true)}
          >
            {selectedWallet ? (
              <Text className="text-md font-bold">{selectedWallet.name}</Text>
            ) : (
              <Ionicons name="wallet" size={24} color="black" />
            )}
          </TouchableOpacity>

          <WalletModal
            isVisible={isWalletModalVisible}
            onClose={() => setWalletModalVisible(false)}
            onSelectWallet={(wallet) => {
              setSelectedWallet(wallet);
              setWalletModalVisible(false);
            }}
          />

          <TouchableOpacity
            className="flex-1 h-16 w-16 justify-center items-center border border-gray-400 bg-gray-100 rounded-xl"
            onPress={() => setCategoryModalVisible(true)}
          >
            {selectedCategory ? (
              <Text className="text-md font-bold">{selectedCategory.name}</Text>
            ) : (
              <Ionicons name="pricetag" size={24} color="black" />
            )}
          </TouchableOpacity>

          <CategoryModal
            isVisible={isCategoryModalVisible}
            onClose={() => setCategoryModalVisible(false)}
            onSelectCategory={(category) => {
              setSelectedCategory(category);
              setCategoryModalVisible(false);
            }}
            selectedOption={selectedOption}
          />
        </View>

        {/* Note Input */}
        <TextInput
          className="border border-gray-400 bg-gray-100 rounded-xl h-40 p-3 mb-2 text-gray-800"
          placeholder="Add a note"
          placeholderTextColor="#6b7280"
          value={note}
          onChangeText={setNote}
          multiline
        />

        {/* Numpad */}
        <View className="mb-3">
          <View className="flex-row justify-between items-center mb-2 border border-gray-400 bg-gray-100 rounded-lg h-20 p-5">
            <Text className="text-4xl font-semibold text-gray-900">{inputValue}</Text>
            <TouchableOpacity onPress={handleUndo} onLongPress={handleLongPress}>
              <Ionicons name="backspace" size={27} color="black" />
            </TouchableOpacity>
          </View>
          {['123+', '456-', '789x', '=0.÷'].map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row justify-between mb-1">
              {row.split('').map((item) => (
                <TouchableOpacity
                  key={item}
                  className={`w-[22vw] h-[10vh] justify-center items-center border border-gray-400 rounded-lg ${
                    ['+', '-', 'x', '÷', '='].includes(item)
                      ? 'bg-blue-100 border-blue-400'
                      : 'bg-gray-100'
                  }`}
                  onPress={() => handleNumpadPress(item)}
                >
                  <Text className="text-2xl font-medium text-gray-900">{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {/* Save and Cancel Buttons */}
        <View className="flex-row justify-between mb-2">
          <TouchableOpacity
            className="flex-1 mx-1 p-4 bg-green-500 rounded-lg justify-center items-center"
            onPress={handleSave}
          >
            <Text className="text-white text-lg font-semibold">Save</Text>
          </TouchableOpacity>
          <Link
            href="/"
            className="flex-1 mx-1 p-4 bg-red-500 rounded-lg justify-center items-center"
          >
            <Text className="text-white text-lg font-semibold text-center">Cancel</Text>
          </Link>
        </View>

        {/* Date and Month */}
        <View className="items-center">
          <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
            <Text className="text-lg font-semibold text-gray-600">
              Date: {selectedDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Picker Modal */}
        <DatePickerModal
          isVisible={isDatePickerVisible}
          onClose={() => setDatePickerVisible(false)}
          onDateSelect={(date) => setSelectedDate(date)}
          initialDate={selectedDate}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default AddExpense;
