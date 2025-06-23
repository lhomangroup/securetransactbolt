import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Filter, Search } from 'lucide-react-native';
import { useTransactions } from '@/contexts/TransactionContext';
import { useAuth } from '@/contexts/AuthContext';
import TransactionCard from '@/components/TransactionCard';

type FilterType = 'all' | 'completed' | 'in_progress' | 'disputed' | 'cancelled';
type SortType = 'newest' | 'oldest' | 'amount_high' | 'amount_low';

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const { transactions } = useTransactions();
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');

  const userTransactions = transactions.filter(
    transaction => transaction.buyerId === user?.id || transaction.sellerId === user?.id
  );

  const filteredTransactions = userTransactions.filter(transaction => {
    switch (filter) {
      case 'completed':
        return transaction.status === 'completed';
      case 'in_progress':
        return ['pending_acceptance', 'pending_payment', 'payment_secured', 'shipped', 'delivered', 'inspection_period'].includes(transaction.status);
      case 'disputed':
        return transaction.status === 'disputed';
      case 'cancelled':
        return transaction.status === 'cancelled';
      default:
        return true;
    }
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    switch (sort) {
      case 'oldest':
        return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
      case 'amount_high':
        return b.price - a.price;
      case 'amount_low':
        return a.price - b.price;
      default: // newest
        return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    }
  });

  const getFilterColor = (filterType: FilterType) => {
    return filter === filterType ? '#2563EB' : '#6B7280';
  };

  const getStatusStats = () => {
    const stats = {
      all: userTransactions.length,
      completed: userTransactions.filter(t => t.status === 'completed').length,
      in_progress: userTransactions.filter(t => 
        ['pending_acceptance', 'pending_payment', 'payment_secured', 'shipped', 'delivered', 'inspection_period'].includes(t.status)
      ).length,
      disputed: userTransactions.filter(t => t.status === 'disputed').length,
      cancelled: userTransactions.filter(t => t.status === 'cancelled').length,
    };
    return stats;
  };

  const stats = getStatusStats();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Historique</Text>
        <TouchableOpacity>
          <Search size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>
          {sortedTransactions.length} transaction{sortedTransactions.length > 1 ? 's' : ''}
        </Text>
        <Text style={styles.statsSubtitle}>
          Total: {userTransactions.reduce((sum, t) => sum + t.price, 0).toLocaleString()}€
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, { color: getFilterColor('all') }]}>
            Tout ({stats.all})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.activeFilter]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, { color: getFilterColor('completed') }]}>
            Terminées ({stats.completed})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'in_progress' && styles.activeFilter]}
          onPress={() => setFilter('in_progress')}
        >
          <Text style={[styles.filterText, { color: getFilterColor('in_progress') }]}>
            En cours ({stats.in_progress})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'disputed' && styles.activeFilter]}
          onPress={() => setFilter('disputed')}
        >
          <Text style={[styles.filterText, { color: getFilterColor('disputed') }]}>
            Litiges ({stats.disputed})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'cancelled' && styles.activeFilter]}
          onPress={() => setFilter('cancelled')}
        >
          <Text style={[styles.filterText, { color: getFilterColor('cancelled') }]}>
            Annulées ({stats.cancelled})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.sortContainer}>
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => {
            const sortOptions: SortType[] = ['newest', 'oldest', 'amount_high', 'amount_low'];
            const currentIndex = sortOptions.indexOf(sort);
            const nextIndex = (currentIndex + 1) % sortOptions.length;
            setSort(sortOptions[nextIndex]);
          }}
        >
          <Filter size={16} color="#6B7280" />
          <Text style={styles.sortText}>
            {sort === 'newest' && 'Plus récent'}
            {sort === 'oldest' && 'Plus ancien'}
            {sort === 'amount_high' && 'Prix décroissant'}
            {sort === 'amount_low' && 'Prix croissant'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.transactionsList}>
        {sortedTransactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            currentUserId={user?.id || ''}
            onPress={() => router.push(`/transaction/${transaction.id}`)}
          />
        ))}

        {sortedTransactions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Aucune transaction</Text>
            <Text style={styles.emptyStateSubtitle}>
              Aucune transaction trouvée pour ce filtre
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  statsContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F9FAFB',
  },
  activeFilter: {
    backgroundColor: '#EFF6FF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
  },
  sortText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  transactionsList: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});