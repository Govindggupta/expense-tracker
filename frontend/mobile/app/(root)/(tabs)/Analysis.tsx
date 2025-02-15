import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SignedIn } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { VictoryPie, VictoryBar, VictoryTheme } from 'victory-native';
import axios from 'axios';
import { useUser, useAuth } from '@clerk/clerk-expo';
import AddButton from '@/components/AddButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

type ExpenseData = {
  id: string;
  categoryName: string;
  totalAmount: number;
};

type WalletData = {
  walletId: string;
  walletName: string;
  totalIncome: number;
  totalExpense: number;
};

const Analysis = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([]);
  const [walletData, setWalletData] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analysisType, setAnalysisType] = useState<'expense' | 'income' | 'wallet'>('expense');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'>(
    'daily',
  );
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const clerkToken = await getToken();
        if (!clerkToken) {
          setError('Authentication failed. Please log in again.');
          return;
        }

        let url = '';
        if (analysisType === 'expense') {
          url = 'https://expense-tracker-ldy5.onrender.com/v1/analysis/expense-overview/period';
        } else if (analysisType === 'income') {
          url = 'https://expense-tracker-ldy5.onrender.com/v1/analysis/income-overview/period';
        } else if (analysisType === 'wallet') {
          url = 'https://expense-tracker-ldy5.onrender.com/v1/analysis/wallet-analysis/period';
        }

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${clerkToken}`,
          },
          params: {
            period,
            startDate: period === 'custom' ? startDate.toISOString() : undefined,
            endDate: period === 'custom' ? endDate.toISOString() : undefined,
          },
        });

        console.log('Fetched Data:', response.data.data); // Debugging line
        if (analysisType === 'wallet') {
          setWalletData(response.data.data);
        } else {
          setExpenseData(response.data.data);
        }
      } catch (err) {
        setError('Failed to fetch data.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, analysisType, period, startDate, endDate]);

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
    <SafeAreaView className="flex-1 p-5 bg-white">
      <SignedIn>
        <View className="w-full items-center">
          <View className="flex-row justify-between w-full mb-4">
            {/* Analysis Type Picker */}
            <View className="flex-1 bg-white border border-[#2A7C76] rounded-lg mr-2">
              <Picker
                selectedValue={analysisType}
                onValueChange={(itemValue) => setAnalysisType(itemValue)}
                style={{ width: '100%', height: 50, color: '#2A7C76' }}
              >
                <Picker.Item label="Expense" value="expense" />
                <Picker.Item label="Income" value="income" />
                <Picker.Item label="Wallet" value="wallet" />
              </Picker>
            </View>

            {/* Period Picker */}
            <View className="flex-1 bg-white border border-[#2A7C76] rounded-lg ml-2">
              <Picker
                selectedValue={period}
                onValueChange={(itemValue) => setPeriod(itemValue)}
                style={{ width: '100%', height: 50, color: '#2A7C76' }}
              >
                <Picker.Item label="Day" value="daily" />
                <Picker.Item label="Week" value="weekly" />
                <Picker.Item label="Month" value="monthly" />
                <Picker.Item label="Year" value="yearly" />
                <Picker.Item label="Custom" value="custom" />
              </Picker>
            </View>
          </View>

          {/* Custom Date Pickers */}
          {period === 'custom' && (
            <View className="flex-row justify-between w-full">
              <View className="flex-1 bg-white border border-[#2A7C76] rounded-lg mr-2">
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setStartDate(selectedDate);
                    }
                  }}
                />
              </View>
              <View className="flex-1 bg-white border border-[#2A7C76] rounded-lg ml-2">
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setEndDate(selectedDate);
                    }
                  }}
                />
              </View>
            </View>
          )}

          <View className="GRAPH w-5/6 aspect-square flex items-center justify-center">
            {analysisType === 'wallet' ? (
              walletData.length > 0 ? (
                <VictoryBar
                  data={walletData}
                  x="walletName"
                  y={(datum) => datum.totalIncome - datum.totalExpense}
                  theme={VictoryTheme.clean}
                  colorScale={['#2162DB', '#34D399', '#FBBF24', '#EF4444', '#8B5CF6']}
                />
              ) : (
                <Text className="text-gray-500">No wallet data available.</Text>
              )
            ) : expenseData.length > 0 ? (
              <VictoryPie
                width={300}
                innerRadius={55}
                data={expenseData.map((item) => ({
                  x: item.categoryName,
                  y: item.totalAmount,
                }))}
                theme={VictoryTheme.clean}
                colorScale={['#2162DB', '#34D399', '#FBBF24', '#EF4444', '#8B5CF6']}
              />
            ) : (
              <Text className="text-gray-500">No expense data available.</Text>
            )}
          </View>
        </View>

        {analysisType === 'wallet' ? (
          <FlatList
            data={walletData}
            keyExtractor={(item) => item.walletId}
            renderItem={({ item }) => (
              <View className="w-full bg-[#EFFCFB] border border-green-700 rounded-3xl flex-row justify-between h-16 items-center px-3 my-2">
                <View className="flex-row items-center gap-2">
                  <View className="h-12 w-12 border border-green-700 bg-white rounded-lg flex justify-center items-center">
                    <Text className="text-lg font-bold">{item.walletName[0]}</Text>
                  </View>
                  <Text className="text-lg font-medium">{item.walletName}</Text>
                </View>
                <Text className="text-lg font-medium">
                  Net: ₹{item.totalIncome - item.totalExpense}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center">
                <Text className="text-gray-500">No wallet data available.</Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={expenseData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="w-full bg-[#EFFCFB] border border-green-700 rounded-3xl flex-row justify-between h-16 items-center px-3 my-2">
                <View className="flex-row items-center gap-2">
                  <View className="h-12 w-12 border border-green-700 bg-white rounded-full flex justify-center items-center">
                    <Text className="text-lg font-bold">{item.categoryName[0]}</Text>
                  </View>
                  <Text className="text-lg font-medium">{item.categoryName}</Text>
                </View>
                <Text className="text-lg font-medium">₹{item.totalAmount}</Text>
              </View>
            )}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center">
                <Text className="text-gray-500">No expense data available.</Text>
              </View>
            }
          />
        )}

        <View className="absolute bottom-20 right-5">
          <AddButton color="#2A7C76" size={65} onPress={handleAddPress} />
        </View>
      </SignedIn>
    </SafeAreaView>
  );
};

export default Analysis;
