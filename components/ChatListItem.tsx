import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageCircle, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { Transaction, ChatMessage } from '@/contexts/TransactionContext';

interface ConversationData {
  transaction: Transaction;
  lastMessage: ChatMessage;
  unreadCount: number;
}

interface ChatListItemProps {
  conversation: ConversationData;
  currentUserId: string;
}

export function ChatListItem({ conversation, currentUserId }: ChatListItemProps) {
  const router = useRouter();
  const { transaction, lastMessage, unreadCount } = conversation;
  
  const isBuyer = transaction.buyerId === currentUserId;
  const otherPartyName = isBuyer ? transaction.sellerName : transaction.buyerName;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'disputed':
        return '#EF4444';
      case 'completed':
        return '#10B981';
      case 'pending_acceptance':
      case 'pending_payment':
        return '#F59E0B';
      default:
        return '#2563EB';
    }
  };

  const handlePress = () => {
    router.push(`/chat/${transaction.id}`);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.avatar}>
        <MessageCircle color="#FFFFFF" size={20} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {otherPartyName}
          </Text>
          <Text style={styles.time}>
            {formatTime(lastMessage.timestamp)}
          </Text>
        </View>
        
        <Text style={styles.transactionTitle} numberOfLines={1}>
          {transaction.title}
        </Text>
        
        <View style={styles.messageContainer}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {lastMessage.type === 'system' ? 
              `🔔 ${lastMessage.message}` : 
              lastMessage.message
            }
          </Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.statusIndicator}>
        <View 
          style={[
            styles.statusDot, 
            { backgroundColor: getStatusColor() }
          ]} 
        />
        {transaction.status === 'disputed' && (
          <AlertTriangle color="#EF4444" size={16} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  transactionTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 4,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  statusIndicator: {
    alignItems: 'center',
    marginLeft: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
});