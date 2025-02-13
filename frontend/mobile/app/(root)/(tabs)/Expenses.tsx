import React, { useContext, useEffect, useState } from 'react';
import { Text, View, ActivityIndicator, TouchableOpacity, Alert, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser, SignedIn } from '@clerk/clerk-expo';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-expo';
import AddButton from '@/components/AddButton';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ReactNativeModal from 'react-native-modal';
import { ReloadContext } from '@/context/ReloadContext';
import { RefreshControl } from 'react-native-gesture-handler';

const formatDate = (isoDate: string) => {
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

type Expense = {
  id: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  walletId: string;
  walletName: string;
  date: string;
  description: string;
  type: 'EXPENSE' | 'INCOME';
  attachmentUrl?: string;
};

// Utility function to group expenses by month
const groupExpensesByMonth = (expenses: Expense[]) => {
  const grouped: { [key: string]: Expense[] } = {};

  expenses.forEach((expense) => {
    const date = new Date(expense.date);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });

    if (!grouped[monthYear]) {
      grouped[monthYear] = [];
    }
    grouped[monthYear].push(expense);
  });

  return Object.keys(grouped).map((monthYear) => ({
    title: monthYear,
    data: grouped[monthYear],
  }));
};

const Expenses = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const { reload, triggerReload } = useContext(ReloadContext);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = await getToken();
        const response = await axios.get('https://expense-tracker-ldy5.onrender.com/v1/expenses/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const formattedExpenses = response.data.expenses.map((expense: Expense) => ({
          ...expense,
          date: new Date(expense.date).toISOString(),
          walletName: expense.walletName || 'Unknown Wallet',
        }));

        setExpenses(formattedExpenses);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [user, reload]);

  const handleAddPress = () => {
    router.replace('/(root)/AddExpense');
  };

  const handleExpensePress = (expense: Expense) => {
    setSelectedExpense(expense);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedExpense(null);
  };

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;

    try {
      const token = await getToken();
      await axios.delete(
        `https://expense-tracker-ldy5.onrender.com/v1/expenses/${selectedExpense.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setExpenses((prevExpenses) =>
        prevExpenses.filter((expense) => expense.id !== selectedExpense.id),
      );

      Alert.alert('Success', 'Expense deleted successfully!');
      closeModal();
    } catch (error) {
      console.error('Error deleting expense:', error);
      Alert.alert('Error', 'Failed to delete expense. Please try again.');
    }
  };

  const handleEditExpense = () => {
    if (!selectedExpense) return;

    router.push({
      pathname: '/(root)/AddExpense',
      params: {
        isEdit: 'true',
        expense: JSON.stringify(selectedExpense),
      },
    });
    closeModal();
  };

  const groupedExpenses = groupExpensesByMonth(expenses);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="absolute top-0 w-full h-56 bg-[#2A7C76] rounded-b-[15%]" />
      <SignedIn>
        <View className="w-full p-2 flex-1">
          <View className="bg-gray-300 rounded-3xl h-56 w-11/12 mt-16 m-auto">
            {/* component here */}
          </View>
          <Text className="text-2xl font-semibold text-center mt-4">Transactions History</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#2162DB" />
          ) : expenses.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-lg text-gray-500">No expenses yet! Add one</Text>
              <Feather name="arrow-down-right" size={40} color="#2162DB" />
            </View>
          ) : (
            <SectionList
              refreshControl={<RefreshControl refreshing={reload} onRefresh={triggerReload} />}
              contentContainerStyle={{ paddingBottom: 120 }}
              sections={groupedExpenses}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleExpensePress(item)}
                  className="p-3 mb-3 mx-2 flex-row items-center border-b border-b-gray-200 justify-between"
                >
                  <View className="w-12 h-12 bg-gray-300 rounded-md flex items-center justify-center">
                    <Text className="text-lg font-bold">
                      {item.categoryName.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View className="flex-1 ml-3">
                    <Text className="text-lg font-medium text-gray-800">{item.categoryName}</Text>
                    <Text className="text-sm text-gray-600">{formatDate(item.date)}</Text>
                  </View>

                  <Text
                    className={`${
                      item.type === 'INCOME' ? 'text-green-500' : 'text-red-500'
                    } text-xl font-bold`}
                  >
                    {item.type === 'INCOME' ? '+' : '-'} ₹{item.amount}
                  </Text>
                </TouchableOpacity>
              )}
              renderSectionHeader={({ section: { title } }) => (
                <View className="p-2">
                  <Text className="text-xl font-bold mt-1 text-gray-900">{title}</Text>
                  <Text className="bg-gray-400 h-0.5 mt-1"></Text>
                </View>
              )}
            />
          )}
        </View>

        <ReactNativeModal
          isVisible={isModalVisible}
          onBackdropPress={closeModal}
          backdropOpacity={0.5}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          style={{ justifyContent: 'center', alignItems: 'center' }}
        >
          <View className="bg-white p-6 rounded-2xl w-11/12">
            {selectedExpense && (
              <View>
                <Text className="text-xl font-bold text-center mb-4 text-[#2A7C76]">
                  Expense Details
                </Text>

                <View className="flex-row justify-between mb-4">
                  <View className="flex-1 mr-2">
                    <Text className="text-lg font-semibold text-gray-800">Type</Text>
                    <Text
                      className={`${
                        selectedExpense.type === 'INCOME' ? 'text-green-500' : 'text-red-500'
                      } text-md font-bold`}
                    >
                      {selectedExpense.type === 'INCOME' ? 'Income' : 'Expense'}
                    </Text>
                  </View>
                  <View className="flex-1 ml-2">
                    <Text className="text-lg font-semibold text-gray-800">Wallet</Text>
                    <Text className="text-md text-gray-600">{selectedExpense.walletName}</Text>
                  </View>
                </View>

                <View className="flex-row justify-between mb-4">
                  <View className="flex-1 mr-2">
                    <Text className="text-lg font-semibold text-gray-800">Category</Text>
                    <Text className="text-md text-gray-600">{selectedExpense.categoryName}</Text>
                  </View>
                  <View className="flex-1 ml-2">
                    <Text className="text-lg font-semibold text-gray-800">Amount</Text>
                    <Text
                      className={`${
                        selectedExpense.type === 'INCOME' ? 'text-green-500' : 'text-red-500'
                      } text-md font-bold`}
                    >
                      {selectedExpense.type === 'INCOME' ? '+' : '-'} ₹{selectedExpense.amount}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between mb-4">
                  <View className="flex-1 mr-2">
                    <Text className="text-lg font-semibold text-gray-800">Date</Text>
                    <Text className="text-md text-gray-600">
                      {formatDate(selectedExpense.date)}
                    </Text>
                  </View>
                  {selectedExpense.description && (
                    <View className="flex-1 ml-2">
                      <Text className="text-lg font-semibold text-gray-800">Description</Text>
                      <Text className="text-md text-gray-600">{selectedExpense.description}</Text>
                    </View>
                  )}
                </View>

                {selectedExpense.attachmentUrl && (
                  <View className="mb-4">
                    <Text className="text-lg font-semibold text-gray-800">Attachment</Text>
                    <Text className="text-md text-gray-600">{selectedExpense.attachmentUrl}</Text>
                  </View>
                )}

                <View className="flex-row justify-between mt-4">
                  <TouchableOpacity
                    onPress={handleEditExpense}
                    className="flex-1 mr-2 py-3 rounded-lg bg-[#2A7C76]"
                  >
                    <Text className="text-white text-center font-semibold text-lg">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleDeleteExpense}
                    className="flex-1 ml-2 py-3 rounded-lg bg-red-500"
                  >
                    <Text className="text-white text-center font-semibold text-lg">Delete</Text>
                  </TouchableOpacity>
                </View>

                {/* <TouchableOpacity
                  onPress={closeModal}
                  className="w-full py-3 rounded-lg bg-gray-400 mt-4"
                >
                  <Text className="text-white text-center text-lg font-semibold">Close</Text>
                </TouchableOpacity> */}
              </View>
            )}
          </View>
        </ReactNativeModal>

        <View className="absolute bottom-20 right-5">
          <AddButton color="#2A7C76" size={65} onPress={handleAddPress} />
        </View>
      </SignedIn>
    </SafeAreaView>
  );
};

export default Expenses;
