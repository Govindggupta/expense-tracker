import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SignedIn } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { VictoryPie, VictoryTheme } from 'victory-native';
import axios from 'axios';
import { useUser, useAuth } from '@clerk/clerk-expo';
import AddButton from '@/components/AddButton';

type ExpenseData = {
  id: string;
  categoryName: string;
  totalAmount: number;
};

const Analysis = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExpenseOverview = async () => {
      if (!user) return;

      try {
        const clerkToken = await getToken();
        if (!clerkToken) {
          setError('Authentication failed. Please log in again.');
          return;
        }

        const response = await axios.get('https://expense-tracker-ldy5.onrender.com/v1/analysis/expense-overview', {
          headers: {
            Authorization: `Bearer ${clerkToken}`,
          },
        });

        // Transform data for FlatList
        const transformedData = response.data.data.map((item: any) => ({
          id: item.categoryId, // Use categoryId as the unique ID
          categoryName: item.categoryName, // Category name
          totalAmount: item.totalAmount, // Total amount for the category
        }));
        console.log(transformedData);
        setExpenseData(transformedData);
      } catch (err) {
        setError('Failed to fetch expense overview.');
        console.error('Error fetching expense overview:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenseOverview();
  }, [user]);

  const handleAddPress = () => {
    router.replace('/(root)/AddExpense');
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#2162DB" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text className="text-red-500">{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 items-center p-5">
      <SignedIn>
        <View className="w-full items-center">
          <View className="GRAPH w-5/6 aspect-square flex items-center justify-center">
            {expenseData.length > 0 ? (
              <VictoryPie
                width={300}
                innerRadius={55}
                data={expenseData.map((item) => ({
                  x: item.categoryName,
                  y: item.totalAmount,
                }))}
                theme={VictoryTheme.clean}
                colorScale={['#2162DB', '#34D399', '#FBBF24', '#EF4444', '#8B5CF6']} // Custom colors
              />
            ) : (
              <Text className="text-gray-500">No expense data available.</Text>
            )}
          </View>
        </View>
        <FlatList
          data={expenseData}
          keyExtractor={(item) => item.id} // Use categoryId as the key
          renderItem={({ item }) => (
            <View className="w-full bg-blue-100 flex-row justify-between h-16 items-center px-3 rounded">
              <View className="flex-row items-center gap-2">
                <View className="h-12 w-12 bg-white rounded"></View>
                <Text className="">{item.categoryName}</Text> {/* Wrapped in <Text> */}
              </View>
              <Text>{item.totalAmount}</Text> {/* Wrapped in <Text> */}
            </View>
          )}
        />
        <View className="absolute bottom-20 right-5">
          <AddButton color="#2162DB" size={65} onPress={handleAddPress} />
        </View>
      </SignedIn>
    </SafeAreaView>
  );
};

export default Analysis;