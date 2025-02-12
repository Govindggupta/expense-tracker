import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddButton from '@/components/AddButton';
import { router } from 'expo-router';
import { SignedIn, useAuth, useUser } from '@clerk/clerk-expo';
import axios from 'axios';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { TextInput } from 'react-native-paper';
import ReactNativeModal from 'react-native-modal';
import { Portal } from 'react-native-paper';
import { ReloadContext } from '@/context/ReloadContext';
import { RefreshControl } from 'react-native-gesture-handler';

interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [categoryTitle, setCategoryTitle] = useState('');
  const [categoryType, setCategoryType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const { reload, triggerReload } = useContext(ReloadContext);

  const { user } = useUser();
  const { getToken } = useAuth();

  const handleCreateCategory = async () => {
    if (!user) return;

    if (!categoryTitle.trim()) {
      Alert.alert('Error', 'Please enter category title.');
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
        'https://expense-tracker-ldy5.onrender.com/v1/category/',
        {
          userId: user?.id,
          name: categoryTitle,
          type: categoryType,
        },
        {
          headers: {
            Authorization: `Bearer ${clerkToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 201 || response.status === 200) {
        Alert.alert('Success', 'Category created successfully!');
        setCategories((prevCategories) => [...prevCategories, response.data.category]);
        setCategoryTitle('');
        setCategoryType('EXPENSE');
        setModalVisible(false);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to create category.');
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

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;

    if (!categoryTitle.trim()) {
      Alert.alert('Error', 'Please enter category title.');
      return;
    }

    try {
      const clerkToken = await getToken();
      if (!clerkToken) {
        setError('Authentication failed. Please log in again.');
        return;
      }

      const response = await axios.put(
        `https://expense-tracker-ldy5.onrender.com/v1/category/${selectedCategory.id}`,
        {
          name: categoryTitle,
          type: categoryType,
        },
        {
          headers: {
            Authorization: `Bearer ${clerkToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 200) {
        Alert.alert('Success', 'Category updated successfully!');
        setCategories((prevCategories) =>
          prevCategories.map((cat) =>
            cat.id === selectedCategory.id
              ? { ...cat, name: categoryTitle, type: categoryType }
              : cat,
          ),
        );
        setModalVisible(false);
        setSelectedCategory(null);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update category.');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Something went wrong. Please try again.',
      );
    }
  };

  const confirmDeleteCategory = (categoryId: string) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteCategory(categoryId) },
      ],
    );
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const clerkToken = await getToken();
      if (!clerkToken) {
        setError('Authentication failed. Please log in again.');
        return;
      }

      const response = await axios.delete(
        `https://expense-tracker-ldy5.onrender.com/v1/category/${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${clerkToken}`,
          },
        },
      );

      if (response.status === 200) {
        Alert.alert('Success', 'Category deleted successfully!');
        setCategories((prevCategories) => prevCategories.filter((cat) => cat.id !== categoryId));
        setMenuVisible(null);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to delete category.');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Something went wrong. Please try again.',
      );
      console.error(error);
    }
  };

  const toggleMenu = (categoryId: string, event: any) => {
    event.target.measure(
      (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        setMenuPosition({ x: pageX, y: pageY });
        setMenuVisible(menuVisible === categoryId ? null : categoryId);
      },
    );
  };

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
  }, [user, reload]);

  const handleAddPress = () => {
    router.replace('/(root)/AddExpense');
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <View className="bg-blue-100 p-2 rounded-lg shadow-md mb-3 border border-blue-400 flex-row items-center justify-between w-full">
      <View className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
        <Text className="text-lg font-semibold">{item.name[0]}</Text>
      </View>
      <View className="flex-1 ml-4">
        <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
      </View>
      <TouchableOpacity onPress={(event) => toggleMenu(item.id, event)} className="p-1 relative">
        <Entypo size={20} name="dots-three-horizontal" color={'#0E3789'} />
      </TouchableOpacity>

      {menuVisible === item.id && (
        <Portal>
          <View
            style={{
              position: 'absolute',
              top: menuPosition.y + 30,
              left: menuPosition.x - 125,
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
              onPress={() => {
                setSelectedCategory(item);
                setCategoryTitle(item.name);
                setCategoryType(item.type);
                setModalVisible(true);
                setMenuVisible(null);
              }}
              className="py-2 px-4"
            >
              <Text className="text-gray-900">Edit Category</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => confirmDeleteCategory(item.id)} className="py-2 px-4">
              <Text className="text-red-500">Delete Category</Text>
            </TouchableOpacity>
          </View>
        </Portal>
      )}
    </View>
  );

  const incomeCategories = categories.filter((cat) => cat.type === 'INCOME');
  const expenseCategories = categories.filter((cat) => cat.type === 'EXPENSE');

  return (
    <TouchableWithoutFeedback onPress={() => setMenuVisible(null)}>
      <SafeAreaView className="flex-1 bg-gray-100">
        <SignedIn>
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>
            {loading ? (
              <ActivityIndicator size="large" color="#2162DB" className="my-5" />
            ) : error ? (
              <Text className="text-red-500 text-center mb-4">{error}</Text>
            ) : (
              <>
                {incomeCategories.length > 0 && (
                  <>
                    <Text className="text-xl font-bold text-gray-900 mb-3">Income</Text>
                    <FlatList
                      refreshControl={
                        <RefreshControl refreshing={reload} onRefresh={triggerReload} />
                      }
                      data={incomeCategories}
                      keyExtractor={(item) => item.id}
                      renderItem={renderCategoryItem}
                      scrollEnabled={false}
                    />
                  </>
                )}
                {expenseCategories.length > 0 && (
                  <>
                    <Text className="text-xl font-bold text-gray-900 mt-5 mb-3">Expense</Text>
                    <FlatList
                      data={expenseCategories}
                      keyExtractor={(item) => item.id}
                      renderItem={renderCategoryItem}
                      scrollEnabled={false}
                    />
                  </>
                )}
              </>
            )}

            <View className="items-center mt-5">
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(true);
                  setSelectedCategory(null);
                  setCategoryTitle('');
                  setCategoryType('EXPENSE');
                }}
                className="flex flex-row items-center gap-2 justify-center w-1/2 py-2 px-4 rounded-lg border-2 border-blue-400 bg-white shadow-md"
              >
                <Ionicons name="add-circle-outline" size={22} color={'#0E3789'} />
                <Text className="text-blue-900 font-semibold text-base">Add New Category</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

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
              <View className="flex flex-row justify-around mb-4">
                <TouchableOpacity
                  onPress={() => setCategoryType('EXPENSE')}
                  className={`py-2 px-4 rounded-lg ${
                    categoryType === 'EXPENSE' ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <Text
                    className={
                      categoryType === 'EXPENSE' ? 'text-white font-semibold' : 'text-gray-700'
                    }
                  >
                    Expense
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setCategoryType('INCOME')}
                  className={`py-2 px-4 rounded-lg ${
                    categoryType === 'INCOME' ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <Text
                    className={
                      categoryType === 'INCOME' ? 'text-white font-semibold' : 'text-gray-700'
                    }
                  >
                    Income
                  </Text>
                </TouchableOpacity>
              </View>

              <Text className="text-lg font-semibold text-center mb-4">
                {selectedCategory ? 'Edit Category' : 'Add a New Category'}
              </Text>
              <TextInput
                placeholder="Category Title"
                placeholderTextColor="#888"
                value={categoryTitle}
                onChangeText={setCategoryTitle}
                className="w-full p-3 mb-4 border rounded-lg border-gray-300"
              />
              <TouchableOpacity
                onPress={selectedCategory ? handleUpdateCategory : handleCreateCategory}
                className="w-full py-3 rounded-lg bg-blue-500 mb-2"
              >
                <Text className="text-white text-center font-semibold">
                  {selectedCategory ? 'Update Category' : 'Create Category'}
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

export default Categories;
