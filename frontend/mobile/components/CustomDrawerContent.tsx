import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { user } = useUser();
  const { signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    router.replace('/(auth)/Login');
  };

  return (
    <DrawerContentScrollView {...props}>
      <View className="p-5 bg-gray-200">
        <Text className="text-lg font-bold">
          {`${user?.firstName || 'User'} ${user?.lastName || ''}`}
        </Text>
        <Text className="text-sm text-gray-500">
          {user?.emailAddresses[0]?.emailAddress || 'No email available'}
        </Text>
      </View>
      {/* <DrawerItemList {...props} /> */}
      <View className="p-5 flex justify-center items-center">
        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-blue-500 text-white font-bold w-40 h-10 py-2 px-4 rounded-full"
        >
          <Text className="text-white text-center">Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;
