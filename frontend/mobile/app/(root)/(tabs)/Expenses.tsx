import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser, SignedIn } from '@clerk/clerk-expo';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-expo';
import AddButton from '@/components/AddButton';
import { router } from 'expo-router';
import { Feather, Entypo } from '@expo/vector-icons';

type Expense = {
  id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
};

const Expenses = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = await getToken();
        const response = await axios.get('http://192.168.29.74:8000/v1/expenses/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setExpenses(response.data.expenses);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [user]);

  const handleAddPress = () => {
    router.replace('/(root)/AddExpense');
  };

  const handleExpenses = () => {
    // code
  };

  return (
    <SafeAreaView className="flex-1 p-5 bg-white">
      <SignedIn>
        <View className="w-full max-w-md flex-1">
          <Text className="text-xl font-semibold text-center mb-5">All Expenses</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#2162DB" />
          ) : expenses.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-lg text-gray-500">No expenses yet! Add one</Text>
              <Feather name="arrow-down-right" size={40} color="#2162DB" />
            </View>
          ) : (
            <FlatList
              data={expenses}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View className="bg-blue-100 rounded-xl shadow-md p-4 mb-3 mx-2 flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900">{item.description}</Text>
                    <Text className="text-gray-600 text-sm mt-1">₹{item.amount}</Text>
                  </View>
                  <TouchableOpacity onPress={handleExpenses} className="p-2">
                    <Entypo size={22} name="dots-three-horizontal" color={'#0E3789'} />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>

        <View className="absolute bottom-20 right-5">
          <AddButton color="#2162DB" size={65} onPress={handleAddPress} />
        </View>
      </SignedIn>
    </SafeAreaView>
  );
};

export default Expenses;
