// import React from 'react';
// import { Text, View } from 'react-native';

// interface Props {
//   extractedText: string;
// }

// const extractDetails = (text: string) => {
//   const amountMatch = text.match(/(?:₹|INR)?\s?(\d+\.\d{1,2}|\d{2,5})\s?(?:INR|₹)?/g);
//   const categoryMatch = text.match(
//     /(groceries|food|travel|rent|shopping|fuel|entertainment|shop)/i,
//   );
//   const walletMatch = text.match(/(cash|card|UPI)/i);

//   const datePatterns = [
//     /\b(\d{2}[-\/]\d{2}[-\/]\d{4})\b/,
//     /\b(\d{2}[-\/]\d{2}[-\/]\d{2})\b/,
//     /\b(\d{4}[-\/]\d{2}[-\/]\d{2})\b/,
//   ];

//   let foundDate: string | null = null;
//   for (const pattern of datePatterns) {
//     const match = text.match(pattern);
//     if (match) {
//       foundDate = match[1];
//       break;
//     }
//   }

//   const currentDate = new Date().toISOString().split('T')[0];
//   const amount = amountMatch ? amountMatch[amountMatch.length - 1] : 'Unknown';

//   return {
//     amount,
//     category: categoryMatch ? categoryMatch[1] : 'Other',
//     wallet: walletMatch ? walletMatch[1] : 'Cash',
//     date: foundDate || currentDate,
//   };
// };

// const ExpenseExtractor: React.FC<Props> = ({ extractedText }) => {
//   const details = extractDetails(extractedText);

//   return (
//     <View className="p-5 bg-[#f8f9fa] rounded-md mt-5 w-4/5">
//       <Text>Amount: ₹{details.amount}</Text>
//       <Text>Category: {details.category}</Text>
//       <Text>Wallet: {details.wallet}</Text>
//       <Text>Date: {details.date}</Text>
//     </View>
//   );
// };

// export default ExpenseExtractor;

import 'react-native-get-random-values';
import React from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { useAuth, useUser } from '@clerk/clerk-expo';

interface Props {
  extractedText: string;
}

const Scan = (text: string) => {
  const amountMatch = text.match(/(?:₹|INR)?\s?(\d+\.\d{1,2}|\d{2,5})\s?(?:INR|₹)?/g);
  const categoryMatch = text.match(
    /(groceries|shopping|fuel|shop)/i,
  );
  const walletMatch = text.match(/(cash|card|UPI)/i);

  const datePatterns = [
    /\b(\d{2}[-\/]\d{2}[-\/]\d{4})\b/,
    /\b(\d{2}[-\/]\d{2}[-\/]\d{2})\b/,
    /\b(\d{4}[-\/]\d{2}[-\/]\d{2})\b/,
  ];

  let foundDate: string | null = null;
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      foundDate = match[1];
      break;
    }
  }

  const currentDate = new Date().toISOString().split('T')[0];
  const amount = amountMatch ? amountMatch[amountMatch.length - 1] : 'Unknown';

  return {
    amount,
    category: categoryMatch ? categoryMatch[1] : 'Other',
    wallet: walletMatch ? walletMatch[1] : 'Cash',
    date: foundDate || currentDate,
  };
};

const ExpenseExtractor: React.FC<Props> = ({ extractedText }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { user } = useUser();
  const { getToken } = useAuth();

  const details = extractedText
    ? Scan(extractedText)
    : {
        amount: 'Unknown',
        category: 'Other',
        wallet: 'Cash',
        date: new Date().toISOString().split('T')[0],
      };

  const saveExpense = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();

      const categoryId = uuidv4();
      const walletId = uuidv4();

      const expenseData = {
        user_id: user?.id,
        amount: parseFloat(details.amount),
        date: details.date,
        description: `Expense for ${details.category}`,
        type: 'EXPENSE',
        categoryId,
        walletId,
      };

      const response = await axios.post('http://192.168.0.111:8000/v1/expenses/ocr', expenseData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        console.log('Expense saved successfully:', response.data);
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      setError('Failed to save expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (extractedText) {
      saveExpense();
    }
  }, [extractedText]);

  return (
    <View className="p-5 bg-[#f8f9fa] rounded-md mt-5 w-4/5">
      {loading ? (
        <ActivityIndicator size="large" color="#2A7C76" />
      ) : error ? (
        <Text className="text-red-500">{error}</Text>
      ) : (
        <>
          <Text>Amount: ₹{details.amount}</Text>
          <Text>Category: {details.category}</Text>
          <Text>Wallet: {details.wallet}</Text>
          <Text>Date: {details.date}</Text>
        </>
      )}
    </View>
  );
};

export default ExpenseExtractor;
