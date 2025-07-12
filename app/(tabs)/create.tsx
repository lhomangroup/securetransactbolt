import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/contexts/TransactionContext';
// // // let ImagePicker: any;
try {
  ImagePicker = require('expo-image-picker');
} catch (e) {
  console.warn('expo-image-picker not available');
  ImagePicker = {
    launchImageLibraryAsync: () => Promise.resolve({ canceled: true }),
    MediaTypeOptions: { Images: 'Images' }
  };
}

export default function CreateTransactionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { createTransaction } = useTransactions();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    inspectionPeriod: '3',
    deliveryAddress: '',
    otherPartyEmail: '',
    userRole: 'seller' as 'buyer' | 'seller',
  });

  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const updateFormData = <K extends keyof typeof formData>(key: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const pickImage = async () => {
    // Demander les permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission requise', 'L\'accès à la galerie est nécessaire pour ajouter des photos.');
      return;
    }

    // Ouvrir la galerie
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newImage = result.assets[0].uri;
      if (selectedImages.length < 5) { // Limite de 5 photos
        setSelectedImages(prev => [...prev, newImage]);
      } else {
        Alert.alert('Limite atteinte', 'Vous ne pouvez ajouter que 5 photos maximum.');
      }
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const { title, description, price, inspectionPeriod, otherPartyEmail, userRole } = formData;

    if (!title || !description || !price || !otherPartyEmail) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un prix valide');
      return;
    }

    try {
      const transactionData = {
        title,
        description,
        price: Number(price),
        status: 'pending_acceptance' as const,
        buyerId: userRole === 'buyer' ? user?.id || '' : 'temp_buyer_id',
        sellerId: userRole === 'seller' ? user?.id || '' : 'temp_seller_id',
        buyerName: userRole === 'buyer' ? user?.name || '' : 'Acheteur à confirmer',
        sellerName: userRole === 'seller' ? user?.name || '' : 'Vendeur à confirmer',
        inspectionPeriod: Number(inspectionPeriod),
        deliveryAddress: formData.deliveryAddress,
      };

      console.log('🔄 Création de la transaction en cours...');
      const transactionId = await createTransaction(transactionData);
      console.log('✅ Transaction créée avec l\'ID:', transactionId);
      
      Alert.alert(
        '✅ Succès !',
        `Votre transaction "${title}" a été créée avec succès.\n\nPrix: ${price}€\nL'autre partie (${otherPartyEmail}) va recevoir une notification.`,
        [
          {
            text: 'Voir mes transactions',
            onPress: () => {
              router.push('/(tabs)');
            },
          },
          {
            text: 'Créer une autre',
            style: 'cancel',
            onPress: () => {
              // Reset le formulaire
              setFormData({
                title: '',
                description: '',
                price: '',
                inspectionPeriod: '3',
                deliveryAddress: '',
                otherPartyEmail: '',
                userRole: 'seller',
              });
              setSelectedImages([]);
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ Erreur lors de la création:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la création de la transaction. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
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
        <Text style={styles.title}>Nouvelle transaction</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Type de transaction</Text>
            <View style={styles.roleContainer}>
              {[
                { key: 'seller', label: 'Je vends', description: 'Je propose un produit/service' },
                { key: 'buyer', label: 'J\'achète', description: 'Je cherche un produit/service' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.roleOption,
                    formData.userRole === option.key && styles.roleOptionSelected,
                  ]}
                  onPress={() => updateFormData('userRole', option.key as any)}
                >
                  <Text
                    style={[
                      styles.roleLabel,
                      formData.userRole === option.key && styles.roleLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={[
                      styles.roleDescription,
                      formData.userRole === option.key && styles.roleDescriptionSelected,
                    ]}
                  >
                    {option.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations générales</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Titre *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(value) => updateFormData('title', value)}
                placeholder="Ex: iPhone 14 Pro - Comme neuf"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => updateFormData('description', value)}
                placeholder="Décrivez en détail l'article ou le service..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Prix (€) *</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(value) => updateFormData('price', value)}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Paramètres de transaction</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Période d'inspection (jours)</Text>
              <View style={styles.inspectionContainer}>
                {['1', '3', '5', '7'].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.inspectionOption,
                      formData.inspectionPeriod === days && styles.inspectionOptionSelected,
                    ]}
                    onPress={() => updateFormData('inspectionPeriod', days)}
                  >
                    <Text
                      style={[
                        styles.inspectionText,
                        formData.inspectionPeriod === days && styles.inspectionTextSelected,
                      ]}
                    >
                      {days}j
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.helperText}>
                Durée pendant laquelle l'acheteur peut inspecter l'article
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Adresse de livraison</Text>
              <TextInput
                style={styles.input}
                value={formData.deliveryAddress}
                onChangeText={(value) => updateFormData('deliveryAddress', value)}
                placeholder="123 Rue de la Paix, 75001 Paris"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Autre partie</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Email de {formData.userRole === 'seller' ? 'l\'acheteur' : 'le vendeur'} *
              </Text>
              <TextInput
                style={styles.input}
                value={formData.otherPartyEmail}
                onChangeText={(value) => updateFormData('otherPartyEmail', value)}
                placeholder="email@exemple.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.helperText}>
                Cette personne recevra une invitation à rejoindre la transaction
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos (optionnel)</Text>
            
            {selectedImages.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewContainer}>
                {selectedImages.map((uri, index) => (
                  <View key={index} style={styles.imagePreviewWrapper}>
                    <Image source={{ uri }} style={styles.imagePreview} />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <X color="#FFFFFF" size={16} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
            
            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              <Camera color="#9CA3AF" size={24} />
              <Text style={styles.photoButtonText}>
                {selectedImages.length > 0 ? `Ajouter une photo (${selectedImages.length}/5)` : 'Ajouter des photos'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Créer la transaction</Text>
          </TouchableOpacity>
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
  form: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  roleContainer: {
    gap: 12,
  },
  roleOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  roleOptionSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  roleLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 4,
  },
  roleLabelSelected: {
    color: '#2563EB',
  },
  roleDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  roleDescriptionSelected: {
    color: '#1E40AF',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inspectionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  inspectionOption: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  inspectionOptionSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  inspectionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  inspectionTextSelected: {
    color: '#2563EB',
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 4,
  },
  photoButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginTop: 8,
  },
  imagePreviewContainer: {
    marginBottom: 16,
  },
  imagePreviewWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});