import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
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

  const handleWallet = () => {
    // code
  };

  const handleAddPress = () => {
    router.replace('/(root)/AddExpense');
  };

  return (
    <SafeAreaView className="h-full p-5 w-full">
      <SignedIn>
        <View className="w-full flex gap-3">
          {loading ? (
            <ActivityIndicator size="large" color="#2162DB" />
          ) : error ? (
            <Text className="text-red-500">{error}</Text>
          ) : (
            <FlatList
              data={wallet}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View className="bg-blue-100 p-4 rounded-lg shadow-md mb-3 border border-blue-400 flex-row items-center justify-between">
                  <View className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Text className="text-md font-bold">Img</Text>
                  </View>
                  <View className="flex-1 ml-4">
                    <Text className="text-xl font-semibold text-gray-900">{item.name}</Text>
                    <Text className={"text-lg text-gray-600"}>
                      Balance: <Text className={`${item.balance < 0 ? "text-red-500" : "text-green-500"} font-bold`}>
                        ₹{item.balance}
                      </Text>
                    </Text>

                  </View>
                  <TouchableOpacity onPress={handleWallet} className="p-1">
                    <Entypo size={20} name="dots-three-horizontal" color={'#0E3789'} />
                  </TouchableOpacity>
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
