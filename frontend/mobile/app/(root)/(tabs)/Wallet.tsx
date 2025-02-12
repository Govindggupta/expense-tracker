import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddButton from '@/components/AddButton';
import { SignedIn, useAuth, useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { Entypo, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import ReactNativeModal from 'react-native-modal';
import { Portal } from 'react-native-paper';

type Wallet = {
  id: string;
  name: string;
  balance: number;
};

const Wallet = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [walletTitle, setWalletTitle] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const { user } = useUser();
  const { getToken } = useAuth();

  const handleEditWallet = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setWalletTitle(wallet.name);
    setInitialAmount(wallet.balance.toString());
    setModalVisible(true);
    setMenuVisible(null);
  };

  const handleCreateWallet = async () => {
    if (!user) return;

    if (!walletTitle.trim() || !initialAmount.trim()) {
      Alert.alert('Error', 'Please enter both wallet title and initial amount.');
      return;
    }

    setLoading(true);

    try {
      const clerkToken = await getToken();
      if (!clerkToken) {
        setError('Authentication failed. Please log in again.');
        return;
      }

      const response = await axios.post(
        'https://expense-tracker-ldy5.onrender.com/v1/wallet/',
        {
          user_id: user?.id,
          name: walletTitle,
          balance: parseFloat(initialAmount),
        },
        {
          headers: {
            Authorization: `Bearer ${clerkToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 201 || response.status === 200) {
        Alert.alert('Success', 'Wallet created successfully!');
        setWallets((prevWallets) => [...prevWallets, response.data.wallet]);
        setWalletTitle('');
        setInitialAmount('');
        setModalVisible(false);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to create wallet.');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Something went wrong. Please try again.',
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWallet = async () => {
    if (!selectedWallet) return;

    if (!walletTitle.trim() || !initialAmount.trim()) {
      Alert.alert('Error', 'Please enter wallet title and amount.');
      return;
    }

    try {
      const clerkToken = await getToken();
      if (!clerkToken) {
        setError('Authentication failed. Please log in again.');
        return;
      }

      const response = await axios.put(
        `https://expense-tracker-ldy5.onrender.com/v1/wallet/${selectedWallet.id}`,
        {
          name: walletTitle,
          balance: parseFloat(initialAmount),
        },
        {
          headers: {
            Authorization: `Bearer ${clerkToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 200) {
        Alert.alert('Success', 'Wallet updated successfully!');
        setWallets((prevWallets) =>
          prevWallets.map((wallet) =>
            wallet.id === selectedWallet.id
              ? { ...wallet, name: walletTitle, balance: parseFloat(initialAmount) }
              : wallet,
          ),
        );
        setModalVisible(false);
        setSelectedWallet(null);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update wallet.');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Something went wrong. Please try again.',
      );
      console.error(error);
    }
  };

  const toggleMenu = (walletId: string, event: any) => {
    event.target.measure(
      (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        setMenuPosition({ x: pageX, y: pageY });
        setMenuVisible(menuVisible === walletId ? null : walletId);
      },
    );
  };

  const confirmDeleteWallet = (walletId: string) => {
    Alert.alert(
      'Delete Wallet',
      'Are you sure you want to delete this wallet? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteWallet(walletId) },
      ],
    );
  };

  const handleDeleteWallet = async (walletId: string) => {
    try {
      const clerkToken = await getToken();
      if (!clerkToken) {
        setError('Authentication failed. Please log in again.');
        return;
      }

      const response = await axios.delete(
        `https://expense-tracker-ldy5.onrender.com/v1/wallet/${walletId}`,
        {
          headers: {
            Authorization: `Bearer ${clerkToken}`,
          },
        },
      );

      if (response.status === 200) {
        Alert.alert('Success', 'Wallet deleted successfully!');

        // Remove the deleted wallet from state
        setWallets((prevWallets) => prevWallets.filter((wallet) => wallet.id !== walletId));

        setMenuVisible(null);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to delete wallet.');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Something went wrong. Please try again.',
      );
      console.error(error);
    }
  };

  // Fetch Wallets
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

        setWallets(response.data.wallets);
      } catch (err) {
        setError('Failed to fetch wallets.');
        console.error('Error fetching wallets:', err);
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
    <TouchableWithoutFeedback onPress={() => setMenuVisible(null)}>
      <SafeAreaView className="h-full p-5 w-full">
        <SignedIn>
          <View className="w-full flex gap-3 overflow-visible">
            {loading ? (
              <ActivityIndicator size="large" color="#2162DB" />
            ) : error ? (
              <Text className="text-red-500">{error}</Text>
            ) : (
              <FlatList
                data={wallets}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View className="bg-blue-100 p-4 rounded-lg shadow-md mb-3 border border-blue-400 flex-row items-center justify-between">
                    <View className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Text className="text-md font-bold">{item.name[0]}</Text>
                    </View>
                    <View className="flex-1 ml-4">
                      <Text className="text-xl font-semibold text-gray-900">{item.name}</Text>
                      <Text className={'text-lg text-gray-600'}>
                        Balance:{' '}
                        <Text
                          className={`${
                            item.balance < 0 ? 'text-red-500' : 'text-green-500'
                          } font-bold`}
                        >
                          ₹{item.balance}
                        </Text>
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={(event) => toggleMenu(item.id, event)}
                      className="p-1 relative"
                    >
                      <Entypo size={20} name="dots-three-horizontal" color={'#0E3789'} />
                    </TouchableOpacity>

                    {menuVisible === item.id && (
                      <Portal>
                        <View
                          style={{
                            position: 'absolute',
                            top: menuPosition.y + 30,
                            left: menuPosition.x - 100,
                            backgroundColor: 'white',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.8,
                            shadowRadius: 2,
                            elevation: 5,
                            padding: 10,
                            borderRadius: 5,
                            zIndex: 1000,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => handleEditWallet(item)}
                            className="py-2 px-4"
                          >
                            <Text className="text-gray-900">Edit Wallet</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => confirmDeleteWallet(item.id)}
                            className="py-2 px-4"
                          >
                            <Text className="text-red-500">Delete Wallet</Text>
                          </TouchableOpacity>
                        </View>
                      </Portal>
                    )}
                  </View>
                )}
              />
            )}
          </View>

          <View className="flex items-center">
            <TouchableOpacity
              onPress={() => {
                setModalVisible(true);
                setSelectedWallet(null);
                setWalletTitle('');
                setInitialAmount('');
              }}
              className="flex flex-row items-center gap-2 justify-center w-1/2 py-2 px-4 rounded-lg border-2 border-blue-400 bg-white shadow-md"
            >
              <Ionicons name="add-circle-outline" size={22} color={'#0E3789'} />
              <Text className="text-blue-900 font-semibold text-base">Add New Wallet</Text>
            </TouchableOpacity>
          </View>

          <ReactNativeModal
            isVisible={isModalVisible}
            onBackdropPress={() => setModalVisible(false)}
            swipeDirection="down"
            animationIn="slideInUp"
            animationOut="slideOutDown"
            backdropOpacity={0.5}
            style={{ justifyContent: 'center', alignItems: 'center' }}
          >
            <View className="bg-white p-6 rounded-2xl w-4/5">
              <Text className="text-lg font-semibold text-center mb-4">
                {selectedWallet ? 'Edit Wallet' : 'Add a New Wallet'}
              </Text>

              <TextInput
                placeholder="Wallet Title"
                placeholderTextColor="#888"
                value={walletTitle}
                onChangeText={setWalletTitle}
                className="w-full p-3 mb-4 border rounded-lg border-gray-300"
              />

              <TextInput
                placeholder="Initial Amount"
                placeholderTextColor="#888"
                value={initialAmount}
                onChangeText={setInitialAmount}
                keyboardType="numeric"
                className="w-full p-3 mb-4 border rounded-lg border-gray-300"
              />

              <TouchableOpacity
                onPress={selectedWallet ? handleUpdateWallet : handleCreateWallet}
                className="w-full py-3 rounded-lg bg-blue-500 mb-2"
              >
                <Text className="text-white text-center font-semibold">
                  {selectedWallet ? 'Update Wallet' : 'Create Wallet'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="w-full py-3 rounded-lg bg-gray-300"
              >
                <Text className="text-center font-semibold text-gray-700">Cancel</Text>
              </TouchableOpacity>
            </View>
          </ReactNativeModal>

          <View className="absolute bottom-20 right-5">
            <AddButton color="#2162DB" size={65} onPress={handleAddPress} />
          </View>
        </SignedIn>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default Wallet;
