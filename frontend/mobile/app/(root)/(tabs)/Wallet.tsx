import { View, Text } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddButton from '@/components/AddButton';
import { SignedIn } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { Entypo } from '@expo/vector-icons';

const Wallet = () => {
  const handleAddPress = () => {
    router.replace('/(root)/AddExpense');
  };

  return (
    <SafeAreaView className="h-full p-5 w-full">
      <SignedIn>
        <View className="w-full flex gap-3">
          {/* <Text className="text-xl text-center">Wallet</Text> */}
          
          <View className='WALLET w-full h-fit bg-gray-200 border border-black rounded-lg p-2 flex-row justify-between items-center px-4'>
            <View >
              <Text className='text-xl'>Cash</Text>
              <Text className='text-md'>Balance : 100000000000</Text>
            </View>
            <Entypo size={20} name='dots-three-horizontal' />
          </View>
        </View>
        <View className="absolute bottom-20 right-5">
          <AddButton color="#2162DB" size={65} onPress={handleAddPress} />
        </View>
      </SignedIn>
    </SafeAreaView>
  );
};

export default Wallet;
