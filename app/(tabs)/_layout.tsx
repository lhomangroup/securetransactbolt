import { Tabs, useRouter } from 'expo-router';
import { Chrome as Home, Plus, MessageCircle, User } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function TabLayout() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    console.log('🔍 TabLayout useEffect - loading:', loading, 'isAuthenticated:', isAuthenticated, 'hasCheckedAuth:', hasCheckedAuth);
    if (!loading && !hasCheckedAuth) {
      setHasCheckedAuth(true);
      if (!isAuthenticated) {
        console.log('❌ Utilisateur non authentifié dans TabLayout, redirection vers auth...');
        router.replace('/(auth)');
      } else {
        console.log('✅ Utilisateur authentifié dans TabLayout');
      }
    }
  }, [isAuthenticated, loading, router, hasCheckedAuth]);

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (loading || !hasCheckedAuth) {
    console.log('⏳ TabLayout en cours de chargement...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // Si pas authentifié, ne rien afficher (la redirection est en cours)
  if (!isAuthenticated) {
    console.log('❌ Utilisateur non authentifié dans TabLayout, affichage du loader...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  console.log('📱 Affichage des tabs pour utilisateur authentifié');
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          paddingTop: 8,
          paddingBottom: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter-Medium',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Créer',
          tabBarIcon: ({ size, color }) => (
            <Plus size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ size, color }) => (
            <MessageCircle size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}