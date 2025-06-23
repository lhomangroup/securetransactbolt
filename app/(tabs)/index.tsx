import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bell, TrendingUp, Clock, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { TransactionCard } from '@/components/TransactionCard';
import { StatsCard } from '@/components/StatsCard';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { transactions, getUserTransactions } = useTransactions();
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'pending' | 'completed'>('all');

  const userTransactions = getUserTransactions(user?.id || '');
  
  const filteredTransactions = userTransactions.filter(transaction => {
    switch (activeFilter) {
      case 'active':
        return ['payment_secured', 'shipped', 'delivered', 'inspection_period'].includes(transaction.status);
      case 'pending':
        return ['pending_acceptance', 'pending_payment'].includes(transaction.status);
      case 'completed':
        return transaction.status === 'completed';
      default:
        return true;
    }
  });

  const stats = {
    active: userTransactions.filter(t => ['payment_secured', 'shipped', 'delivered', 'inspection_period'].includes(t.status)).length,
    pending: userTransactions.filter(t => ['pending_acceptance', 'pending_payment'].includes(t.status)).length,
    completed: userTransactions.filter(t => t.status === 'completed').length,
    disputed: userTransactions.filter(t => t.status === 'disputed').length,
  };

  const filters = [
    { key: 'all', label: 'Toutes', count: userTransactions.length },
    { key: 'active', label: 'Actives', count: stats.active },
    { key: 'pending', label: 'En attente', count: stats.pending },
    { key: 'completed', label: 'Terminées', count: stats.completed },
  ];

  const unreadNotifications = 2; // En production, récupérer depuis le contexte

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour,</Text>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => router.push('/notifications')}
        >
          <Bell color="#374151" size={24} />
          {unreadNotifications > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{unreadNotifications}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <StatsCard
            icon={<TrendingUp color="#10B981" size={20} />}
            title="Transactions actives"
            value={stats.active.toString()}
            subtitle="En cours"
            color="#10B981"
          />
          <StatsCard
            icon={<Clock color="#F59E0B" size={20} />}
            title="En attente"
            value={stats.pending.toString()}
            subtitle="À traiter"
            color="#F59E0B"
          />
          {stats.disputed > 0 && (
            <StatsCard
              icon={<AlertTriangle color="#EF4444" size={20} />}
              title="Litiges"
              value={stats.disputed.toString()}
              subtitle="À résoudre"
              color="#EF4444"
            />
          )}
        </View>

        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filters}>
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterButton,
                    activeFilter === filter.key && styles.filterButtonActive,
                  ]}
                  onPress={() => setActiveFilter(filter.key as any)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      activeFilter === filter.key && styles.filterTextActive,
                    ]}
                  >
                    {filter.label} ({filter.count})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.transactionsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes transactions</Text>
            <TouchableOpacity onPress={() => router.push('/transaction-history')}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Aucune transaction trouvée</Text>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={() => router.push('/(tabs)/create')}
              >
                <Text style={styles.createButtonText}>Créer une transaction</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredTransactions.slice(0, 3).map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                currentUserId={user?.id || ''}
              />
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => router.push('/(tabs)/create')}
            >
              <Text style={styles.quickActionText}>Nouvelle transaction</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => router.push('/ratings')}
            >
              <Text style={styles.quickActionText}>Mes évaluations</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => router.push('/payment-methods')}
            >
              <Text style={styles.quickActionText}>Moyens de paiement</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 12,
  },
  filtersContainer: {
    paddingTop: 24,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  transactionsContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  quickActionsContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  quickAction: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    textAlign: 'center',
  },
});