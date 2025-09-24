import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
  Dimensions,
  Animated,
  PanResponder,
  Easing,
  Alert,
  AccessibilityInfo,
  ImageStyle,
} from 'react-native';
import { LikeEntity, MatchEntity, UserEntity, Profile } from '../Entities';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width * 0.92, 420);
const CARD_HEIGHT = Math.min(height * 0.74, 680);

const LIKE_LIMITS = {
  Free: { Masculino: 20, Feminino: 40, Outro: 30 },
  Premium: 100,
  Diamante: 500,
} as const;

// Gêneros compatíveis com a interface Profile
const GENDERS = ['Feminino', 'Masculino', 'Outro'] as const;
type Gender = typeof GENDERS[number];

interface HomePageProps {
  navigation?: any;
  route?: { params?: { currentUser ?: any; profile?: Profile; seeking?: ('Masculino' | 'Feminino' | 'Ambos')[] } };
}

/** ---------- Mock de perfis (melhorado com mais gêneros para inclusão) ---------- */
const generateMockProfiles = (): Profile[] => {
  const profiles: Profile[] = [];
  const names: Record<Gender, string[]> = {
    Feminino: ['Ana', 'Maria', 'Sofia', 'Julia', 'Camila', 'Beatriz', 'Larissa', 'Fernanda', 'Gabriela', 'Isabella'],
    Masculino: ['Carlos', 'João', 'Pedro', 'Lucas', 'Mateus', 'Rafael', 'Diego', 'Bruno', 'Felipe', 'Thiago'],
    Outro: ['Alex', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Morgan', 'Quinn', 'Avery', 'Jamie', 'Cameron'],
  };
  const bios = [
    'Apaixonado(a) por viagens e boa comida. Buscando conexões reais.',
    'Amante de livros e café. Vamos conversar sobre o universo?',
    'Aventureiro(a) e fã de esportes. Procuro alguém para compartilhar risadas.',
    'Artista de coração. Música e criatividade são minha vibe.',
    'Gamer e cinéfilo(a). Match perfeito para maratonas noturnas.',
  ];
  const interestsBase = ['Viagem', 'Cozinhar', 'Filmes', 'Pets', 'Música', 'Livros', 'Esportes', 'Arte', 'Games'];
  const timestamp = Date.now();

  for (let i = 1; i <= 50; i++) {
    const gender = GENDERS[Math.floor(Math.random() * GENDERS.length)] as Gender;
    const nameList = names[gender];
    const name = nameList[Math.floor(Math.random() * nameList.length)];

    // Seeking compatível com interface Profile
    const seekingOptions: ('Masculino' | 'Feminino' | 'Ambos')[] = ['Masculino', 'Feminino', 'Ambos'];
    const seeking = seekingOptions[Math.floor(Math.random() * seekingOptions.length)];

    profiles.push({
      id: `mock_${timestamp}_${i}`,
      name: `${name} ${i}`,
      age: 18 + Math.floor(Math.random() * 25), // Idade mais realista (18-42)
      bio: `${bios[Math.floor(Math.random() * bios.length)]} #${i}`,
      photos: [`https://i.pravatar.cc/800?u=${timestamp}_${i}`],
      interests: interestsBase.sort(() => 0.5 - Math.random()).slice(0, 2 + Math.floor(Math.random() * 3)),
      gender,
      seeking: seeking,
      location_mock: `${Math.floor(Math.random() * 50) + 1} km de distância`,
      is_verified: Math.random() > 0.7, // Maior chance de verificado
      user_email: `user${timestamp}_${i}@example.com`,
    });
  }
  return profiles;
};

/** ---------- Card com swipe real (deck) ---------- */
const SWIPE_THRESHOLD = width * 0.25;
const ROTATION = 12; // graus

export default function HomePage({ route }: HomePageProps) {
  const { currentUser , profile } = route?.params || {};
  // Preferências de busca: assumido como array de gêneros selecionados pelo usuário
  // Pode vir de params ou ser gerenciado em estado global (ex: Redux/Context)
  const userSeeking = useMemo(() => 
    route?.params?.seeking || currentUser ?.seeking || ['Feminino', 'Masculino'] as ('Masculino' | 'Feminino' | 'Ambos')[],
    [route?.params?.seeking, currentUser ?.seeking]
  );
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [index, setIndex] = useState(0); // topo do deck
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<'like' | 'pass' | 'super-like' | 'match' | 'limit' | null>(null);
  const [likesLeft, setLikesLeft] = useState(0);
  const [showUpsell, setShowUpsell] = useState(false);

  // Animations
  const position = useRef(new Animated.ValueXY()).current;
  const nextCardScale = useRef(new Animated.Value(0.96)).current;
  const nextCardOpacity = useRef(new Animated.Value(0.85)).current;
  const feedbackOpacity = useRef(new Animated.Value(0)).current;

  // PanResponder para swipe
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        const { dx } = gesture;
        if (dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const rotate = position.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: [`-${ROTATION}deg`, '0deg', `${ROTATION}deg`],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const passOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const topCardStyle = {
    transform: [...position.getTranslateTransform(), { rotate }],
  };

  /** --------- Helpers --------- */
  const calcLikesLeft = useCallback(
    (user: any) => {
      const today = new Date().toISOString().split('T')[0];
      let userLikes = user?.likes_today || 0;
      if (user?.last_like_date !== today) userLikes = 0;

      const plan = (user?.plan || 'Free') as keyof typeof LIKE_LIMITS;
      const planLimits = LIKE_LIMITS[plan];

      // Limite por gênero do USUÁRIO (agora com mais gêneros)
      const userGender = user?.gender || 'Outro';
      const maxLikes = typeof planLimits === 'number' ? planLimits : (planLimits as any)[userGender] ?? 20;

      return { today, maxLikes, userLikes, left: Math.max(0, maxLikes - userLikes) };
    },
    []
  );

  const preloadNextImage = useCallback(
    (idx: number, list: Profile[]) => {
      const next = list[idx + 1];
      if (next?.photos?.[0]) {
        Image.prefetch(next.photos[0]).catch(() => {});
      }
    },
    []
  );

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    try {
      // Reset likes se virou o dia
      const { today, left } = calcLikesLeft(currentUser );
      if (currentUser ?.last_like_date !== today) {
        await UserEntity.updateMyUserData({ likes_today: 0, last_like_date: today });
      }
      setLikesLeft(left);

      // Mock + filtro por e-mail E por preferências de gênero do usuário
      const mock = generateMockProfiles();
      const filteredByEmail = mock.filter((p) => p.user_email !== currentUser ?.email);
      // Filtro principal: só mostra perfis cujo gênero está nas preferências do usuário
      const filteredBySeeking = filteredByEmail.filter((p) => {
        if (userSeeking.includes('Ambos')) return true;
        return userSeeking.includes(p.gender as any);
      });
      setProfiles(filteredBySeeking);
      setIndex(0);

      // Preload próxima
      preloadNextImage(0, filteredBySeeking);
    } catch (e) {
      const mock = generateMockProfiles();
      const filteredBySeeking = mock.filter((p) => {
        if (userSeeking.includes('Ambos')) return true;
        return userSeeking.includes(p.gender as any);
      });
      setProfiles(filteredBySeeking);
      setIndex(0);
    } finally {
      setIsLoading(false);
    }
  }, [calcLikesLeft, currentUser , preloadNextImage, userSeeking]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  useEffect(() => {
    if (feedback) {
      Animated.timing(feedbackOpacity, { toValue: 1, duration: 120, useNativeDriver: true }).start(() => {
        setTimeout(() => {
          Animated.timing(feedbackOpacity, { toValue: 0, duration: 160, useNativeDriver: true }).start();
        }, feedback === 'match' ? 1600 : 500);
      });
    }
  }, [feedback, feedbackOpacity]);

  /** --------- Swipe programático --------- */
  const forceSwipe = (direction: 'left' | 'right') => {
    const x = direction === 'right' ? width * 1.3 : -width * 1.3;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 240,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => onSwipeComplete(direction));
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const advanceDeck = () => {
    position.setValue({ x: 0, y: 0 });
    setIndex((i) => {
      const next = i + 1;
      // Anima o cartão próximo
      nextCardScale.setValue(0.96);
      nextCardOpacity.setValue(0.85);
      Animated.parallel([
        Animated.spring(nextCardScale, { toValue: 1, useNativeDriver: true, friction: 7 }),
        Animated.timing(nextCardOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
      return next;
    });
  };

  const onSwipeComplete = async (direction: 'left' | 'right') => {
    const current = profiles[index];
    if (!current) return;

    const type = direction === 'right' ? 'like' : 'pass';
    await handleSwipe(type, current);
    advanceDeck();
    preloadNextImage(index + 1, profiles);
  };

  /** --------- Lógica de like/match --------- */
  const handleSwipe = async (type: 'like' | 'pass' | 'super-like', likedProfile: Profile) => {
    const user = currentUser ;
    if (!profile || (!canSpendLike(type, user) && type !== 'pass')) {
      setFeedback('limit');
      setShowUpsell(true);
      AccessibilityInfo.announceForAccessibility?.('Seus likes de hoje acabaram.');
      return;
    }

    setFeedback(type);

    try {
      await LikeEntity.create({
        liker_profile_id: profile.id!,
        liked_profile_id: likedProfile.id!,
        type,
      });
      
      if (type === 'like' || type === 'super-like') {
        const today = new Date().toISOString().split('T')[0];
        const updatedLikes = (user?.likes_today || 0) + 1;
        await UserEntity.updateMyUserData({ likes_today: updatedLikes, last_like_date: today });
        setLikesLeft((prev) => Math.max(0, prev - 1));
        
        const theyLikedMe = await LikeEntity.filter({
          liker_profile_id: { eq: likedProfile.id },
          liked_profile_id: { eq: profile.id },
          type: { in: ['like', 'super-like'] },
        });

        if (theyLikedMe.length > 0) {
          setFeedback('match');
          await MatchEntity.create({ profile1_id: profile.id!, profile2_id: likedProfile.id! });
        }
      }
    } catch (error) {
      // Evita travar UI
      if (__DEV__) console.warn('Erro em handleSwipe:', error);
    }
  };

  const canSpendLike = (type: 'like' | 'pass' | 'super-like', _user: any) => {
    if (type === 'pass') return true;
    return likesLeft > 0;
  };

  /** --------- UI Auxiliares --------- */
  const activeProfile = profiles[index];
  const nextProfile = profiles[index + 1];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <TopBar onSettings={() => Alert.alert('Configurações', `Preferências atuais: ${userSeeking.join(', ')}\nAjuste em Perfil > Preferências.`)} />
        <View style={styles.loadingWrap}>
          <View style={styles.skeletonCard} />
          <Text style={styles.loadingText}>Carregando perfis compatíveis...</Text>
          <ActivityIndicator size="large" color="#EC4899" />
        </View>
      </SafeAreaView>
    );
  }

  if (!activeProfile) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <TopBar onSettings={() => Alert.alert('Configurações', `Preferências atuais: ${userSeeking.join(', ')}\nAjuste em Perfil > Preferências.`)} />
        <EmptyState onReload={fetchProfiles} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TopBar onSettings={() => Alert.alert('Configurações', `Preferências atuais: ${userSeeking.join(', ')}\nAjuste em Perfil > Preferências.`)} />
      <View style={styles.content}>
        {/* Indicador de preferências (opcional, para UX) */}
        <View style={styles.preferencesIndicator}>
          <Text style={styles.preferencesText}>Mostrando: {userSeeking.join(', ')}</Text>
        </View>

        {/* Próximo cartão (abaixo, com scale/opacity) */}
        {nextProfile && (
          <Animated.View
            style={[
              styles.card,
              styles.cardShadow,
              { transform: [{ scale: nextCardScale }], opacity: nextCardOpacity },
            ]}
            accessible
            accessibilityLabel={`Próximo perfil: ${nextProfile.name}, ${nextProfile.gender}`}
          >
            <CardImage uri={nextProfile.photos?.[0]} />
            <CardBottom profile={nextProfile} />
          </Animated.View>
        )}

        {/* Cartão ativo com gesto */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.card, styles.cardShadow, topCardStyle]}
          accessibilityHint="Arraste para a direita para curtir, para a esquerda para passar"
          accessible
          accessibilityLabel={`Perfil: ${activeProfile.name}, ${activeProfile.gender}`}
        >
          <CardImage uri={activeProfile.photos?.[0]} />

          {/* Ribbons LIKE / PASS durante o gesto */}
          <Animated.View style={[styles.ribbon, styles.ribbonLike, { opacity: likeOpacity }]}>
            <Text style={styles.ribbonText}>LIKE</Text>
          </Animated.View>
          <Animated.View style={[styles.ribbon, styles.ribbonPass, { opacity: passOpacity }]}>
            <Text style={styles.ribbonText}>PASS</Text>
          </Animated.View>

          <CardBottom profile={activeProfile} />
        </Animated.View>

        {/* Overlay de feedback rápido */}
        {feedback && (
          <Animated.View style={[styles.feedbackOverlay, { opacity: feedbackOpacity }]}>
            <Feedback type={feedback} />
          </Animated.View>
        )}

        {/* Rodapé com ações */}
        <FooterActions
          likesLeft={likesLeft}
          canBoost={currentUser ?.plan === 'Diamante'}
          canRewind={currentUser ?.plan !== 'Free'}
          onPass={() => forceSwipe('left')}
          onLike={() => forceSwipe('right')}
          onSuperLike={async () => {
            if (!canSpendLike('super-like', currentUser )) {
              setFeedback('limit');
              setShowUpsell(true);
              return;
            }
            setFeedback('super-like');
            await handleSwipe('super-like', activeProfile);
            advanceDeck();
          }}
          onRewind={() => Alert.alert('Rewind', 'Função disponível para Premium.')}
          onBoost={() => Alert.alert('Boost', 'Função disponível para Diamante.')}
        />

        {/* Upsell quando acabar likes */}
        {showUpsell && (
          <UpsellBanner
            onClose={() => setShowUpsell(false)}
            onUpgrade={() => Alert.alert('Upgrade', 'Direcione para tela de planos.')}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

/** ---------- Subcomponentes UI ---------- */

function TopBar({ onSettings }: { onSettings?: () => void }) {
  return (
    <View style={styles.topBar}>
      <Text style={styles.brandHeart}>♥</Text>
      <Text style={styles.brand}>ConectLove</Text>
      <TouchableOpacity onPress={onSettings} style={styles.settingsBtn}>
        <Text style={styles.settingsIcon}>⚙️</Text>
      </TouchableOpacity>
    </View>
  );
}

function CardImage({ uri }: { uri?: string }) {
  const [loading, setLoading] = useState(true);
  return (
    <View style={styles.cardImageWrap}>
      {!!uri && (
        <Image
          source={{ uri }}
          style={styles.cardImage as ImageStyle}
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
        />
      )}
      {loading && (
        <View style={styles.imageLoading}>
          <ActivityIndicator size="small" color="#EC4899" />
        </View>
      )}
    </View>
  );
}

function EmptyState({ onReload }: { onReload: () => void }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Nenhum perfil encontrado</Text>
      <Text style={styles.emptySubtitle}>Tente ajustar suas preferências ou recarregar</Text>
      <TouchableOpacity style={styles.reloadButton} onPress={onReload}>
        <Text style={styles.reloadButtonText}>Recarregar</Text>
      </TouchableOpacity>
    </View>
  );
}

function CardBottom({ profile }: { profile: Profile }) {
  return (
    <View style={styles.cardBottom}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{profile.name}</Text>
        <Text style={styles.cardAge}>{profile.age}</Text>
        {profile.is_verified && <Text style={styles.verifiedIcon}>✓</Text>}
      </View>
      <Text style={styles.cardBio} numberOfLines={2}>{profile.bio}</Text>
      <View style={styles.interestsContainer}>
        {profile.interests.slice(0, 3).map((interest, index) => (
          <View key={index} style={styles.interestTag}>
            <Text style={styles.interestText}>{interest}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.locationText}>{profile.location_mock}</Text>
    </View>
  );
}

function Feedback({ type }: { type: 'like' | 'pass' | 'super-like' | 'match' | 'limit' }) {
  const getFeedbackConfig = () => {
    switch (type) {
      case 'like':
        return { text: 'LIKE!', color: '#4CAF50', icon: '❤️' };
      case 'pass':
        return { text: 'PASS', color: '#F44336', icon: '👎' };
      case 'super-like':
        return { text: 'SUPER LIKE!', color: '#2196F3', icon: '⭐' };
      case 'match':
        return { text: 'MATCH!', color: '#EC4899', icon: '🎉' };
      case 'limit':
        return { text: 'LIMITE ATINGIDO', color: '#FF9800', icon: '⚠️' };
      default:
        return { text: '', color: '#000', icon: '' };
    }
  };

  const config = getFeedbackConfig();
  
  return (
    <View style={[styles.feedbackContainer, { backgroundColor: config.color }]}>
      <Text style={styles.feedbackIcon}>{config.icon}</Text>
      <Text style={styles.feedbackText}>{config.text}</Text>
    </View>
  );
}

function FooterActions({ 
  likesLeft, 
  canBoost, 
  canRewind, 
  onPass, 
  onLike, 
  onSuperLike, 
  onRewind, 
  onBoost 
}: {
  likesLeft: number;
  canBoost: boolean;
  canRewind: boolean;
  onPass: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  onRewind: () => void;
  onBoost: () => void;
}) {
  return (
    <View style={styles.footerActions}>
      <View style={styles.likesCounter}>
        <Text style={styles.likesCounterText}>{likesLeft} likes restantes</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={onPass}>
          <Text style={styles.actionButtonText}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onRewind} disabled={!canRewind}>
          <Text style={[styles.actionButtonText, !canRewind && styles.disabledButton]}>↶</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onSuperLike}>
          <Text style={styles.actionButtonText}>⭐</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onLike}>
          <Text style={styles.actionButtonText}>❤️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onBoost} disabled={!canBoost}>
          <Text style={[styles.actionButtonText, !canBoost && styles.disabledButton]}>⚡</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function UpsellBanner({ onClose, onUpgrade }: { onClose: () => void; onUpgrade: () => void }) {
  return (
    <View style={styles.upsellBanner}>
      <Text style={styles.upsellTitle}>Acabaram seus likes!</Text>
      <Text style={styles.upsellSubtitle}>Upgrade para ver mais perfis</Text>
      <View style={styles.upsellButtons}>
        <TouchableOpacity style={styles.upsellButton} onPress={onUpgrade}>
          <Text style={styles.upsellButtonText}>Upgrade</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  brandHeart: {
    fontSize: 24,
    color: '#EC4899',
  },
  brand: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsBtn: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  preferencesIndicator: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  preferencesText: {
    fontSize: 14,
    color: '#666',
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  cardImageWrap: {
    flex: 1,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  } as ImageStyle,
  imageLoading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
  cardBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  cardAge: {
    fontSize: 20,
    color: '#fff',
    marginRight: 8,
  },
  verifiedIcon: {
    fontSize: 16,
    color: '#4CAF50',
  },
  cardBio: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
    lineHeight: 22,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  interestTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 4,
  },
  interestText: {
    fontSize: 12,
    color: '#fff',
  },
  locationText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  ribbon: {
    position: 'absolute',
    top: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    transform: [{ rotate: '-15deg' }],
  },
  ribbonLike: {
    backgroundColor: '#4CAF50',
    right: 20,
  },
  ribbonPass: {
    backgroundColor: '#F44336',
    left: 20,
  },
  ribbonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  feedbackOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -25 }],
    zIndex: 1000,
  },
  feedbackContainer: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  feedbackIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  footerActions: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  likesCounter: {
    marginBottom: 20,
  },
  likesCounterText: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 24,
  },
  disabledButton: {
    opacity: 0.3,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  reloadButton: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  reloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  upsellBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#EC4899',
    padding: 20,
    alignItems: 'center',
  },
  upsellTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  upsellSubtitle: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 15,
  },
  upsellButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upsellButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 15,
  },
  upsellButtonText: {
    color: '#EC4899',
    fontSize: 14,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});