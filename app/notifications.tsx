import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, DollarSign, Package, MessageCircle, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Settings } from 'lucide-react-native';

interface Notification {
  id: string;
  type: 'payment' | 'shipping' | 'message' | 'dispute' | 'completed' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  transactionId?: string;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'message',
      title: 'Nouveau message',
      message: 'Marie Dubois vous a envoyé un message concernant l\'iPhone 14 Pro',
      timestamp: '2024-01-18T10:30:00Z',
      read: false,
      transactionId: '1'
    },
    {
      id: '2',
      type: 'payment',
      title: 'Paiement reçu',
      message: 'Le paiement pour le MacBook Air M2 a été sécurisé',
      timestamp: '2024-01-17T15:45:00Z',
      read: false,
      transactionId: '2'
    },
    {
      id: '3',
      type: 'shipping',
      title: 'Article expédié',
      message: 'L\'iPhone 14 Pro a été marqué comme expédié',
      timestamp: '2024-01-17T09:20:00Z',
      read: true,
      transactionId: '1'
    },
    {
      id: '4',
      type: 'dispute',
      title: 'Litige ouvert',
      message: 'Un litige a été ouvert pour les services de développement web',
      timestamp: '2024-01-16T14:30:00Z',
      read: true,
      transactionId: '3'
    },
    {
      id: '5',
      type: 'completed',
      title: 'Transaction terminée',
      message: 'La transaction pour l\'iPad Pro a été terminée avec succès',
      timestamp: '2024-01-15T11:15:00Z',
      read: true,
      transactionId: '4'
    }
  ]);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <DollarSign color="#10B981" size={20} />;
      case 'shipping':
        return <Package color="#2563EB" size={20} />;
      case 'message':
        return <MessageCircle color="#8B5CF6" size={20} />;
      case 'dispute':
        return <AlertTriangle color="#EF4444" size={20} />;
      case 'completed':
        return <CheckCircle color="#10B981" size={20} />;
      default:
        return <Bell color="#6B7280" size={20} />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 24 * 7) {
      const days = Math.floor(diffInHours / 24);
      return `Il y a ${days}j`;
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    // Marquer comme lu
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      )
    );

    // Naviguer vers la transaction si applicable
    if (notification.transactionId) {
      if (notification.type === 'message') {
        router.push(`/chat/${notification.transactionId}`);
      } else {
        router.push(`/transaction/${notification.transactionId}`);
      }
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationIcon}>
        {getNotificationIcon(item.type)}
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[
            styles.notificationTitle,
            !item.read && styles.unreadTitle
          ]}>
            {item.title}
          </Text>
          <Text style={styles.notificationTime}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#374151" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => {/* Ouvrir les paramètres de notifications */}}
        >
          <Settings color="#374151" size={24} />
        </TouchableOpacity>
      </View>

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadText}>
            {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
          </Text>
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllReadText}>Tout marquer comme lu</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Paramètres de notification</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Notifications push</Text>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: '#E5E7EB', true: '#DBEAFE' }}
            thumbColor={pushEnabled ? '#2563EB' : '#9CA3AF'}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Notifications par email</Text>
          <Switch
            value={emailEnabled}
            onValueChange={setEmailEnabled}
            trackColor={{ false: '#E5E7EB', true: '#DBEAFE' }}
            thumbColor={emailEnabled ? '#2563EB' : '#9CA3AF'}
          />
        </View>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        style={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  settingsButton: {
    padding: 8,
  },
  unreadBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  unreadText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1E40AF',
  },
  markAllReadText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
  },
  settingsSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  unreadNotification: {
    backgroundColor: '#FEFEFE',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginLeft: 8,
    marginTop: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 80,
  },
});