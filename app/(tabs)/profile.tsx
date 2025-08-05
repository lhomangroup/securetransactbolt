import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Settings,
  Bell,
  CreditCard,
  Shield,
  CircleHelp as HelpCircle,
  LogOut,
  Star,
  Calendar,
  ChevronRight,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          await logout(); // Attendez que la déconnexion soit complétée
          router.replace('/(auth)/'); // Redirigez vers la page d'authentification
        },
      },
    ]);
  };

  const ProfileSection = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.section}>{children}</View>
  );

  const ProfileItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showChevron = true,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.itemLeft}>
        <View style={styles.itemIcon}>{icon}</View>
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{title}</Text>
          {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showChevron && <ChevronRight color="#9CA3AF" size={20} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profil utilisateur */}
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <User color="#FFFFFF" size={32} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <Star color="#F59E0B" size={16} />
                <Text style={styles.statText}>{user?.rating.toFixed(1)}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Calendar color="#6B7280" size={16} />
                <Text style={styles.statText}>
                  Membre depuis {new Date(user?.joinedDate || '').getFullYear()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Statistiques */}
        <ProfileSection>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user?.totalTransactions}</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user?.rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Note moyenne</Text>
            </View>
          </View>
        </ProfileSection>

        {/* Compte */}
        <ProfileSection>
          <Text style={styles.sectionTitle}>Compte</Text>
          <ProfileItem
            icon={<User color="#374151" size={20} />}
            title="Informations personnelles"
            subtitle="Modifier vos informations"
            onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
          />
          <ProfileItem
            icon={<CreditCard color="#374151" size={20} />}
            title="Moyens de paiement"
            subtitle="Gérer vos cartes et comptes"
            onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
          />
          <ProfileItem
            icon={<Shield color="#374151" size={20} />}
            title="Sécurité"
            subtitle="Mot de passe et authentification"
            onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
          />
        </ProfileSection>

        {/* Préférences */}
        <ProfileSection>
          <Text style={styles.sectionTitle}>Préférences</Text>
          <ProfileItem
            icon={<Bell color="#374151" size={20} />}
            title="Notifications"
            subtitle="Gérer vos notifications"
            onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
          />
          <ProfileItem
            icon={<Settings color="#374151" size={20} />}
            title="Paramètres"
            subtitle="Préférences de l'application"
            onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
          />
        </ProfileSection>

        {/* Support */}
        <ProfileSection>
          <Text style={styles.sectionTitle}>Support</Text>
          <ProfileItem
            icon={<HelpCircle color="#374151" size={20} />}
            title="Centre d'aide"
            subtitle="FAQ et support"
            onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
          />
        </ProfileSection>

        {/* Déconnexion */}
        <ProfileSection>
          <ProfileItem
            icon={<LogOut color="#EF4444" size={20} />}
            title="Se déconnecter"
            onPress={handleLogout}
            showChevron={false}
          />
        </ProfileSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    margin: 24,
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 12,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 4,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 12,
    marginHorizontal: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  item: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#111827',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
});
