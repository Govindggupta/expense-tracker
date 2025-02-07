import { View, Text } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddButton from '@/components/AddButton';
import { SignedIn } from '@clerk/clerk-expo';
import { router } from 'expo-router';

const Split = () => {
  const handleAddPress = () => {
    router.replace('/(root)/AddExpense');
  };

  return (
    <SafeAreaView className="flex-1 justify-center items-center p-5">
      <SignedIn>
        <View className="w-full max-w-md flex-1 justify-center items-center">
          <Text className="text-xl text-center">Split</Text>
        </View>
        <View className="absolute bottom-20 right-5">
          <AddButton color="#2162DB" size={65} onPress={handleAddPress} />
        </View>
      </SignedIn>
    </SafeAreaView>
  );
};

export default Split;
