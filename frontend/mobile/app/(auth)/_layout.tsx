import { Stack } from 'expo-router';

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="Signup" options={{ headerShown: false }} />
      <Stack.Screen name="Login" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;
