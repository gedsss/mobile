import { Redirect } from 'expo-router';

import { useAuth } from '@/auth/auth-context';
import { useOnboarding } from '@/hooks/use-onboarding';

export default function Index() {
  const { isAuthenticated } = useAuth();
  const { isLoading, seen } = useOnboarding();

  if (isAuthenticated) return <Redirect href="/(tabs)/species" />;
  if (isLoading) return null;
  return <Redirect href={seen ? '/(auth)/login' : '/(auth)/onboarding'} />;
}
