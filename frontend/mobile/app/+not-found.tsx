import { View, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Text className="text-2xl font-bold text-gray-800 dark:text-gray-200">
        404 - Page Not Found
      </Text>
      <Text className="text-gray-600 dark:text-gray-400 mt-2 text-center px-6">
        The page you are looking for does not exist or has been moved.
      </Text>
      <Button
        mode="contained"
        onPress={() => router.replace('/(auth)/Login')}
        className="mt-6 bg-blue-600 dark:bg-blue-400"
      >
        Go Home
      </Button>
    </View>
  );
}
