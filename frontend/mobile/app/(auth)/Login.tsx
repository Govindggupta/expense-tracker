import { View, Text, Alert, TouchableOpacity } from 'react-native';
import React, { useCallback, useState } from 'react';
import CustomButton from '@/components/CustomButton';
import { Link, router } from 'expo-router';
import InputField from '@/components/InputField';
import { SafeAreaView } from 'react-native-safe-area-context';
import OAuth from '@/components/OAuth';
import { useSignIn } from '@clerk/clerk-expo';

const Signup = () => {
  const { signIn, setActive, isLoaded } = useSignIn();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/(root)/(tabs)/Expense');
      } else {
        console.log(JSON.stringify(signInAttempt, null, 2));
        Alert.alert('Error', 'Log in failed. Please try again.');
      }
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert('Error', err.errors[0].longMessage);
    }
  }, [isLoaded, form]);

  return (
    <SafeAreaView className="flex-1 justify-center bg-white px-6 py-4">
      <View className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
        <Text className="text-3xl font-bold text-center mb-6 text-gray-800">
          Login to Your Account
        </Text>
        <View className="space-y-4">
          <InputField
            label="Email"
            placeholder="Enter email"
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value: string) => setForm({ ...form, email: value })}
          />
          <InputField
            label="Password"
            placeholder="Enter password"
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value: string) => setForm({ ...form, password: value })}
          />
          <CustomButton
            title="Login"
            onPress={onSignInPress}
            className="bg-blue-600 text-white shadow-md"
          />

          <OAuth />

          <Link href="/Signup" className="text-center text-gray-500 mt-4">
            Don't have an Account? <Text className="text-blue-600 font-semibold">Sign Up</Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Signup;
