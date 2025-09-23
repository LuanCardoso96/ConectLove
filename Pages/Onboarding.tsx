import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { UserEntity, ProfileEntity, Profile } from '../Entities';

const INTEREST_OPTIONS = ["Música", "Viagem", "Filmes", "Cozinhar", "Esportes", "Arte", "Tecnologia", "Leitura", "Fotografia", "Natureza"];

interface OnboardingPageProps {
  navigation?: any;
  route?: any;
}

export default function OnboardingPage({ navigation, route }: OnboardingPageProps) {
  const { currentUser } = route?.params || {};
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: 18,
    gender: '',
    seeking: '',
    bio: '',
    interests: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showSeekingPicker, setShowSeekingPicker] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Nome deve ter pelo menos 2 caracteres";
    }
    
    if (formData.age < 18 || formData.age > 99) {
      newErrors.age = "Você deve ter entre 18 e 99 anos";
    }
    
    if (!formData.gender) {
      newErrors.gender = "Selecione um gênero";
    }
    
    if (!formData.seeking) {
      newErrors.seeking = "Selecione sua preferência";
    }
    
    if (photos.length === 0) {
      newErrors.photos = "Adicione pelo menos uma foto";
    }
    
    if (formData.interests.length === 0) {
      newErrors.interests = "Selecione pelo menos um interesse";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoUpload = async () => {
    if (photos.length < 5) {
      setIsUploading(true);
      setTimeout(() => {
        setPhotos(prev => [...prev, `https://i.pravatar.cc/300?u=${Date.now()}`]);
        setIsUploading(false);
      }, 1000);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const toggleInterest = (interest: string) => {
    const currentInterests = formData.interests;
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : currentInterests.length < 5 
        ? [...currentInterests, interest]
        : currentInterests;
    
    setFormData(prev => ({ ...prev, interests: newInterests }));
  };

  const processSubmit = async () => {
    if (!validateForm()) return;

    try {
      const finalData: Profile = {
        ...formData,
        gender: formData.gender as 'Masculino' | 'Feminino' | 'Outro',
        seeking: formData.seeking as 'Masculino' | 'Feminino' | 'Ambos',
        photos: photos,
        user_email: currentUser?.email || 'user@example.com',
        location_mock: "São Paulo, SP",
      };
      
      await ProfileEntity.create(finalData);
      await UserEntity.updateMyUserData({ gender: formData.gender });
      
      Alert.alert('Sucesso', 'Perfil criado com sucesso!', [
        { text: 'OK', onPress: () => navigation?.navigate('Home') }
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao criar perfil. Tente novamente.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.heartIcon}>♥</Text>
          <Text style={styles.title}>Bem-vindo(a)!</Text>
          <Text style={styles.subtitle}>Vamos criar seu perfil.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Seu nome"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.row}>
            <View style={[styles.section, styles.halfWidth]}>
              <Text style={styles.label}>Idade</Text>
              <TextInput
                style={[styles.input, errors.age && styles.inputError]}
                value={formData.age.toString()}
                onChangeText={(text) => setFormData(prev => ({ ...prev, age: parseInt(text, 10) || 18 }))}
                keyboardType="numeric"
                placeholder="18"
              />
              {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
            </View>

            <View style={[styles.section, styles.halfWidth]}>
              <Text style={styles.label}>Gênero</Text>
              <TouchableOpacity
                style={[styles.pickerButton, errors.gender && styles.inputError]}
                onPress={() => setShowGenderPicker(true)}
              >
                <Text style={[styles.pickerText, !formData.gender && styles.placeholderText]}>
                  {formData.gender || 'Seu gênero'}
                </Text>
                <Text style={styles.chevronIcon}>⌄</Text>
              </TouchableOpacity>
              {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Busco por</Text>
            <TouchableOpacity
              style={[styles.pickerButton, errors.seeking && styles.inputError]}
              onPress={() => setShowSeekingPicker(true)}
            >
              <Text style={[styles.pickerText, !formData.seeking && styles.placeholderText]}>
                {formData.seeking || 'Preferência'}
              </Text>
              <Text style={styles.chevronIcon}>⌄</Text>
            </TouchableOpacity>
            {errors.seeking && <Text style={styles.errorText}>{errors.seeking}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Suas fotos (mínimo 1)</Text>
            <View style={styles.photoGrid}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri: photo }} style={styles.photo} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}
                  >
                    <Text style={styles.removePhotoIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {photos.length < 5 && (
                <TouchableOpacity
                  style={styles.addPhotoButton}
                  onPress={handlePhotoUpload}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#EC4899" />
                  ) : (
                    <Text style={styles.cameraIcon}>📷</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
            {errors.photos && <Text style={styles.errorText}>{errors.photos}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Bio (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
              placeholder="Conte um pouco sobre você..."
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Interesses (máximo 5)</Text>
            <View style={styles.interestsContainer}>
              {INTEREST_OPTIONS.map(interest => (
                <TouchableOpacity
                  key={interest}
                  style={[
                    styles.interestButton,
                    formData.interests.includes(interest) && styles.interestButtonSelected
                  ]}
                  onPress={() => toggleInterest(interest)}
                  disabled={!formData.interests.includes(interest) && formData.interests.length >= 5}
                >
                  <Text style={[
                    styles.interestButtonText,
                    formData.interests.includes(interest) && styles.interestButtonTextSelected
                  ]}>
                    {interest}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.interests && <Text style={styles.errorText}>{errors.interests}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, photos.length === 0 && styles.submitButtonDisabled]}
            onPress={processSubmit}
            disabled={photos.length === 0}
          >
            <Text style={styles.submitButtonText}>Criar Perfil e Começar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showGenderPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione seu gênero</Text>
            {['Masculino', 'Feminino', 'Outro'].map(gender => (
              <TouchableOpacity
                key={gender}
                style={styles.modalOption}
                onPress={() => {
                  setFormData(prev => ({ ...prev, gender }));
                  setShowGenderPicker(false);
                }}
              >
                <Text style={styles.modalOptionText}>{gender}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowGenderPicker(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showSeekingPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Busco por</Text>
            {[
              { value: 'Masculino', label: 'Homens' },
              { value: 'Feminino', label: 'Mulheres' },
              { value: 'Ambos', label: 'Ambos' }
            ].map(option => (
              <TouchableOpacity
                key={option.value}
                style={styles.modalOption}
                onPress={() => {
                  setFormData(prev => ({ ...prev, seeking: option.value }));
                  setShowSeekingPicker(false);
                }}
              >
                <Text style={styles.modalOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowSeekingPicker(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  heartIcon: {
    fontSize: 48,
    color: '#EC4899',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  pickerText: {
    fontSize: 16,
    color: '#1f2937',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  chevronIcon: {
    fontSize: 20,
    color: '#666',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoIcon: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: '#EC4899',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fdf2f8',
  },
  cameraIcon: {
    fontSize: 24,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'white',
  },
  interestButtonSelected: {
    backgroundColor: '#EC4899',
    borderColor: '#EC4899',
  },
  interestButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  interestButtonTextSelected: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#EC4899',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1f2937',
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  modalCancel: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});