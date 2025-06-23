import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Star, User, Calendar } from 'lucide-react-native';

interface Rating {
  id: string;
  transactionId: string;
  transactionTitle: string;
  raterName: string;
  raterType: 'buyer' | 'seller';
  rating: number;
  comment: string;
  date: string;
  canReply: boolean;
  reply?: string;
}

export default function RatingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'received' | 'given'>('received');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const receivedRatings: Rating[] = [
    {
      id: '1',
      transactionId: '1',
      transactionTitle: 'iPhone 14 Pro - Comme neuf',
      raterName: 'Marie Dubois',
      raterType: 'seller',
      rating: 5,
      comment: 'Excellent acheteur ! Paiement rapide et communication claire. Je recommande vivement.',
      date: '2024-01-18',
      canReply: true
    },
    {
      id: '2',
      transactionId: '4',
      transactionTitle: 'iPad Pro 12.9"',
      raterName: 'Pierre Martin',
      raterType: 'buyer',
      rating: 4,
      comment: 'Très bon vendeur, article conforme à la description. Livraison un peu lente mais tout s\'est bien passé.',
      date: '2024-01-15',
      canReply: true,
      reply: 'Merci pour votre retour ! Désolé pour le délai de livraison, je ferai mieux la prochaine fois.'
    },
    {
      id: '3',
      transactionId: '5',
      transactionTitle: 'MacBook Pro 16"',
      raterName: 'Sophie Leroy',
      raterType: 'seller',
      rating: 5,
      comment: 'Parfait ! Transaction fluide et acheteur très professionnel.',
      date: '2024-01-12',
      canReply: false
    }
  ];

  const givenRatings: Rating[] = [
    {
      id: '4',
      transactionId: '2',
      transactionTitle: 'MacBook Air M2',
      raterName: 'Jean Martin',
      raterType: 'buyer',
      rating: 4,
      comment: 'Bon vendeur, article en bon état. Communication correcte.',
      date: '2024-01-16',
      canReply: false
    },
    {
      id: '5',
      transactionId: '6',
      transactionTitle: 'AirPods Pro 2',
      raterName: 'Lucas Dubois',
      raterType: 'seller',
      rating: 5,
      comment: 'Excellent acheteur, très réactif et paiement immédiat !',
      date: '2024-01-10',
      canReply: false
    }
  ];

  const currentRatings = activeTab === 'received' ? receivedRatings : givenRatings;

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            color={star <= rating ? '#F59E0B' : '#E5E7EB'}
            fill={star <= rating ? '#F59E0B' : 'transparent'}
          />
        ))}
      </View>
    );
  };

  const handleReply = (ratingId: string) => {
    if (!replyText.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une réponse');
      return;
    }

    // Ici, on enverrait la réponse au serveur
    Alert.alert('Succès', 'Votre réponse a été publiée');
    setReplyingTo(null);
    setReplyText('');
  };

  const renderRating = ({ item }: { item: Rating }) => (
    <View style={styles.ratingCard}>
      <View style={styles.ratingHeader}>
        <View style={styles.raterInfo}>
          <View style={styles.raterAvatar}>
            <User color="#6B7280" size={20} />
          </View>
          <View style={styles.raterDetails}>
            <Text style={styles.raterName}>{item.raterName}</Text>
            <Text style={styles.raterType}>
              {item.raterType === 'buyer' ? 'Acheteur' : 'Vendeur'}
            </Text>
          </View>
        </View>
        <View style={styles.ratingInfo}>
          {renderStars(item.rating, 18)}
          <View style={styles.dateContainer}>
            <Calendar color="#9CA3AF" size={12} />
            <Text style={styles.ratingDate}>
              {new Date(item.date).toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.transactionTitle}>{item.transactionTitle}</Text>
      <Text style={styles.ratingComment}>{item.comment}</Text>

      {item.reply && (
        <View style={styles.replyContainer}>
          <Text style={styles.replyLabel}>Votre réponse :</Text>
          <Text style={styles.replyText}>{item.reply}</Text>
        </View>
      )}

      {item.canReply && !item.reply && activeTab === 'received' && (
        <View style={styles.replySection}>
          {replyingTo === item.id ? (
            <View style={styles.replyForm}>
              <TextInput
                style={styles.replyInput}
                value={replyText}
                onChangeText={setReplyText}
                placeholder="Répondre à cette évaluation..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
              <View style={styles.replyActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setReplyingTo(null);
                    setReplyText('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sendReplyButton}
                  onPress={() => handleReply(item.id)}
                >
                  <Text style={styles.sendReplyButtonText}>Répondre</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.replyButton}
              onPress={() => setReplyingTo(item.id)}
            >
              <Text style={styles.replyButtonText}>Répondre</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const averageRating = receivedRatings.reduce((sum, rating) => sum + rating.rating, 0) / receivedRatings.length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#374151" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Évaluations</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{averageRating.toFixed(1)}</Text>
          <View style={styles.statStars}>
            {renderStars(Math.round(averageRating), 20)}
          </View>
          <Text style={styles.statLabel}>Note moyenne</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{receivedRatings.length}</Text>
          <Text style={styles.statLabel}>Évaluations reçues</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{givenRatings.length}</Text>
          <Text style={styles.statLabel}>Évaluations données</Text>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'received' && styles.activeTab
          ]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'received' && styles.activeTabText
          ]}>
            Reçues ({receivedRatings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'given' && styles.activeTab
          ]}
          onPress={() => setActiveTab('given')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'given' && styles.activeTabText
          ]}>
            Données ({givenRatings.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={currentRatings}
        renderItem={renderRating}
        keyExtractor={(item) => item.id}
        style={styles.ratingsList}
        contentContainerStyle={styles.ratingsContent}
        showsVerticalScrollIndicator={false}
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  statStars: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  ratingsList: {
    flex: 1,
  },
  ratingsContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  ratingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  raterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  raterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  raterDetails: {
    flex: 1,
  },
  raterName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  raterType: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  ratingInfo: {
    alignItems: 'flex-end',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  transactionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
    marginBottom: 8,
  },
  ratingComment: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 24,
  },
  replyContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
  },
  replyLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
    marginBottom: 4,
  },
  replyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
  },
  replySection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  replyButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  replyButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  replyForm: {
    gap: 12,
  },
  replyInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  sendReplyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2563EB',
  },
  sendReplyButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
});