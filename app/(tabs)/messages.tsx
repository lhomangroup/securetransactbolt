import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MessageCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { ChatListItem } from '@/components/ChatListItem';

export default function MessagesScreen() {
  const { user } = useAuth();
  const { transactions, messages, getUserTransactions } = useTransactions();
  const [searchQuery, setSearchQuery] = useState('');

  const userTransactions = getUserTransactions(user?.id || '');
  
  // Filtrer les transactions qui ont des messages
  const conversationsData = userTransactions
    .filter(transaction => messages[transaction.id] && messages[transaction.id].length > 0)
    .map(transaction => {
      const transactionMessages = messages[transaction.id] || [];
      const lastMessage = transactionMessages[transactionMessages.length - 1];
      const unreadCount = transactionMessages.filter(msg => 
        msg.senderId !== user?.id && msg.type !== 'system'
      ).length; // Simplification: tous les messages non envoyés par l'utilisateur sont "non lus"
      
      return {
        transaction,
        lastMessage,
        unreadCount,
      };
    })
    .filter(conversation => {
      if (!searchQuery) return true;
      return (
        conversation.transaction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conversation.lastMessage?.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      // Trier par date du dernier message (le plus récent en premier)
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
    });

  const renderConversation = ({ item }: any) => (
    <ChatListItem
      conversation={item}
      currentUserId={user?.id || ''}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search color="#9CA3AF" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une conversation..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {conversationsData.length === 0 ? (
        <View style={styles.emptyState}>
          <MessageCircle color="#D1D5DB" size={64} />
          <Text style={styles.emptyTitle}>Aucune conversation</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery ? 'Aucun résultat trouvé' : 'Vos conversations apparaîtront ici'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversationsData}
          renderItem={renderConversation}
          keyExtractor={(item) => item.transaction.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  list: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
});