import { View, Text, Alert } from 'react-native';
import React, { useState } from 'react';
import CustomButton from '@/components/CustomButton';
import { Link, router } from 'expo-router';
import InputField from '@/components/InputField';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign } from '@expo/vector-icons';
import OAuth from '@/components/OAuth';
import { useSignUp } from '@clerk/clerk-expo';
import { ReactNativeModal } from 'react-native-modal';
import { fetchAPI } from '@/lib/fetch';

const Signup = () => {
  const { isLoaded, signUp, setActive } = useSignUp();

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [verification, setVerification] = useState({
    state: 'default',
    error: '',
    code: '',
  });

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      setVerification({
        ...verification,
        state: 'pending',
      });
    } catch (err: any) {
      Alert.alert('Error: ', err.errors[0].longMessage);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });

      if (signUpAttempt.status === 'complete') {
        // connect to db
        await fetchAPI('/(api)/user', {
          method: 'POST',
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            clerkId: signUpAttempt.createdUserId,
          }),
        });

        await setActive({ session: signUpAttempt.createdSessionId });
        setVerification({
          ...verification,
          state: 'success',
        });
      } else {
        setVerification({
          ...verification,
          error: 'Verification failed.',
          state: 'failed',
        });
      }
    } catch (err: any) {
      setVerification({
        ...verification,
        error: err.errors[0].longMessage,
        state: 'failed',
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white justify-center items-center px-6">
      <View className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
        <Text className="text-3xl font-bold text-center text-gray-900 mb-6">
          Create Your Account
        </Text>

        <View className="space-y-4">
          <InputField
            label="Name"
            placeholder="Enter name"
            value={form.name}
            onChangeText={(value: string) => setForm({ ...form, name: value })}
          />
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
            title="Sign Up"
            onPress={onSignUpPress}
            className="bg-blue-600 text-white shadow-md"
          />

          <OAuth />

          <Link href="/Login" className="text-center text-gray-500 mt-4">
            Already have an account? <Text className="text-blue-600 font-semibold">Log In</Text>
          </Link>
        </View>
      </View>

      <ReactNativeModal
        isVisible={verification.state === 'pending'}
        onBackdropPress={() => setVerification({ ...verification, state: 'default' })}
        onModalHide={() => {
          if (verification.state === 'success') {
            setShowSuccessModal(true);
          }
        }}
      >
        <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px] items-center">
          <Text className="font-bold text-2xl text-gray-900 mb-2">Verification</Text>
          <Text className="text-gray-600 text-center mb-5">
            We've sent a verification code to {form.email}.
          </Text>

          <InputField
            label="Code"
            placeholder="12345"
            value={verification.code}
            keyboardType="numeric"
            onChangeText={(code: any) => setVerification({ ...verification, code })}
          />
          {verification.error && (
            <Text className="text-red-500 text-sm mt-1">{verification.error}</Text>
          )}

          <CustomButton
            title="Verify Email"
            onPress={onVerifyPress}
            className="bg-green-500 text-white text-lg p-2 rounded-full"
          />
        </View>
      </ReactNativeModal>

      <ReactNativeModal isVisible={showSuccessModal}>
        <View className="bg-white px-7 py-9 rounded-2xl min-h-[250px] items-center">
          <AntDesign name="checkcircleo" size={50} color="green" />
          <Text className="text-3xl font-bold text-gray-900 text-center mt-4">Verified</Text>
          <Text className="text-base text-gray-500 text-center mt-2 mb-5">
            You have successfully verified your account.
          </Text>

          <CustomButton
            title="Browse Home"
            onPress={() => {
              router.push(`/(root)/(tabs)/Home`);
              setShowSuccessModal(false);
            }}
            className="bg-blue-600 text-white text-lg p-2"
          />
        </View>
      </ReactNativeModal>
    </SafeAreaView>
  );
};

export default Signup;
