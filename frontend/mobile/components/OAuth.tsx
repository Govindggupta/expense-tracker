import { View, Text, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { googleOAuth } from '@/lib/cache';
import { useOAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';

const OAuth = () => {
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const handleGoogleSignIn = async () => {
    const result = await googleOAuth(startOAuthFlow);

    if (result.code === 'session_exists') {
      Alert.alert('Success', 'Session exists. Redirecting to home screen.');
      router.replace('/(root)/(tabs)/Home');
    }

    Alert.alert(result.success ? 'Success' : 'Error', result.message);
  };

  return (
    <View>
      <View className="flex flex-row justify-center items-center mt-4 gap-x-3 mb-4">
        <View className="flex-1 h-[1px] bg-gray-300" />
        <Text className="text-lg font-medium">Or</Text>
        <View className="flex-1 h-[1px] bg-gray-300" />
      </View>

      <View>
        <TouchableOpacity
          className="flex flex-row justify-center items-center p-3 bg-neutral-100 rounded-lg"
          onPress={handleGoogleSignIn}
        >
          <Ionicons name="logo-google" size={24} color="blue" style={{ marginRight: 8 }} />
          <Text className="text-lg text-blue-600 font-semibold">Continue with Google</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OAuth;
