// import React, { useEffect, useState } from 'react';
// import { Text, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useUser, SignedIn } from '@clerk/clerk-expo';
// import axios from 'axios';
// import { useAuth } from '@clerk/clerk-expo';
// import AddButton from '@/components/AddButton';
// import { router } from 'expo-router';
// import { Feather } from '@expo/vector-icons';

// // Function to format the date
// const formatDate = (isoDate: string) => {
//   const date = new Date(isoDate);
//   const today = new Date();
//   const yesterday = new Date();
//   yesterday.setDate(today.getDate() - 1);

//   if (date.toDateString() === today.toDateString()) {
//     return "Today";
//   } else if (date.toDateString() === yesterday.toDateString()) {
//     return "Yesterday";
//   } else {
//     return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
//   }
// };

// type Expense = {
//   id: string;
//   amount: number;
//   categoryId: string;
//   categoryName: string;
//   date: string;
//   description: string;
//   type: 'EXPENSE' | 'INCOME';
// };

// const Expenses = () => {
//   const { getToken } = useAuth();
//   const { user } = useUser();
//   const [expenses, setExpenses] = useState<Expense[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchExpenses = async () => {
//       try {
//         const token = await getToken();
//         const response = await axios.get('https://expense-tracker-ldy5.onrender.com/v1/expenses/', {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         setExpenses(response.data.expenses);
//       } catch (error) {
//         console.error('Error fetching expenses:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchExpenses();
//   }, [user]);

//   const handleAddPress = () => {
//     router.replace('/(root)/AddExpense');
//   };

//   return (
//     <SafeAreaView className="flex-1 p-1 bg-white">
//       <SignedIn>
//         <View className="w-full max-w-md flex-1">
//           <Text className="text-xl font-semibold text-center mb-5">All Expenses</Text>

//           {loading ? (
//             <ActivityIndicator size="large" color="#2162DB" />
//           ) : expenses.length === 0 ? (
//             <View className="flex-1 justify-center items-center">
//               <Text className="text-lg text-gray-500">No expenses yet! Add one</Text>
//               <Feather name="arrow-down-right" size={40} color="#2162DB" />
//             </View>
//           ) : (
//             <FlatList
//               data={expenses}
//               keyExtractor={(item) => item.id}
//               renderItem={({ item }) => (
//                 <View className="bg-blue-100 rounded-xl shadow-md p-3 mb-3 mx-2 flex-row items-center justify-between">

//                   {/* Category Icon (First letter of categoryName) */}
//                   <View className="w-12 h-12 bg-white rounded-md flex items-center justify-center">
//                     <Text className="text-lg font-bold">
//                       {item.categoryName.charAt(0).toUpperCase()}
//                     </Text>
//                   </View>

//                   {/* Expense Details (Description, Date, and Category) */}
//                   <View className="flex-1 ml-3">
//                     <Text className="text-lg font-medium text-gray-800">{item.categoryName}</Text>
//                     <Text className="text-sm text-gray-600">{formatDate(item.date)}</Text>
//                   </View>

//                   {/* Amount on the right side */}
//                   <Text className={`${item.type == 'INCOME' ? "text-green-500" : "text-red-500"} text-lg font-bold`}>
//                     {item.type == 'INCOME' ? "+" : "-"} ₹{item.amount}
//                   </Text>

//                 </View>
//               )}
//             />
//           )}
//         </View>

//         <View className="absolute bottom-20 right-5">
//           <AddButton color="#2162DB" size={65} onPress={handleAddPress} />
//         </View>
//       </SignedIn>
//     </SafeAreaView>
//   );
// };

// export default Expenses;

import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser, SignedIn } from '@clerk/clerk-expo';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-expo';
import AddButton from '@/components/AddButton';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

// Function to format the date
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
  date: string;
  description: string;
  type: 'EXPENSE' | 'INCOME';
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
        const response = await axios.get('https://expense-tracker-ldy5.onrender.com/v1/expenses/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Ensure the date field is in ISO format
        const formattedExpenses = response.data.expenses.map((expense: Expense) => ({
          ...expense,
          date: new Date(expense.date).toISOString(), // Convert to ISO format
        }));

        setExpenses(formattedExpenses);
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

  return (
    <SafeAreaView className="flex-1 p-1 bg-white">
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
                <View className="bg-blue-100 rounded-xl shadow-md p-3 mb-3 mx-2 flex-row items-center justify-between">
                  {/* Category Icon (First letter of categoryName) */}
                  <View className="w-12 h-12 bg-white rounded-md flex items-center justify-center">
                    <Text className="text-lg font-bold">
                      {item.categoryName.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  {/* Expense Details (Description, Date, and Category) */}
                  <View className="flex-1 ml-3">
                    <Text className="text-lg font-medium text-gray-800">{item.categoryName}</Text>
                    <Text className="text-sm text-gray-600">{formatDate(item.date)}</Text>
                  </View>

                  {/* Amount on the right side */}
                  <Text
                    className={`${
                      item.type === 'INCOME' ? 'text-green-500' : 'text-red-500'
                    } text-lg font-bold`}
                  >
                    {item.type === 'INCOME' ? '+' : '-'} ₹{item.amount}
                  </Text>
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
