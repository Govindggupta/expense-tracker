import '../global.css';
import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

const Index = () => {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href="/(root)/(tabs)/Home" />;
  }

  return <Redirect href="/(auth)/Login" />;
};

export default Index;
