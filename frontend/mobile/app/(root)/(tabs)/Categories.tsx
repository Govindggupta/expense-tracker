import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddButton from '@/components/AddButton';
import { router } from 'expo-router';
import { SignedIn, useAuth, useUser } from '@clerk/clerk-expo';
import axios from 'axios';

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
    <SafeAreaView className="flex-1 p-5 bg-white">
      <SignedIn>
        {loading ? (
          <ActivityIndicator size="large" color="#2162DB" className="flex-1 justify-center" />
        ) : error ? (
          <Text className="text-red-500 text-center">{error}</Text>
        ) : (
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}
            renderItem={({ item }) => (
              <View className="items-center mx-5 my-3">
                <View className="w-20 h-20 bg-gray-300 rounded-2xl flex items-center justify-center shadow-md">
                  <Text className="text-white text-lg font-semibold">{item.name[0]}</Text>
                </View>
                <Text className="mt-2 text-center text-gray-800 font-medium">{item.name}</Text>
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
