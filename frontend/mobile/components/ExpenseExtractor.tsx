import React from 'react';
import { Text, View } from 'react-native';

interface Props {
  extractedText: string;
}

const extractDetails = (text: string) => {
  const amountMatch = text.match(/(?:₹|INR)?\s?(\d+\.\d{1,2}|\d{2,5})\s?(?:INR|₹)?/g);
  const categoryMatch = text.match(
    /(groceries|food|travel|rent|shopping|fuel|entertainment|shop)/i,
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
  const details = extractDetails(extractedText);

  return (
    <View className="p-5 bg-[#f8f9fa] rounded-md mt-5 w-4/5">
      <Text>Amount: ₹{details.amount}</Text>
      <Text>Category: {details.category}</Text>
      <Text>Wallet: {details.wallet}</Text>
      <Text>Date: {details.date}</Text>
    </View>
  );
};

export default ExpenseExtractor;
