import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Lock, Users } from 'lucide-react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2563EB', '#1D4ED8']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Shield color="#FFFFFF" size={80} strokeWidth={1.5} />
            <Text style={styles.title}>SecureTransact</Text>
            <Text style={styles.subtitle}>Transactions sécurisées entre particuliers</Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Lock color="#E0E7FF" size={24} />
              <Text style={styles.featureText}>Paiements sécurisés</Text>
            </View>
            <View style={styles.feature}>
              <Shield color="#E0E7FF" size={24} />
              <Text style={styles.featureText}>Protection anti-fraude</Text>
            </View>
            <View style={styles.feature}>
              <Users color="#E0E7FF" size={24} />
              <Text style={styles.featureText}>Médiation intégrée</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.primaryButtonText}>Se connecter</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.secondaryButtonText}>Créer un compte</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#E0E7FF',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 80,
    width: '100%',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#E0E7FF',
    marginLeft: 16,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});