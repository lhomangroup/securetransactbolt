import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, MessageCircle, Package, AlertTriangle, CheckCircle } from 'lucide-react-native';

interface Notification {
  id: string;
  type: 'message' | 'transaction' | 'system' | 'dispute';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  transactionId?: string;
}

const notifications: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: 'Nouveau message',
    message: 'Alexandre Martin vous a envoyé un message concernant l\'iPhone 15 Pro Max',
    timestamp: '2024-02-18T16:20:00Z',
    read: false,
    transactionId: '1'
  },
  {
    id: '2',
    type: 'transaction',
    title: 'Article livré',
    message: 'Votre commande iPhone 15 Pro Max a été livrée. Période d\'inspection : 3 jours.',
    timestamp: '2024-02-18T11:30:00Z',
    read: false,
    transactionId: '1'
  },
  {
    id: '3',
    type: 'system',
    title: 'Paiement reçu',
    message: 'Vous avez reçu 650€ pour la location Tesla Model Y.',
    timestamp: '2024-02-17T14:00:00Z',
    read: true,
    transactionId: '2'
  },
  {
    id: '4',
    type: 'dispute',
    title: 'Litige ouvert',
    message: 'Un litige a été ouvert pour le développement d\'application mobile.',
    timestamp: '2024-02-16T08:00:00Z',
    read: true,
    transactionId: '3'
  },
  {
    id: '5',
    type: 'transaction',
    title: 'Transaction terminée',
    message: 'Votre transaction MacBook Pro 14" M3 Pro s\'est terminée avec succès.',
    timestamp: '2024-02-15T10:00:00Z',
    read: true,
    transactionId: '4'
  }
];

export default function NotificationsScreen() {
  const router = useRouter();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle size={20} color="#2563EB" />;
      case 'transaction':
        return <Package size={20} color="#059669" />;
      case 'dispute':
        return <AlertTriangle size={20} color="#DC2626" />;
      default:
        return <Bell size={20} color="#6B7280" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'À l\'instant';
    if (hours < 24) return `Il y a ${hours}h`;
    return date.toLocaleDateString('fr-FR');
  };

  const handleNotificationPress = (notification: Notification) => {
    if (notification.transactionId) {
      router.push(`/transaction/${notification.transactionId}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationItem,
              !notification.read && styles.unreadNotification
            ]}
            onPress={() => handleNotificationPress(notification)}
          >
            <View style={styles.notificationIcon}>
              {getNotificationIcon(notification.type)}
            </View>

            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              <Text style={styles.notificationTime}>
                {formatTimestamp(notification.timestamp)}
              </Text>
            </View>

            {!notification.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}
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
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  unreadNotification: {
    backgroundColor: '#F0F9FF',
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginTop: 4,
  },
});