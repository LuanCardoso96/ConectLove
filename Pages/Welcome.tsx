import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Linking,
  AccessibilityInfo,
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
} as const;

type FormData = { email: string; password: string; name: string };

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const MIN_PASSWORD = 6;

const COLORS = {
  bgTop: '#F472B6',     // rosa claro
  bgBottom: '#DB2777',  // rosa escuro
  primary: '#EC4899',
  white: '#FFFFFF',
  ink: '#0f172a',
  muted: 'rgba(255,255,255,0.8)',
  fieldBg: 'rgba(255,255,255,0.18)',
  fieldBorder: 'rgba(255,255,255,0.32)',
  error: '#FFE4E6',
  errorText: '#7F1D1D',
  success: '#16a34a',
};

const ROUTE_ACCESS_LABEL = {
  login: 'Entrar',
  signup: 'Criar Conta',
};

type InputProps = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: 'none' | 'words' | 'sentences' | 'characters';
  autoCorrect?: boolean;
  error?: string | null;
  accessibilityLabel?: string;
  rightAdornment?: React.ReactNode;
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
  error = null,
  accessibilityLabel,
  rightAdornment,
}: InputProps) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel} accessibilityRole="text">
      {label}
    </Text>
    <View
      style={[
        styles.inputWrapper,
        !!error && styles.inputWrapperError,
      ]}
    >
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.65)"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        accessible
        accessibilityLabel={accessibilityLabel || label}
        returnKeyType="next"
      />
      {rightAdornment}
    </View>
    {!!error && <Text style={styles.inputError}>{error}</Text>}
  </View>
);

