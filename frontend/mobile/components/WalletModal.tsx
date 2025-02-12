import { SignedIn, useAuth, useUser } from '@clerk/clerk-expo';
import React, { useEffect, useState } from 'react';
import ReactNativeModal from 'react-native-modal';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

interface WalletModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectWallet: (wallet: { id: string; name: string }) => void;
}

type Wallet = {
  id: string;
  name: string;
  balance: number;
};

const WalletModal: React.FC<WalletModalProps> = ({ isVisible, onClose, onSelectWallet }) => {
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

        const response = await axios.get('https://expense-tracker-ldy5.onrender.com/v1/wallet/', {
          headers: {
            Authorization: `Bearer ${clerkToken}`,
          },
        });

        setWallet(response.data.wallets);
      } catch (err) {
        setError('Failed to fetch wallets.');
      } finally {
        setLoading(false);
      }
    };

    if (isVisible) {
      fetchWallets();
    }
  }, [user, isVisible]);

  const handleWalletSelect = (item: Wallet) => {
    onSelectWallet({ id: item.id, name: item.name });
    onClose();
  };

  return (
    <ReactNativeModal
      isVisible={isVisible}
      onBackdropPress={onClose}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      style={{ justifyContent: 'center', alignItems: 'center' }}
    >
      <SafeAreaView className="w-11/12 h-1/2 bg-white rounded-xl p-4 shadow-lg">
        <SignedIn>
          <View className="flex-1 justify-center">
            {loading ? (
              <ActivityIndicator size="large" color="#2162DB" />
            ) : error ? (
              <Text className="text-red-500">{error}</Text>
            ) : (
              <FlatList
                data={wallet}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="bg-blue-100 p-4 rounded-lg shadow-md mb-3 border border-blue-400 flex-row items-center justify-between"
                    onPress={() => handleWalletSelect(item)}
                  >
                    <View className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Text className="text-md font-bold">{item.name[0]}</Text>
                    </View>
                    <View className="flex-1 ml-4">
                      <Text className="text-xl font-semibold text-gray-900">{item.name}</Text>
                      <Text className="text-lg text-gray-600">
                        Balance: <Text className="text-green-500 font-bold">₹{item.balance}</Text>
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </SignedIn>
      </SafeAreaView>
    </ReactNativeModal>
  );
};

export default WalletModal;
