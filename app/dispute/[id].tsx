import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Alert,
  Image
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, FileText, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/contexts/TransactionContext';

export default function DisputeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { getTransactionById, updateTransactionStatus } = useTransactions();
  
  const transaction = getTransactionById(id as string);
  const [disputeReason, setDisputeReason] = useState('');
  const [description, setDescription] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Transaction non trouvée</Text>
        </View>
      </SafeAreaView>
    );
  }

  const disputeReasons = [
    {
      id: 'not_as_described',
      title: 'Article non conforme',
      description: 'L\'article ne correspond pas à la description'
    },
    {
      id: 'damaged',
      title: 'Article endommagé',
      description: 'L\'article est arrivé endommagé'
    },
    {
      id: 'not_received',
      title: 'Article non reçu',
      description: 'Je n\'ai pas reçu l\'article'
    },
    {
      id: 'counterfeit',
      title: 'Article contrefait',
      description: 'L\'article semble être une contrefaçon'
    },
    {
      id: 'seller_unresponsive',
      title: 'Vendeur non réactif',
      description: 'Le vendeur ne répond pas aux messages'
    },
    {
      id: 'other',
      title: 'Autre',
      description: 'Autre problème non listé ci-dessus'
    }
  ];

  const handleSubmitDispute = async () => {
    if (!selectedReason) {
      Alert.alert('Erreur', 'Veuillez sélectionner une raison pour le litige');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Erreur', 'Veuillez décrire le problème en détail');
      return;
    }

    setIsSubmitting(true);
    try {
      const reasonText = disputeReasons.find(r => r.id === selectedReason)?.title || selectedReason;
      const fullReason = `${reasonText}: ${description.trim()}`;
      
      updateTransactionStatus(transaction.id, 'disputed', fullReason);
      
      Alert.alert(
        'Litige ouvert',
        'Votre litige a été ouvert avec succès. Notre équipe de médiation va examiner votre demande et contacter les deux parties.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'ouverture du litige');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#374151" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Signaler un problème</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.warningCard}>
          <AlertTriangle color="#F59E0B" size={24} />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Avant d'ouvrir un litige</Text>
            <Text style={styles.warningText}>
              Nous vous recommandons de d'abord essayer de résoudre le problème directement avec le vendeur via le chat. 
              Un litige ne devrait être ouvert qu'en dernier recours.
            </Text>
          </View>
        </View>

        <View style={styles.transactionCard}>
          <Text style={styles.sectionTitle}>Transaction concernée</Text>
          <Text style={styles.transactionTitle}>{transaction.title}</Text>
          <Text style={styles.transactionPrice}>
            {transaction.price.toLocaleString('fr-FR')} €
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quelle est la nature du problème ?</Text>
          <View style={styles.reasonsContainer}>
            {disputeReasons.map((reason) => (
              <TouchableOpacity
                key={reason.id}
                style={[
                  styles.reasonOption,
                  selectedReason === reason.id && styles.reasonOptionSelected
                ]}
                onPress={() => setSelectedReason(reason.id)}
              >
                <View style={styles.reasonContent}>
                  <Text style={[
                    styles.reasonTitle,
                    selectedReason === reason.id && styles.reasonTitleSelected
                  ]}>
                    {reason.title}
                  </Text>
                  <Text style={[
                    styles.reasonDescription,
                    selectedReason === reason.id && styles.reasonDescriptionSelected
                  ]}>
                    {reason.description}
                  </Text>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedReason === reason.id && styles.radioButtonSelected
                ]}>
                  {selectedReason === reason.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description détaillée *</Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder="Décrivez le problème en détail. Plus vous fournirez d'informations, plus nous pourrons vous aider efficacement."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <Text style={styles.helperText}>
            {description.length}/1000 caractères
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preuves (optionnel)</Text>
          <Text style={styles.sectionDescription}>
            Ajoutez des photos ou documents pour appuyer votre demande
          </Text>
          
          <View style={styles.evidenceContainer}>
            <TouchableOpacity style={styles.evidenceButton}>
              <Camera color="#6B7280" size={24} />
              <Text style={styles.evidenceButtonText}>Ajouter des photos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.evidenceButton}>
              <FileText color="#6B7280" size={24} />
              <Text style={styles.evidenceButtonText}>Ajouter des documents</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résolution souhaitée</Text>
          <Text style={styles.sectionDescription}>
            Que souhaitez-vous comme résolution à ce problème ?
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Remboursement complet, échange, réparation..."
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.submitSection}>
          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmitDispute}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Ouverture du litige...' : 'Ouvrir le litige'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.submitNote}>
            En ouvrant un litige, vous acceptez que notre équipe de médiation examine la transaction 
            et prenne une décision basée sur les preuves fournies par les deux parties.
          </Text>
        </View>
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
  scrollView: {
    flex: 1,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    margin: 24,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#92400E',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    lineHeight: 20,
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  transactionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  transactionPrice: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
  },
  reasonsContainer: {
    gap: 12,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  reasonOptionSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  reasonContent: {
    flex: 1,
  },
  reasonTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  reasonTitleSelected: {
    color: '#2563EB',
  },
  reasonDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  reasonDescriptionSelected: {
    color: '#1E40AF',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  radioButtonSelected: {
    borderColor: '#2563EB',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    height: 120,
    textAlignVertical: 'top',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'right',
  },
  evidenceContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  evidenceButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  submitSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  submitButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  submitNote: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
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