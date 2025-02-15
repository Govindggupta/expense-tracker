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

  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);

  useEffect(() => {
    const fetchExpensesAndBalance = async () => {
      try {
        const token = await getToken();

        // Fetch expenses
        const expensesResponse = await axios.get('https://expense-tracker-ldy5.onrender.com/v1/expenses/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const formattedExpenses = expensesResponse.data.expenses.map((expense: Expense) => ({
          ...expense,
          date: new Date(expense.date).toISOString(),
          walletName: expense.walletName || 'Unknown Wallet',
        }));

        setExpenses(formattedExpenses);

        // Calculate total income and expenses
        const income = formattedExpenses
          .filter((expense) => expense.type === 'INCOME')
          .reduce((acc, expense) => acc + expense.amount, 0);
        const expensesTotal = formattedExpenses
          .filter((expense) => expense.type === 'EXPENSE')
          .reduce((acc, expense) => acc + expense.amount, 0);

        setTotalIncome(income);
        setTotalExpenses(expensesTotal);

        // Fetch wallets to calculate total balance
        const walletsResponse = await axios.get('https://expense-tracker-ldy5.onrender.com/v1/wallet/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const total = walletsResponse.data.wallets.reduce((acc: number, wallet: any) => acc + wallet.balance, 0);
        setTotalBalance(total);
      } catch (error) {
        console.error('Error fetching expenses or wallets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpensesAndBalance();
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
          <View className="bg-[#b4dad7] rounded-3xl h-56 w-11/12 mt-16 mx-auto p-4 shadow-lg">
            <Text className="text-3xl font-bold text-center text-gray-800 mb-4">Total Balance</Text>
            <Text className="text-4xl font-bold text-center text-gray-800 mb-6">₹{totalBalance}</Text>
            <View className="flex-row justify-between">
              <View className="flex-1 mr-2">
                <Text className="text-lg font-semibold text-center text-gray-600">Total Income</Text>
                <Text className="text-xl font-bold text-center text-green-500">₹{totalIncome}</Text>
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-lg font-semibold text-center text-gray-600">Total Expenses</Text>
                <Text className="text-xl font-bold text-center text-red-500">₹{totalExpenses}</Text>
              </View>
            </View>
          </View>
          <Text className="text-2xl font-semibold text-center mt-4 text-gray-800">Transactions History</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#2162DB" className="mt-8" />
          ) : expenses.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-lg text-gray-500">No expenses yet! Add one</Text>
              <Feather name="arrow-down-right" size={40} color="#2162DB" className="mt-4" />
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
                  <View className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
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
                <View className="p-2 bg-gray-100">
                  <Text className="text-xl font-bold text-gray-900">{title}</Text>
                  <View className="bg-gray-400 h-0.5 mt-1" />
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
                <Text className="text-xl font-bold text-center mb-4 text-[#2A7C76]">Expense Details</Text>
                {/* ... (keep the existing modal content) */}
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