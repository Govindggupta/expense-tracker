import { View, Text, Alert } from 'react-native';
import React, { useCallback, useState } from 'react';
import CustomButton from '@/components/CustomButton';
import { Link, router } from 'expo-router';
import InputField from '@/components/InputField';
import { SafeAreaView } from 'react-native-safe-area-context';
import OAuth from '@/components/OAuth';
import { useSignIn } from '@clerk/clerk-expo';

const Login = () => {
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
        router.replace('/(root)/(tabs)/Expenses');
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
    <SafeAreaView className="flex-1 relative justify-center items-center">
      <View className="absolute top-0 w-full h-80 bg-[#2A7C76] rounded-b-[15%]" />
      <View className="flex-1 w-full px-10 py-4 justify-center items-center">
        <Text className="text-4xl font-bold text-white mb-8">Login to your Account</Text>

        <View className="w-full max-w-md bg-white shadow-2xl shadow-gray-500 rounded-2xl p-8">
          <View className="space-y-6">
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
              className="bg-[#2A7C76] text-white shadow-md"
            />

            <OAuth />

            <Link href="/Signup" className="text-center text-gray-500 mt-4">
              Don't have an Account? <Text className="text-[#2A7C76] font-semibold">Sign Up</Text>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Login;
