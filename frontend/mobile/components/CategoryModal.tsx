import { SignedIn, useAuth, useUser } from '@clerk/clerk-expo';
import React, { useEffect, useState } from 'react';
import ReactNativeModal from 'react-native-modal';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

interface CategoryModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectCategory: (wallet: { id: string; name: string }) => void;
  selectedOption: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isVisible,
  onClose,
  onSelectCategory,
  selectedOption,
}) => {
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

        const response = await axios.get('https://expense-tracker-ldy5.onrender.com/v1/category/', {
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

  const filteredCategories = categories.filter((category) =>
    selectedOption === 'Income' ? category.type === 'INCOME' : category.type === 'EXPENSE',
  );

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
          {loading ? (
            <ActivityIndicator size="large" color="#2162DB" className="flex-1 justify-center" />
          ) : error ? (
            <Text className="text-red-500 text-center">{error}</Text>
          ) : (
            <FlatList
              data={filteredCategories}
              numColumns={3}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="w-24 h-24 rounded-lg flex items-center justify-center m-2 mb-5 mt-4"
                  onPress={() => {
                    onSelectCategory({ id: item.id, name: item.name[0] });
                    onClose();
                  }}
                >
                  <View className="w-20 h-20 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Text className="text-lg font-bold text-gray-900">{item.name[0]}</Text>
                  </View>
                  <Text className="text-sm text-gray-600 mt-2 text-center">{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </SignedIn>
      </SafeAreaView>
    </ReactNativeModal>
  );
};

export default CategoryModal;
