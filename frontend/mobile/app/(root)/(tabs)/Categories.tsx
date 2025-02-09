import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddButton from '@/components/AddButton';
import { router } from 'expo-router';
import { SignedIn, useAuth, useUser } from '@clerk/clerk-expo';
import axios from 'axios';
import { Entypo } from '@expo/vector-icons';

interface Category {
  id: string;
  name: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      if (!user) return;
      try {
        const clerkToken = await getToken();
        if (!clerkToken) {
          setError('Authentication failed. Please log in again.');
          return;
        }

        const response = await axios.get('http://192.168.29.74:8000/v1/category/', {
          headers: {
            Authorization: `Bearer ${clerkToken}`,
          },
        });

        setCategories(response.data.categories);
      } catch (err) {
        setError('Failed to fetch categories.');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [user]);

  const handleAddPress = () => {
    router.replace('/(root)/AddExpense');
  };

  return (
    <SafeAreaView className="flex-1 p-5 bg-gray-100">
      <SignedIn>
        {loading ? (
          <ActivityIndicator size="large" color="#2162DB" className="flex-1 justify-center" />
        ) : error ? (
          <Text className="text-red-500 text-center">{error}</Text>
        ) : (
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="bg-blue-100 p-2 rounded-lg shadow-md mb-3 border border-blue-400 flex-row items-center justify-between w-full">
                <View className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Text className="text-lg font-semibold">{item.name[0]}</Text>
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-xl font-semibold text-gray-900">{item.name}</Text>
                </View>
                <TouchableOpacity className="p-1">
                  <Entypo size={20} name="dots-three-horizontal" color={'#0E3789'} />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
        <View className="absolute bottom-20 right-5">
          <AddButton color="#2162DB" size={65} onPress={handleAddPress} />
        </View>
      </SignedIn>
    </SafeAreaView>
  );
};

export default Categories;
