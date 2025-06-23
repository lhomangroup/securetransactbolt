import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MessageCircle, Package, Eye, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Clock, DollarSign, MapPin, Calendar, User, Camera, FileText } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/contexts/TransactionContext';

export default function TransactionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { getTransactionById, updateTransactionStatus } = useTransactions();
  
  const transaction = getTransactionById(id as string);
  const [isLoading, setIsLoading] = useState(false);

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Transaction non trouvée</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isBuyer = transaction.buyerId === user?.id;
  const otherPartyName = isBuyer ? transaction.sellerName : transaction.buyerName;

  const getStatusInfo = () => {
    switch (transaction.status) {
      case 'pending_acceptance':
        return {
          icon: <Clock color="#F59E0B" size={24} />,
          text: 'En attente d\'acceptation',
          color: '#F59E0B',
          bgColor: '#FEF3C7',
          description: isBuyer 
            ? 'En attente de l\'acceptation du vendeur'
            : 'Vous devez accepter cette transaction'
        };
      case 'pending_payment':
        return {
          icon: <DollarSign color="#F59E0B" size={24} />,
          text: 'En attente de paiement',
          color: '#F59E0B',
          bgColor: '#FEF3C7',
          description: isBuyer 
            ? 'Vous devez effectuer le paiement'
            : 'En attente du paiement de l\'acheteur'
        };
      case 'payment_secured':
        return {
          icon: <CheckCircle color="#10B981" size={24} />,
          text: 'Paiement sécurisé',
          color: '#10B981',
          bgColor: '#D1FAE5',
          description: 'Le paiement est sécurisé, vous pouvez expédier l\'article'
        };
      case 'shipped':
        return {
          icon: <Package color="#2563EB" size={24} />,
          text: 'Expédié',
          color: '#2563EB',
          bgColor: '#DBEAFE',
          description: isBuyer 
            ? 'L\'article a été expédié'
            : 'Article expédié, en attente de confirmation de réception'
        };
      case 'delivered':
        return {
          icon: <Package color="#2563EB" size={24} />,
          text: 'Livré',
          color: '#2563EB',
          bgColor: '#DBEAFE',
          description: 'Article livré, période d\'inspection en cours'
        };
      case 'inspection_period':
        return {
          icon: <Eye color="#8B5CF6" size={24} />,
          text: 'Période d\'inspection',
          color: '#8B5CF6',
          bgColor: '#EDE9FE',
          description: `Période d'inspection de ${transaction.inspectionPeriod} jours en cours`
        };
      case 'completed':
        return {
          icon: <CheckCircle color="#10B981" size={24} />,
          text: 'Terminée',
          color: '#10B981',
          bgColor: '#D1FAE5',
          description: 'Transaction terminée avec succès'
        };
      case 'disputed':
        return {
          icon: <AlertTriangle color="#EF4444" size={24} />,
          text: 'En litige',
          color: '#EF4444',
          bgColor: '#FEE2E2',
          description: 'Transaction en litige, médiation en cours'
        };
      default:
        return {
          icon: <Clock color="#6B7280" size={24} />,
          text: 'Statut inconnu',
          color: '#6B7280',
          bgColor: '#F3F4F6',
          description: ''
        };
    }
  };

  const statusInfo = getStatusInfo();

  const handleAction = async (action: string) => {
    setIsLoading(true);
    try {
      switch (action) {
        case 'accept':
          updateTransactionStatus(transaction.id, 'pending_payment');
          Alert.alert('Succès', 'Transaction acceptée. L\'acheteur va être notifié.');
          break;
        case 'pay':
          updateTransactionStatus(transaction.id, 'payment_secured');
          Alert.alert('Succès', 'Paiement effectué et sécurisé.');
          break;
        case 'ship':
          updateTransactionStatus(transaction.id, 'shipped');
          Alert.alert('Succès', 'Article marqué comme expédié.');
          break;
        case 'confirm_delivery':
          updateTransactionStatus(transaction.id, 'inspection_period');
          Alert.alert('Succès', 'Réception confirmée. Période d\'inspection commencée.');
          break;
        case 'approve':
          updateTransactionStatus(transaction.id, 'completed');
          Alert.alert('Succès', 'Transaction approuvée. Les fonds ont été libérés.');
          break;
        case 'dispute':
          router.push(`/dispute/${transaction.id}`);
          break;
        case 'cancel':
          Alert.alert(
            'Annuler la transaction',
            'Êtes-vous sûr de vouloir annuler cette transaction ?',
            [
              { text: 'Non', style: 'cancel' },
              { 
                text: 'Oui', 
                style: 'destructive',
                onPress: () => updateTransactionStatus(transaction.id, 'cancelled')
              }
            ]
          );
          break;
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableActions = () => {
    const actions = [];
    
    switch (transaction.status) {
      case 'pending_acceptance':
        if (!isBuyer) {
          actions.push({ key: 'accept', label: 'Accepter', style: 'primary' });
        }
        actions.push({ key: 'cancel', label: 'Annuler', style: 'danger' });
        break;
      case 'pending_payment':
        if (isBuyer) {
          actions.push({ key: 'pay', label: 'Payer maintenant', style: 'primary' });
        }
        actions.push({ key: 'cancel', label: 'Annuler', style: 'danger' });
        break;
      case 'payment_secured':
        if (!isBuyer) {
          actions.push({ key: 'ship', label: 'Marquer comme expédié', style: 'primary' });
        }
        break;
      case 'shipped':
        if (isBuyer) {
          actions.push({ key: 'confirm_delivery', label: 'Confirmer la réception', style: 'primary' });
        }
        break;
      case 'inspection_period':
        if (isBuyer) {
          actions.push({ key: 'approve', label: 'Approuver la transaction', style: 'success' });
          actions.push({ key: 'dispute', label: 'Signaler un problème', style: 'warning' });
        }
        break;
    }
    
    return actions;
  };

  const availableActions = getAvailableActions();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#374151" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de la transaction</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.push(`/chat/${transaction.id}`)}
        >
          <MessageCircle color="#374151" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: statusInfo.bgColor }]}>
          <View style={styles.statusHeader}>
            {statusInfo.icon}
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
          <Text style={styles.statusDescription}>
            {statusInfo.description}
          </Text>
        </View>

        {/* Transaction Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de la transaction</Text>
          <View style={styles.infoCard}>
            <Text style={styles.transactionTitle}>{transaction.title}</Text>
            <Text style={styles.transactionPrice}>
              {transaction.price.toLocaleString('fr-FR')} €
            </Text>
            <Text style={styles.transactionDescription}>
              {transaction.description}
            </Text>
          </View>
        </View>

        {/* Images */}
        {transaction.images && transaction.images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.imagesContainer}>
                {transaction.images.map((image, index) => (
                  <Image 
                    key={index}
                    source={{ uri: image }} 
                    style={styles.transactionImage}
                    resizeMode="cover"
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Participants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Participants</Text>
          <View style={styles.participantsCard}>
            <View style={styles.participant}>
              <View style={styles.participantIcon}>
                <User color="#2563EB" size={20} />
              </View>
              <View style={styles.participantInfo}>
                <Text style={styles.participantRole}>Acheteur</Text>
                <Text style={styles.participantName}>{transaction.buyerName}</Text>
              </View>
            </View>
            <View style={styles.participant}>
              <View style={styles.participantIcon}>
                <User color="#10B981" size={20} />
              </View>
              <View style={styles.participantInfo}>
                <Text style={styles.participantRole}>Vendeur</Text>
                <Text style={styles.participantName}>{transaction.sellerName}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Transaction Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Calendar color="#6B7280" size={16} />
              <Text style={styles.detailLabel}>Créée le</Text>
              <Text style={styles.detailValue}>
                {new Date(transaction.createdDate).toLocaleDateString('fr-FR')}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Eye color="#6B7280" size={16} />
              <Text style={styles.detailLabel}>Période d'inspection</Text>
              <Text style={styles.detailValue}>{transaction.inspectionPeriod} jours</Text>
            </View>
            {transaction.deliveryAddress && (
              <View style={styles.detailRow}>
                <MapPin color="#6B7280" size={16} />
                <Text style={styles.detailLabel}>Adresse de livraison</Text>
                <Text style={styles.detailValue}>{transaction.deliveryAddress}</Text>
              </View>
            )}
            {transaction.disputeReason && (
              <View style={styles.detailRow}>
                <AlertTriangle color="#EF4444" size={16} />
                <Text style={styles.detailLabel}>Raison du litige</Text>
                <Text style={styles.detailValue}>{transaction.disputeReason}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions */}
        {availableActions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <View style={styles.actionsContainer}>
              {availableActions.map((action) => (
                <TouchableOpacity
                  key={action.key}
                  style={[
                    styles.actionButton,
                    action.style === 'primary' && styles.primaryButton,
                    action.style === 'success' && styles.successButton,
                    action.style === 'warning' && styles.warningButton,
                    action.style === 'danger' && styles.dangerButton,
                    isLoading && styles.disabledButton
                  ]}
                  onPress={() => handleAction(action.key)}
                  disabled={isLoading}
                >
                  <Text style={[
                    styles.actionButtonText,
                    action.style === 'primary' && styles.primaryButtonText,
                    action.style === 'success' && styles.successButtonText,
                    action.style === 'warning' && styles.warningButtonText,
                    action.style === 'danger' && styles.dangerButtonText,
                  ]}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  statusCard: {
    margin: 24,
    padding: 20,
    borderRadius: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 12,
  },
  statusDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginLeft: 36,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
    marginHorizontal: 24,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  transactionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 8,
  },
  transactionPrice: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
    marginBottom: 12,
  },
  transactionDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 24,
  },
  imagesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
  },
  transactionImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  participantsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  participant: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  participantIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  participantInfo: {
    flex: 1,
  },
  participantRole: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 12,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  actionsContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  successButton: {
    backgroundColor: '#10B981',
  },
  successButtonText: {
    color: '#FFFFFF',
  },
  warningButton: {
    backgroundColor: '#F59E0B',
  },
  warningButtonText: {
    color: '#FFFFFF',
  },
  dangerButton: {
    backgroundColor: '#EF4444',
  },
  dangerButtonText: {
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.5,
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
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});