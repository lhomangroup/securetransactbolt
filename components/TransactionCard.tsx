import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Package, Eye, DollarSign } from 'lucide-react-native';
import { Transaction, TransactionStatus } from '@/contexts/TransactionContext';

interface TransactionCardProps {
  transaction: Transaction;
  currentUserId: string;
}

export function TransactionCard({ transaction, currentUserId }: TransactionCardProps) {
  const router = useRouter();
  const isBuyer = transaction.buyerId === currentUserId;

  const getStatusInfo = (status: TransactionStatus) => {
    switch (status) {
      case 'pending_acceptance':
        return {
          icon: <Clock color="#F59E0B" size={16} />,
          text: 'En attente d\'acceptation',
          color: '#F59E0B',
          bgColor: '#FEF3C7',
        };
      case 'pending_payment':
        return {
          icon: <DollarSign color="#F59E0B" size={16} />,
          text: 'En attente de paiement',
          color: '#F59E0B',
          bgColor: '#FEF3C7',
        };
      case 'payment_secured':
        return {
          icon: <CheckCircle color="#10B981" size={16} />,
          text: 'Paiement sécurisé',
          color: '#10B981',
          bgColor: '#D1FAE5',
        };
      case 'shipped':
        return {
          icon: <Package color="#2563EB" size={16} />,
          text: 'Expédié',
          color: '#2563EB',
          bgColor: '#DBEAFE',
        };
      case 'delivered':
        return {
          icon: <Package color="#2563EB" size={16} />,
          text: 'Livré',
          color: '#2563EB',
          bgColor: '#DBEAFE',
        };
      case 'inspection_period':
        return {
          icon: <Eye color="#8B5CF6" size={16} />,
          text: 'Période d\'inspection',
          color: '#8B5CF6',
          bgColor: '#EDE9FE',
        };
      case 'completed':
        return {
          icon: <CheckCircle color="#10B981" size={16} />,
          text: 'Terminée',
          color: '#10B981',
          bgColor: '#D1FAE5',
        };
      case 'disputed':
        return {
          icon: <AlertTriangle color="#EF4444" size={16} />,
          text: 'En litige',
          color: '#EF4444',
          bgColor: '#FEE2E2',
        };
      case 'cancelled':
        return {
          icon: <AlertTriangle color="#6B7280" size={16} />,
          text: 'Annulée',
          color: '#6B7280',
          bgColor: '#F3F4F6',
        };
      default:
        return {
          icon: <Clock color="#6B7280" size={16} />,
          text: 'Statut inconnu',
          color: '#6B7280',
          bgColor: '#F3F4F6',
        };
    }
  };

  const statusInfo = getStatusInfo(transaction.status);
  const otherPartyName = isBuyer ? transaction.sellerName : transaction.buyerName;

  const handlePress = () => {
    router.push(`/transaction/${transaction.id}`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {transaction.title}
          </Text>
          <Text style={styles.price}>
            {transaction.price.toLocaleString('fr-FR')} €
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
          {statusInfo.icon}
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.description} numberOfLines={2}>
          {transaction.description}
        </Text>
        <View style={styles.participantInfo}>
          <Text style={styles.participantLabel}>
            {isBuyer ? 'Vendeur' : 'Acheteur'}:
          </Text>
          <Text style={styles.participantName}>{otherPartyName}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.date}>
          Créée le {new Date(transaction.createdDate).toLocaleDateString('fr-FR')}
        </Text>
        <Text style={styles.lastUpdate}>
          Mis à jour le {new Date(transaction.lastUpdate).toLocaleDateString('fr-FR')}
        </Text>
      </View>

      {transaction.images && transaction.images.length > 0 && (
        <Image 
          source={{ uri: transaction.images[0] }} 
          style={styles.image}
          resizeMode="cover"
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginRight: 12,
  },
  price: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  cardBody: {
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginRight: 4,
  },
  participantName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  lastUpdate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginTop: 12,
  },
});