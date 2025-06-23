import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CreditCard, Plus, MoveHorizontal as MoreHorizontal, Trash2, CreditCard as Edit, Shield, CircleCheck as CheckCircle } from 'lucide-react-native';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  name: string;
  details: string;
  lastFour: string;
  isDefault: boolean;
  expiryDate?: string;
  brand?: string;
}

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'Carte Visa',
      details: 'Visa se terminant par 4242',
      lastFour: '4242',
      isDefault: true,
      expiryDate: '12/26',
      brand: 'visa'
    },
    {
      id: '2',
      type: 'card',
      name: 'Carte Mastercard',
      details: 'Mastercard se terminant par 8888',
      lastFour: '8888',
      isDefault: false,
      expiryDate: '08/25',
      brand: 'mastercard'
    },
    {
      id: '3',
      type: 'bank',
      name: 'Compte Crédit Agricole',
      details: 'Compte se terminant par 1234',
      lastFour: '1234',
      isDefault: false
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCardData, setNewCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
    Alert.alert('Succès', 'Moyen de paiement par défaut mis à jour');
  };

  const handleDelete = (id: string) => {
    const method = paymentMethods.find(m => m.id === id);
    if (method?.isDefault) {
      Alert.alert('Erreur', 'Vous ne pouvez pas supprimer votre moyen de paiement par défaut');
      return;
    }

    Alert.alert(
      'Supprimer le moyen de paiement',
      'Êtes-vous sûr de vouloir supprimer ce moyen de paiement ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(prev => prev.filter(method => method.id !== id));
          }
        }
      ]
    );
  };

  const handleAddCard = () => {
    if (!newCardData.number || !newCardData.expiry || !newCardData.cvv || !newCardData.name) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    const newCard: PaymentMethod = {
      id: Date.now().toString(),
      type: 'card',
      name: `Carte ${newCardData.name}`,
      details: `Carte se terminant par ${newCardData.number.slice(-4)}`,
      lastFour: newCardData.number.slice(-4),
      isDefault: paymentMethods.length === 0,
      expiryDate: newCardData.expiry,
      brand: 'visa' // Détection automatique en production
    };

    setPaymentMethods(prev => [...prev, newCard]);
    setNewCardData({ number: '', expiry: '', cvv: '', name: '' });
    setShowAddForm(false);
    Alert.alert('Succès', 'Carte ajoutée avec succès');
  };

  const getCardIcon = (brand?: string) => {
    // En production, utiliser les vraies icônes des marques
    return <CreditCard color="#374151" size={24} />;
  };

  const renderPaymentMethod = ({ item }: { item: PaymentMethod }) => (
    <View style={styles.paymentMethodCard}>
      <View style={styles.methodHeader}>
        <View style={styles.methodIcon}>
          {getCardIcon(item.brand)}
        </View>
        <View style={styles.methodInfo}>
          <Text style={styles.methodName}>{item.name}</Text>
          <Text style={styles.methodDetails}>{item.details}</Text>
          {item.expiryDate && (
            <Text style={styles.methodExpiry}>Expire le {item.expiryDate}</Text>
          )}
        </View>
        <View style={styles.methodActions}>
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <CheckCircle color="#10B981" size={16} />
              <Text style={styles.defaultText}>Par défaut</Text>
            </View>
          )}
          <TouchableOpacity style={styles.moreButton}>
            <MoreHorizontal color="#9CA3AF" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.methodFooter}>
        {!item.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(item.id)}
          >
            <Text style={styles.actionButtonText}>Définir par défaut</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
        >
          <Edit color="#6B7280" size={16} />
          <Text style={styles.actionButtonText}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
        >
          <Trash2 color="#EF4444" size={16} />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
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
        <Text style={styles.title}>Moyens de paiement</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Plus color="#2563EB" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.securityBanner}>
        <Shield color="#10B981" size={20} />
        <Text style={styles.securityText}>
          Vos informations de paiement sont sécurisées et cryptées
        </Text>
      </View>

      {showAddForm && (
        <View style={styles.addForm}>
          <Text style={styles.formTitle}>Ajouter une carte</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Numéro de carte"
            placeholderTextColor="#9CA3AF"
            value={newCardData.number}
            onChangeText={(text) => setNewCardData(prev => ({ ...prev, number: text }))}
            keyboardType="numeric"
            maxLength={19}
          />
          
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="MM/AA"
              placeholderTextColor="#9CA3AF"
              value={newCardData.expiry}
              onChangeText={(text) => setNewCardData(prev => ({ ...prev, expiry: text }))}
              maxLength={5}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="CVV"
              placeholderTextColor="#9CA3AF"
              value={newCardData.cvv}
              onChangeText={(text) => setNewCardData(prev => ({ ...prev, cvv: text }))}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Nom sur la carte"
            placeholderTextColor="#9CA3AF"
            value={newCardData.name}
            onChangeText={(text) => setNewCardData(prev => ({ ...prev, name: text }))}
          />
          
          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowAddForm(false);
                setNewCardData({ number: '', expiry: '', cvv: '', name: '' });
              }}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddCard}
            >
              <Text style={styles.saveButtonText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={paymentMethods}
        renderItem={renderPaymentMethod}
        keyExtractor={(item) => item.id}
        style={styles.methodsList}
        contentContainerStyle={styles.methodsContent}
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
  addButton: {
    padding: 8,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 12,
  },
  securityText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#065F46',
    flex: 1,
  },
  addForm: {
    backgroundColor: '#FFFFFF',
    margin: 24,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#2563EB',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  methodsList: {
    flex: 1,
  },
  methodsContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  paymentMethodCard: {
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
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  methodIcon: {
    width: 48,
    height: 32,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  methodDetails: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 2,
  },
  methodExpiry: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  methodActions: {
    alignItems: 'flex-end',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    gap: 4,
  },
  defaultText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#065F46',
  },
  moreButton: {
    padding: 4,
  },
  methodFooter: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  deleteButtonText: {
    color: '#EF4444',
  },
});