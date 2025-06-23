import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, Info, Camera, Paperclip } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { ChatMessage } from '@/contexts/TransactionContext';

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { getTransactionById, messages, sendMessage } = useTransactions();
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);
  
  const transaction = getTransactionById(id as string);
  const chatMessages = messages[id as string] || [];

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (chatMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages.length]);

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Transaction non trouvée</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isBuyer = transaction.buyerId === user?.id;
  const otherPartyName = isBuyer ? transaction.sellerName : transaction.buyerName;

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(
        transaction.id,
        user?.id || '',
        user?.name || '',
        newMessage.trim()
      );
      setNewMessage('');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isOwnMessage = item.senderId === user?.id;
    const isSystemMessage = item.type === 'system';
    const previousMessage = index > 0 ? chatMessages[index - 1] : null;
    const showDateSeparator = !previousMessage || 
      formatDate(item.timestamp) !== formatDate(previousMessage.timestamp);

    return (
      <View>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>
              {formatDate(item.timestamp)}
            </Text>
          </View>
        )}
        
        {isSystemMessage ? (
          <View style={styles.systemMessageContainer}>
            <Text style={styles.systemMessage}>{item.message}</Text>
          </View>
        ) : (
          <View style={[
            styles.messageContainer,
            isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
          ]}>
            <View style={[
              styles.messageBubble,
              isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
            ]}>
              {!isOwnMessage && (
                <Text style={styles.senderName}>{item.senderName}</Text>
              )}
              <Text style={[
                styles.messageText,
                isOwnMessage ? styles.ownMessageText : styles.otherMessageText
              ]}>
                {item.message}
              </Text>
              <Text style={[
                styles.messageTime,
                isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
              ]}>
                {formatTime(item.timestamp)}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#374151" size={24} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{otherPartyName}</Text>
          <Text style={styles.headerSubtitle}>{transaction.title}</Text>
        </View>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.push(`/transaction/${transaction.id}`)}
        >
          <Info color="#374151" size={24} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={chatMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.attachButton}>
              <Paperclip color="#6B7280" size={20} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachButton}>
              <Camera color="#6B7280" size={20} />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Tapez votre message..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={1000}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                newMessage.trim() ? styles.sendButtonActive : styles.sendButtonInactive
              ]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send 
                color={newMessage.trim() ? "#FFFFFF" : "#9CA3AF"} 
                size={20} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateSeparatorText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 24,
  },
  systemMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    textAlign: 'center',
  },
  messageContainer: {
    paddingHorizontal: 16,
    marginVertical: 2,
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  ownMessageBubble: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  senderName: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#111827',
  },
  messageTime: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  ownMessageTime: {
    color: '#E0E7FF',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#9CA3AF',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  attachButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    backgroundColor: '#FFFFFF',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#2563EB',
  },
  sendButtonInactive: {
    backgroundColor: '#F3F4F6',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
  },
});