import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    console.log('🔍 AuthLayout useEffect - loading:', loading, 'isAuthenticated:', isAuthenticated, 'hasRedirected:', hasRedirected);
    if (!loading && !hasRedirected) {
      if (isAuthenticated) {
        console.log('✅ Utilisateur authentifié détecté dans AuthLayout, redirection...');
        setHasRedirected(true);
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, loading, hasRedirected, router]);


  if (loading) {
    console.log('⏳ AuthLayout en cours de chargement...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (isAuthenticated && !hasRedirected) {
    console.log('🔄 Redirection en cours...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  console.log('📱 Affichage des écrans d\'authentification');
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}