export default function WelcomePage({ navigation }: WelcomePageProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState<FormData>({ email: '', password: '', name: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const slideUpAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 60, useNativeDriver: true }),
      Animated.timing(slideUpAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start(() => {
      // Lê para acessibilidade quando a tela é montada
      AccessibilityInfo.announceForAccessibility?.('Bem-vindo ao ConectLove');
    });
  }, [fadeAnim, scaleAnim, slideUpAnim]);

  const modeTitle = useMemo(() => (isLoginMode ? 'Bem-vindo de volta' : 'Crie sua conta'), [isLoginMode]);
  const ctaLabel = useMemo(() => (isLoginMode ? ROUTE_ACCESS_LABEL.login : ROUTE_ACCESS_LABEL.signup), [isLoginMode]);

  const validateForm = (): boolean => {
    const { email, password, name } = formData;
    const newErrors: typeof errors = {};

    if (!EMAIL_REGEX.test(email.trim())) {
      newErrors.email = 'Insira um e-mail válido.';
    }
    if (!password || password.length < MIN_PASSWORD) {
      newErrors.password = `A senha precisa ter no mínimo ${MIN_PASSWORD} caracteres.`;
    }
    if (!isLoginMode) {
      if (!name || name.trim().length < 2) {
        newErrors.name = 'Seu nome precisa ter pelo menos 2 caracteres.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const safeNavigate = (route: string, params?: object) => {
    try {
      navigation.navigate(route, params);
    } catch {
      // evita crash caso navigation ainda não esteja pronto
    }
  };

  // Evita toque duplo
  const withLoading = async (fn: () => Promise<void>) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await fn();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = () =>
    withLoading(async () => {
      if (!validateForm()) {
        // foco nos erros
        const firstError = Object.values(errors)[0];
        if (firstError) AccessibilityInfo.announceForAccessibility?.(firstError);
        return;
      }

      try {
        // Simulação de usuário/perfil (mantenho sua estrutura)
        const mockUser = {
          id: '1',
          email: formData.email.trim(),
          plan: 'Free' as const,
          gender: 'Masculino',
          likes_today: 0,
          last_like_date: new Date().toISOString().split('T')[0],
        };

        const mockProfile = {
          id: 'user_profile_1',
          name: (formData.name || 'Usuário Teste').trim(),
          age: 25,
          bio: 'Perfil de demonstração do ConectLove',
          photos: ['https://i.pravatar.cc/500?u=conectlove-demo'],
          interests: ['Música', 'Viagem', 'Filmes'],
          gender: 'Masculino' as const,
          seeking: 'Feminino' as const,
          location_mock: 'São Paulo, Brasil',
          is_verified: false,
          user_email: formData.email.trim(),
        };

        // ====== ONDE VOCÊ PLUGA O AUTH REAL (Firebase/OAuth) ======
        // Ex.: Firebase Auth:
        // if (isLoginMode) await signInWithEmailAndPassword(auth, formData.email, formData.password);
        // else await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        // ==========================================================
        if (isLoginMode) {
          await UserEntity.loginWithRedirect('/home');
          safeNavigate(ROUTES.MAIN, { user: mockUser, profile: mockProfile });
        } else {
          await UserEntity.loginWithRedirect('/onboarding');
          safeNavigate(ROUTES.ONBOARDING, { user: mockUser });
        }
      } catch (error: any) {
        Alert.alert(
          'Ops!',
          isLoginMode
            ? 'Não foi possível entrar. Verifique suas credenciais.'
            : 'Não foi possível criar sua conta. Tente novamente.'
        );
      }
    });

  const handleForgotPassword = () => {
    // Aqui você pode abrir um modal, navegar para uma tela, ou chamar seu fluxo de reset.
    Alert.alert(
      'Redefinir senha',
      'Envie seu e-mail na página de login para receber instruções de redefinição.'
    );
  };

  const openLink = (url: string) => Linking.openURL(url).catch(() => {});

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgBottom} />
      {/* Fundo decorativo sem libs: blobs/círculos */}
      <View style={styles.bg}>
        <View style={styles.blobBig} />
        <View style={styles.blobSmall} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.headerWrap,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <View style={styles.logoCircle} accessibilityRole="image">
              <Text style={styles.heartIcon} accessibilityLabel="Coração">
                ♥
              </Text>
            </View>
            <Text style={styles.appName}>ConectLove</Text>
            <Text style={styles.subtitle} accessible>
              Conexões reais começam aqui. Descubra pessoas incríveis perto de você.
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
            ]}
            accessibilityLabel={modeTitle}
            accessible
          >
            <Text style={styles.cardTitle}>{modeTitle}</Text>

            {!isLoginMode && (
              <InputField
                label="Nome"
                value={formData.name}
                onChangeText={(t) => setFormData((s) => ({ ...s, name: t }))}
                placeholder="Seu nome completo"
                autoCapitalize="words"
                error={errors.name || null}
              />
            )}

            <InputField
              label="E-mail"
              value={formData.email}
              onChangeText={(t) => setFormData((s) => ({ ...s, email: t }))}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email || null}
            />

            <InputField
              label="Senha"
              value={formData.password}
              onChangeText={(t) => setFormData((s) => ({ ...s, password: t }))}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              error={errors.password || null}
              rightAdornment={
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  hitSlop={12}
                  style={styles.eyeBtn}
                >
                  <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
                </Pressable>
              }
            />

            {isLoginMode && (
              <Pressable
                onPress={handleForgotPassword}
                style={styles.forgotLink}
                accessibilityRole="button"
                accessibilityLabel="Esqueci minha senha"
              >
                <Text style={styles.forgotText}>Esqueci minha senha</Text>
              </Pressable>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
              onPress={handleAction}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel={ctaLabel}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={styles.primaryButtonText}>{ctaLabel}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow} accessible accessibilityRole="text">
              <View style={styles.divider} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.divider} />
            </View>

            {/* Botões sociais (placeholders para conectar depois) */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() => Alert.alert('Login com Google', 'Conecte aqui seu fluxo de OAuth.')}
                accessibilityRole="button"
                accessibilityLabel="Continuar com Google"
              >
                <Text style={styles.socialEmoji}>🟦</Text>
                <Text style={styles.socialText}>Continuar com Google</Text>
              </TouchableOpacity>
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.socialBtn}
                  onPress={() => Alert.alert('Login com Apple', 'Conecte aqui seu Sign in with Apple.')}
                  accessibilityRole="button"
                  accessibilityLabel="Continuar com Apple"
                >
                  <Text style={styles.socialEmoji}>🍎</Text>
                  <Text style={styles.socialText}>Continuar com Apple</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                setErrors({});
                setIsLoginMode((p) => !p);
              }}
              accessibilityRole="button"
              accessibilityLabel={isLoginMode ? 'Criar uma conta' : 'Entrar'}
            >
              <Text style={styles.secondaryButtonText}>
                {isLoginMode ? 'Não tem conta? Criar uma' : 'Já tem conta? Entrar'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.termsText} accessibilityRole="text">
              Ao continuar, você concorda com nossos{' '}
              <Text style={styles.link} onPress={() => openLink('https://conectlove.example/terms')}>
                Termos de Uso
              </Text>{' '}
              e{' '}
              <Text style={styles.link} onPress={() => openLink('https://conectlove.example/privacy')}>
                Política de Privacidade
              </Text>.
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =========================
   ESTILOS
   ========================= */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgBottom },
  flex: { flex: 1 },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.bgBottom,
  },
  blobBig: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 420,
    right: -160,
    top: -100,
    backgroundColor: COLORS.bgTop,
    opacity: 0.35,
  },
  blobSmall: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 260,
    left: -100,
    bottom: -60,
    backgroundColor: COLORS.bgTop,
    opacity: 0.28,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  headerWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 88,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },
  heartIcon: { fontSize: 40, color: COLORS.white },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  card: {
    marginTop: 22,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 20,
    padding: 18,
    maxWidth: 420,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  inputContainer: { marginBottom: 14 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.fieldBg,
    borderWidth: 1,
    borderColor: COLORS.fieldBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  inputWrapperError: {
    borderColor: COLORS.errorText,
    backgroundColor: 'rgba(255,0,0,0.06)',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.white,
  },
  eyeBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  eyeText: { fontSize: 16, color: COLORS.white, opacity: 0.9 },
  inputError: {
    marginTop: 6,
    color: COLORS.errorText,
    backgroundColor: COLORS.error,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    fontSize: 12.5,
  },
  forgotLink: { alignSelf: 'flex-end', marginTop: 4, marginBottom: 6 },
  forgotText: {
    color: COLORS.white,
    textDecorationLine: 'underline',
    fontSize: 13.5,
    opacity: 0.9,
  },
  primaryButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 15,
    borderRadius: 26,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primary,
  },
  buttonDisabled: { opacity: 0.7 },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  divider: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.35)' },
  dividerText: {
    marginHorizontal: 10,
    color: COLORS.white,
    opacity: 0.85,
    fontWeight: '600',
  },
  socialRow: { gap: 10 },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: COLORS.fieldBorder,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  socialEmoji: { fontSize: 18, color: COLORS.white },
  socialText: { color: COLORS.white, fontSize: 15.5, fontWeight: '700' },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 22,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    marginTop: 8,
  },
  secondaryButtonText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: COLORS.white,
  },
  termsText: {
    textAlign: 'center',
    color: COLORS.muted,
    fontSize: 12.5,
    marginTop: 12,
    lineHeight: 18,
  },
  link: { color: COLORS.white, textDecorationLine: 'underline' },
});
