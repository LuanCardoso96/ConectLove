import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar,
  Animated, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator
} from 'react-native';
import { UserEntity } from '../Entities';

interface WelcomePageProps {
  navigation: {
    navigate: (route: string, params?: object) => void;
  };
}

const ROUTES = {
  ONBOARDING: 'Onboarding',
  MAIN: 'Main',
};

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: 'none' | 'words' | 'sentences' | 'characters';
  autoCorrect?: boolean;
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="rgba(255,255,255,0.7)"
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      accessible
      accessibilityLabel={label}
    />
  </View>
);

export default function WelcomePage({ navigation }: WelcomePageProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Animações separadas para melhor controle
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.timing(translateYAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, scaleAnim, translateYAnim]);

  const validateForm = () => {
    const { email, password, name } = formData;
    if (!email || !email.includes('@')) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return false;
    }
    if (!password || password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (!isLoginMode && (!name || name.length < 2)) {
      Alert.alert('Erro', 'O nome deve ter pelo menos 2 caracteres');
      return false;
    }
    return true;
  };

  const handleAction = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const mockUser = {
        id: '1',
        email: formData.email,
        plan: 'Free' as const,
        gender: 'Masculino',
        likes_today: 0,
        last_like_date: new Date().toISOString().split('T')[0],
      };

      const mockProfile = {
        id: 'user_profile_1',
        name: formData.name || 'Usuário Teste',
        age: 25,
        bio: 'Perfil de teste para demonstração',
        photos: ['https://i.pravatar.cc/500?u=testuser'],
        interests: ['Música', 'Viagem', 'Filmes'],
        gender: 'Masculino' as const,
        seeking: 'Feminino' as const,
        location_mock: 'Localização teste',
        is_verified: false,
        user_email: formData.email
      };

      if (isLoginMode) {
        await UserEntity.loginWithRedirect('/home');
        navigation.navigate(ROUTES.MAIN, { user: mockUser, profile: mockProfile });
      } else {
        await UserEntity.loginWithRedirect('/onboarding');
        navigation.navigate(ROUTES.ONBOARDING, { user: mockUser });
      }
    } catch (error) {
      Alert.alert('Erro', isLoginMode 
        ? 'Erro ao fazer login. Verifique suas credenciais.' 
        : 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.iconContainer,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Text style={styles.heartIcon}>♥</Text>
          </Animated.View>

          <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
            <Text style={styles.title}>Conexão Amorosa</Text>
            <Text style={styles.subtitle}>
              Encontre conexões reais. Deslize, combine e converse com pessoas incríveis perto de você.
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: translateYAnim }],
              },
            ]}
          >
            {!isLoginMode && (
              <InputField
                label="Nome"
                value={formData.name}
                onChangeText={text => setFormData({ ...formData, name: text })}
                placeholder="Seu nome completo"
                autoCapitalize="words"
              />
            )}

            <InputField
              label="Email"
              value={formData.email}
              onChangeText={text => setFormData({ ...formData, email: text })}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <InputField
              label="Senha"
              value={formData.password}
              onChangeText={text => setFormData({ ...formData, password: text })}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
              onPress={handleAction}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel={isLoginMode ? 'Entrar' : 'Criar Conta'}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isLoginMode ? 'Entrar' : 'Criar Conta'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setIsLoginMode(prev => !prev)}
              accessibilityRole="button"
              accessibilityLabel={isLoginMode ? 'Criar uma conta' : 'Entrar'}
            >
              <Text style={styles.secondaryButtonText}>
                {isLoginMode ? 'Não tem conta? Criar uma' : 'Já tem conta? Entrar'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Variáveis para cores para facilitar manutenção e padrão
const COLORS = {
  primary: '#EC4899',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heartIcon: {
    fontSize: 96,
    color: COLORS.white,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
    maxWidth: 350,
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.white,
  },
  primaryButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
