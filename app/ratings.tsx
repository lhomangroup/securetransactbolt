import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Star, ThumbsUp } from 'lucide-react-native';

interface Review {
  id: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  transactionTitle: string;
  type: 'buyer' | 'seller';
}

const reviews: Review[] = [
  {
    id: '1',
    reviewerName: 'Thomas Dubois',
    reviewerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    comment: 'Vendeur excellent ! MacBook livré rapidement et en parfait état comme décrit. Communication fluide tout au long de la transaction.',
    date: '2024-02-15',
    transactionTitle: 'MacBook Pro 14" M3 Pro',
    type: 'seller'
  },
  {
    id: '2',
    reviewerName: 'Sophie Moreau',
    reviewerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    comment: 'Acheteur sérieux et ponctuel. Paiement immédiat et récupération du matériel photo dans les temps. Je recommande !',
    date: '2024-02-05',
    transactionTitle: 'Sony A7R V - Kit photographe',
    type: 'buyer'
  },
  {
    id: '3',
    reviewerName: 'Horlogerie Prestige Paris',
    rating: 5,
    comment: 'Transaction parfaite. Client connaisseur qui apprécie la qualité. Paiement rapide et échange professionnel.',
    date: '2024-02-14',
    transactionTitle: 'Rolex Submariner Date',
    type: 'seller'
  },
  {
    id: '4',
    reviewerName: 'Marina Rousseau',
    reviewerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    rating: 4,
    comment: 'Bonne expérience ! Tesla en excellent état. Juste un petit délai sur la remise des clés mais rien de grave.',
    date: '2024-02-16',
    transactionTitle: 'Tesla Model Y - Location',
    type: 'buyer'
  },
  {
    id: '5',
    reviewerName: 'David Chen',
    rating: 5,
    comment: 'Vendeur top ! Vélo électrique impeccable, livré avec tous les accessoires promis. Prix très correct.',
    date: '2024-02-17',
    transactionTitle: 'Vélo électrique Specialized',
    type: 'seller'
  }
];

export default function RatingsScreen() {
  const router = useRouter();

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const totalReviews = reviews.length;

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            color={star <= rating ? '#FBBF24' : '#E5E7EB'}
            fill={star <= rating ? '#FBBF24' : 'transparent'}
          />
        ))}
      </View>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Évaluations</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsSection}>
          <View style={styles.ratingOverview}>
            <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
            {renderStars(Math.round(averageRating))}
            <Text style={styles.totalReviews}>
              {totalReviews} évaluation{totalReviews > 1 ? 's' : ''}
            </Text>
          </View>

          <View style={styles.ratingBreakdown}>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter(r => r.rating === stars).length;
              const percentage = (count / totalReviews) * 100;

              return (
                <View key={stars} style={styles.ratingRow}>
                  <Text style={styles.ratingRowText}>{stars}</Text>
                  <Star size={12} color="#FBBF24" fill="#FBBF24" />
                  <View style={styles.ratingBar}>
                    <View 
                      style={[styles.ratingBarFill, { width: `${percentage}%` }]} 
                    />
                  </View>
                  <Text style={styles.ratingRowText}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Commentaires récents</Text>

          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                  {review.reviewerAvatar ? (
                    <Image 
                      source={{ uri: review.reviewerAvatar }} 
                      style={styles.reviewerAvatar}
                    />
                  ) : (
                    <View style={styles.reviewerAvatarPlaceholder}>
                      <Text style={styles.reviewerInitial}>
                        {review.reviewerName.charAt(0)}
                      </Text>
                    </View>
                  )}

                  <View style={styles.reviewerDetails}>
                    <Text style={styles.reviewerName}>{review.reviewerName}</Text>
                    <View style={styles.reviewMeta}>
                      {renderStars(review.rating)}
                      <Text style={styles.reviewDate}>• {formatDate(review.date)}</Text>
                    </View>
                  </View>
                </View>

                <View style={[
                  styles.reviewTypeBadge,
                  review.type === 'buyer' ? styles.buyerBadge : styles.sellerBadge
                ]}>
                  <Text style={styles.reviewTypeText}>
                    {review.type === 'buyer' ? 'Acheteur' : 'Vendeur'}
                  </Text>
                </View>
              </View>

              <Text style={styles.reviewComment}>{review.comment}</Text>
              <Text style={styles.transactionTitle}>
                Transaction: {review.transactionTitle}
              </Text>
            </View>
          ))}
        </View>
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
  statsSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
  },
  ratingOverview: {
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  averageRating: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: '#6B7280',
  },
  ratingBreakdown: {
    paddingTop: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingRowText: {
    fontSize: 14,
    color: '#374151',
    width: 20,
    textAlign: 'center',
  },
  ratingBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#FBBF24',
    borderRadius: 4,
  },
  reviewsSection: {
    backgroundColor: 'white',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  reviewItem: {
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reviewerInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  reviewTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  buyerBadge: {
    backgroundColor: '#DBEAFE',
  },
  sellerBadge: {
    backgroundColor: '#D1FAE5',
  },
  reviewTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  reviewComment: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  transactionTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});