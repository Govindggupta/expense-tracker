import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddButton from '@/components/AddButton';
import { SignedIn, useAuth, useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { Entypo } from '@expo/vector-icons';
import axios from 'axios';

type Wallet = {
  id: string;
  name: string;
  balance: number;
};

const Wallet = () => {
  const [wallet, setWallet] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchWallets = async () => {
      if (!user) return;
      try {
        const clerkToken = await getToken();
        if (!clerkToken) {
          setError('Authentication failed. Please log in again.');
          return;
        }

        const response = await axios.get('http://192.168.29.74:8000/v1/wallet/', {
          headers: {
            Authorization: `Bearer ${clerkToken}`,
          },
        });

        setWallet(response.data.wallets);
      } catch (err) {
        setError('Failed to fetch expenses.');
        console.error('Error fetching expenses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWallets();
  }, [user]);

  const handleAddPress = () => {
    router.replace('/(root)/AddExpense');
  };

  return (
    <SafeAreaView className="h-full p-5 w-full">
      <SignedIn>
        <View className="w-full flex gap-3">
          <View className="WALLET w-full h-fit bg-gray-200 border border-black rounded-lg p-2 flex-row justify-between items-center px-4">
            <View>
              <Text className="text-xl">Cash</Text>
              <Text className="text-md">Balance: 100000000000</Text>
            </View>
            <Entypo size={20} name="dots-three-horizontal" />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#2162DB" />
          ) : error ? (
            <Text className="text-red-500">{error}</Text>
          ) : (
            <FlatList
              data={wallet}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View className="bg-white p-4 rounded-lg shadow-md mb-2 border border-gray-300">
                  <Text className="text-lg font-semibold">{item.name}</Text>
                  <Text className="text-md text-gray-600">Balance: ₹{item.balance}</Text>
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

export default Wallet;
