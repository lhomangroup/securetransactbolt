import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Filter, Calendar } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { TransactionCard } from '@/components/TransactionCard';

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { getUserTransactions } = useTransactions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'buyer' | 'seller'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'disputed' | 'cancelled'>('all');

  const userTransactions = getUserTransactions(user?.id || '');

  const filteredTransactions = userTransactions.filter(transaction => {
    // Filtre par recherche
    if (searchQuery && !transaction.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Filtre par rôle
    if (selectedFilter === 'buyer' && transaction.buyerId !== user?.id) {
      return false;
    }
    if (selectedFilter === 'seller' && transaction.sellerId !== user?.id) {
      return false;
    }

    // Filtre par statut
    if (selectedStatus !== 'all' && transaction.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  const filters = [
    { key: 'all', label: 'Toutes' },
    { key: 'buyer', label: 'En tant qu\'acheteur' },
    { key: 'seller', label: 'En tant que vendeur' },
  ];

  const statusFilters = [
    { key: 'all', label: 'Tous les statuts' },
    { key: 'completed', label: 'Terminées' },
    { key: 'disputed', label: 'En litige' },
    { key: 'cancelled', label: 'Annulées' },
  ];

  const renderTransaction = ({ item }: any) => (
    <TransactionCard
      transaction={item}
      currentUserId={user?.id || ''}
    />
  );

  const totalAmount = filteredTransactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.price, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#374151" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Historique des transactions</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search color="#9CA3AF" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une transaction..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.statsBar}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{filteredTransactions.length}</Text>
          <Text style={styles.statLabel}>Transactions</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>
            {totalAmount.toLocaleString('fr-FR')} €
          </Text>
          <Text style={styles.statLabel}>Volume total</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>
            {filteredTransactions.filter(t => t.status === 'completed').length}
          </Text>
          <Text style={styles.statLabel}>Terminées</Text>
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filters}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.key && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedFilter(filter.key as any)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter.key && styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.statusFiltersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filters}>
            {statusFilters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.statusFilterButton,
                  selectedStatus === filter.key && styles.statusFilterButtonActive,
                ]}
                onPress={() => setSelectedStatus(filter.key as any)}
              >
                <Text
                  style={[
                    styles.statusFilterText,
                    selectedStatus === filter.key && styles.statusFilterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        style={styles.transactionsList}
        contentContainerStyle={styles.transactionsContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucune transaction trouvée</Text>
            <Text style={styles.emptySubtext}>
              Essayez de modifier vos filtres de recherche
            </Text>
          </View>
        }
      />
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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    marginLeft: 12,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  filtersContainer: {
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statusFiltersContainer: {
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
    backgroundColor: '#F3F4F6',
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
  statusFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusFilterButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  statusFilterText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  statusFilterTextActive: {
    color: '#2563EB',
  },
  transactionsList: {
    flex: 1,
  },
  transactionsContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
});