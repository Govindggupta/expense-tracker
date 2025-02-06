import React, { useState } from 'react';
import { TextInput, Button, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser, SignedIn } from '@clerk/clerk-expo';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-expo';

const ExpenseScreen = () => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [error, setError] = useState('');

  // Handle form submission
  const handleSubmit = async () => {
    if (!amount || !description) {
      setError('Amount and description are required.');
      return;
    }

    try {
      const clerkToken = await getToken();

      if (!clerkToken) {
        console.error('No Clerk token found!');
        setError('Authentication failed. Please log in again.');
        return;
      }

      console.log('✅ Clerk Token:', clerkToken);

      const response = await axios.post(
        'http://192.168.29.74:8000/v1/expenses/',
        {
          userId: user?.id,
          amount,
          description,
          attachmentUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${clerkToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // Handle successful response (e.g., clear the form, show success message)
      setAmount('');
      setDescription('');
      setAttachmentUrl('');
      setError(''); // Clear error
      console.log('Expense created successfully:', response.data);
    } catch (error) {
      console.error('Error creating expense:', error);
      setError('Failed to create expense.');
    }
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center p-5">
        <Text>Please log in to access this page.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 justify-center items-center p-5">
      <SignedIn>
        <View className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
          <Text className="text-2xl font-semibold text-center mb-4">Create Expense</Text>

          {error && <Text className="text-red-500 text-center mb-4">{error}</Text>}

          <TextInput
            style={{ marginBottom: 10, padding: 8, borderWidth: 1, borderRadius: 5 }}
            placeholder="Amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <TextInput
            style={{ marginBottom: 10, padding: 8, borderWidth: 1, borderRadius: 5 }}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
          />

          <TextInput
            style={{ marginBottom: 20, padding: 8, borderWidth: 1, borderRadius: 5 }}
            placeholder="Attachment URL"
            value={attachmentUrl}
            onChangeText={setAttachmentUrl}
          />

          <Button title="Submit" onPress={handleSubmit} />
        </View>
      </SignedIn>
    </SafeAreaView>
  );
};

export default ExpenseScreen;
