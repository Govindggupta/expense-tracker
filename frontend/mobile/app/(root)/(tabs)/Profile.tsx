import { SignedIn, useAuth, useUser } from '@clerk/clerk-expo';
import { Text, Button, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AddButton from '@/components/AddButton';

export default function Profile() {
  const { user } = useUser();
  const { signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    router.replace('/(auth)/Login');
  };

  const handleAddPress = () => {
    router.replace('/(root)/AddExpense');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center p-5">
      <SignedIn>
        <View className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg">
          <Text className="text-2xl font-semibold text-center text-gray-700 mb-4">Welcome!</Text>
          <Text className="text-lg text-gray-600 text-center mb-6">
            Hello {user?.firstName || user?.emailAddresses[0].emailAddress}
          </Text>
          <Button title="Logout" onPress={handleSignOut} />
        </View>

        <View className="absolute bottom-5 right-5">
          <AddButton color="blue" size={65} onPress={handleAddPress} />
        </View>
      </SignedIn>
    </SafeAreaView>
  );
}
