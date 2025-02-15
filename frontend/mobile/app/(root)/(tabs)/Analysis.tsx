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
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('daily');
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
    <SafeAreaView className="flex-1 p-5">
      <SignedIn>
        <View className="w-full items-center">
          <Picker
            selectedValue={analysisType}
            onValueChange={(itemValue) => setAnalysisType(itemValue)}
            style={{ width: '100%', marginBottom: 10 }}
          >
            <Picker.Item label="Expense" value="expense" />
            <Picker.Item label="Income" value="income" />
            <Picker.Item label="Wallet" value="wallet" />
          </Picker>

          <Picker
            selectedValue={period}
            onValueChange={(itemValue) => setPeriod(itemValue)}
            style={{ width: '100%', marginBottom: 10 }}
          >
            <Picker.Item label="Day" value="daily" />
            <Picker.Item label="Week" value="weekly" />
            <Picker.Item label="Month" value="monthly" />
            <Picker.Item label="Year" value="yearly" />
            <Picker.Item label="Custom" value="custom" />
          </Picker>

          {period === 'custom' && (
            <View>
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

        <FlatList
          data={analysisType === 'wallet' ? walletData : expenseData}
          keyExtractor={(item) => (analysisType === 'wallet' ? item.walletId : item.id)}
          renderItem={({ item }) => (
            <View className="w-full bg-blue-100 flex-row justify-between h-16 items-center px-3 rounded my-2">
              <View className="flex-row items-center gap-2">
                <View className="h-12 w-12 bg-white rounded"></View>
                <Text className="text-lg font-medium">
                  {analysisType === 'wallet' ? item.walletName : item.categoryName}
                </Text>
              </View>
              <Text className="text-lg font-medium">
                {analysisType === 'wallet'
                  ? `Net: $${item.totalIncome - item.totalExpense}`
                  : `$${item.totalAmount}`}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-500">No data available.</Text>
            </View>
          }
        />

        <View className="absolute bottom-20 right-5">
          <AddButton color="#2162DB" size={65} onPress={handleAddPress} />
        </View>
      </SignedIn>
    </SafeAreaView>
  );
};

export default Analysis;