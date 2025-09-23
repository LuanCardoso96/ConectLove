import React, { useCallback, useEffect, useRef, useState } from 'react';
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

interface HomePageProps {
  navigation?: any;
  route?: { params?: { currentUser?: any; profile?: Profile } };
}

/** ---------- Mock de perfis (mantido e melhorado) ---------- */
const generateMockProfiles = (): Profile[] => {
  const profiles: Profile[] = [];
  const genders: ('Feminino' | 'Masculino')[] = ['Feminino', 'Masculino'];
  const names = {
    Feminino: ['Ana', 'Maria', 'Sofia', 'Julia', 'Camila', 'Beatriz', 'Larissa', 'Fernanda', 'Gabriela', 'Isabella'],
    Masculino: ['Carlos', 'João', 'Pedro', 'Lucas', 'Mateus', 'Rafael', 'Diego', 'Bruno', 'Felipe', 'Thiago'],
  };
  const timestamp = Date.now();

  for (let i = 1; i <= 50; i++) {
    const gender = genders[i % 2];
    const nameList = names[gender];
    const name = nameList[(i + Math.floor(timestamp / 1000)) % nameList.length];

    profiles.push({
      id: `mock_${timestamp}_${i}`,
      name: `${name} ${i}`,
      age: 20 + (i % 15),
      bio: `Apaixonado(a) por viagens e boa comida. Buscando conexões reais. #${i}`,
      photos: [`https://i.pravatar.cc/800?u=${timestamp}_${i}`],
      interests: ['Viagem', 'Cozinhar', 'Filmes', 'Pets', 'Música'].slice(0, 1 + (i % 4)),
      gender,
      seeking: gender === 'Feminino' ? 'Masculino' : 'Feminino',
      location_mock: `${i * 2} km de distância`,
      is_verified: i % 5 === 0,
      user_email: `user${timestamp}_${i}@example.com`,
    });
  }
  return profiles;
};

/** ---------- Card com swipe real (deck) ---------- */
const SWIPE_THRESHOLD = width * 0.25;
const ROTATION = 12; // graus

export default function HomePage({ route }: HomePageProps) {
  const { currentUser, profile } = route?.params || {};
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

      // Limite por gênero do USUÁRIO (correção do seu código)
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
      const { today, left } = calcLikesLeft(currentUser);
      if (currentUser?.last_like_date !== today) {
        await UserEntity.updateMyUserData({ likes_today: 0, last_like_date: today });
      }
      setLikesLeft(left);

      // Mock + filtro por e-mail
      const mock = generateMockProfiles();
      const filtered = mock.filter((p) => p.user_email !== currentUser?.email);
      setProfiles(filtered);
      setIndex(0);

      // Preload próxima
      preloadNextImage(0, filtered);
    } catch (e) {
      const mock = generateMockProfiles();
      setProfiles(mock);
      setIndex(0);
    } finally {
      setIsLoading(false);
    }
  }, [calcLikesLeft, currentUser, preloadNextImage]);

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
    const user = currentUser;
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
        <TopBar />
        <View style={styles.loadingWrap}>
          <View style={styles.skeletonCard} />
          <Text style={styles.loadingText}>Carregando perfis...</Text>
          <ActivityIndicator size="large" color="#EC4899" />
        </View>
      </SafeAreaView>
    );
  }

  if (!activeProfile) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <TopBar />
        <EmptyState onReload={fetchProfiles} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TopBar />
      <View style={styles.content}>
        {/* Próximo cartão (abaixo, com scale/opacity) */}
        {nextProfile && (
          <Animated.View
            style={[
              styles.card,
              styles.cardShadow,
              { transform: [{ scale: nextCardScale }], opacity: nextCardOpacity },
            ]}
            accessible accessibilityLabel={`Próximo perfil: ${nextProfile.name}`}
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
          canBoost={currentUser?.plan === 'Diamante'}
          canRewind={currentUser?.plan !== 'Free'}
          onPass={() => forceSwipe('left')}
          onLike={() => forceSwipe('right')}
          onSuperLike={async () => {
            if (!canSpendLike('super-like', currentUser)) {
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

function TopBar() {
  return (
    <View style={styles.topBar}>
      <Text style={styles.brandHeart}>♥</Text>
      <Text style={styles.brand}>ConectLove</Text>
      <View style={styles.brandSpacer} />
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
          style={styles.cardImage}
          onLoadEnd={() => setLoading(false)}
          resizeMode="cover"
        />
      )}
      {loading && <View style={styles.imageSkeleton} />}
    </View>
  );
}

function CardBottom({ profile }: { profile: Profile }) {
  return (
      <View style={styles.cardOverlay}>
        <View style={styles.cardInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.cardName}>
            {profile.name}, {profile.age}
          </Text>
          {profile.is_verified && <Text style={styles.verified}>✓</Text>}
          </View>
          <Text style={styles.cardLocation}>{profile.location_mock}</Text>
        <Text style={styles.cardBio} numberOfLines={2}>
          {profile.bio}
        </Text>
        <View style={styles.interests}>
          {profile.interests?.slice(0, 3).map((it, i) => (
            <View key={`${it}-${i}`} style={styles.tag}>
              <Text style={styles.tagText}>{it}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function FooterActions({
  likesLeft,
  canRewind,
  canBoost,
  onPass,
  onLike,
  onSuperLike,
  onRewind,
  onBoost,
}: {
  likesLeft: number;
  canRewind: boolean;
  canBoost: boolean;
  onPass: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  onRewind: () => void;
  onBoost: () => void;
}) {
  return (
    <View style={styles.bottom}>
      <Text style={styles.likesLabel}>
        Likes hoje: <Text style={styles.likesNumber}>{likesLeft}</Text>
      </Text>
      <View style={styles.actionsRow}>
        <ActionButton icon="↺" size="small" enabled={canRewind} onPress={onRewind} />
        <ActionButton icon="✕" onPress={onPass} />
        <ActionButton icon="★" color="blue" onPress={onSuperLike} />
        <ActionButton icon="♥" onPress={onLike} />
        <ActionButton icon="⚡" size="small" enabled={canBoost} color="purple" onPress={onBoost} />
      </View>
    </View>
  );
}

function ActionButton({
  icon, 
  onPress, 
  size = 'large', 
  color = 'default', 
  enabled = true,
}: { 
  icon: string; 
  onPress: () => void; 
  size?: 'large' | 'small'; 
  color?: 'default' | 'blue' | 'purple'; 
  enabled?: boolean;
}) {
  const s = size === 'large' ? styles.btnLg : styles.btnSm;
  return (
    <TouchableOpacity
      style={[
        s,
        styles.btnBase,
        color === 'blue' && styles.btnBlue,
        color === 'purple' && styles.btnPurple,
        !enabled && styles.btnDisabled,
      ]}
      onPress={onPress}
      disabled={!enabled}
      accessibilityRole="button"
      accessibilityLabel={`Botão ${icon}`}
    >
      <Text
        style={[
          styles.btnIcon,
          !enabled && styles.btnIconDisabled,
          color === 'blue' && styles.btnIconBlue,
          color === 'purple' && styles.btnIconPurple,
        ]}
      >
        {icon}
      </Text>
    </TouchableOpacity>
  );
}

function Feedback({ type }: { type: 'like' | 'pass' | 'super-like' | 'match' | 'limit' }) {
  const map = {
    like: { label: 'LIKE', color: '#10b981' },
    pass: { label: 'PASS', color: '#ef4444' },
    'super-like': { label: 'SUPER LIKE', color: '#3b82f6' },
    match: { label: 'É UM MATCH!', color: '#ec4899' },
    limit: { label: 'LIKES ESGOTADOS', color: '#f59e0b' },
  } as const;
  const cfg = map[type];
    return (
    <View style={[styles.feedbackBox, { borderColor: cfg.color }]}>
      <Text style={[styles.feedbackText, { color: cfg.color }]}>{cfg.label}</Text>
      </View>
    );
  }

function UpsellBanner({ onClose, onUpgrade }: { onClose: () => void; onUpgrade: () => void }) {
  return (
    <View style={styles.upsell}>
      <Text style={styles.upsellTitle}>Acabaram seus likes por hoje</Text>
      <Text style={styles.upsellSub}>Faça upgrade para curtir sem limites e ter mais matches!</Text>
      <View style={styles.upsellRow}>
        <TouchableOpacity style={[styles.upsellBtn, styles.upsellGhost]} onPress={onClose}>
          <Text style={[styles.upsellBtnText, styles.upsellBtnTextGhost]}>Agora não</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.upsellBtn, styles.upsellPrimary]} onPress={onUpgrade}>
          <Text style={[styles.upsellBtnText, styles.upsellBtnTextPrimary]}>Ver planos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function EmptyState({ onReload }: { onReload: () => void }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>♥</Text>
      <Text style={styles.emptyTitle}>Fim da fila</Text>
      <Text style={styles.emptyText}>
        Você viu todos os perfis por enquanto. Tente novamente mais tarde ou ajuste seus filtros.
      </Text>
      <TouchableOpacity style={styles.reload} onPress={onReload}>
        <Text style={styles.reloadText}>Recarregar</Text>
      </TouchableOpacity>
    </View>
);
}

/** ---------- Estilos ---------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  brandHeart: { fontSize: 22, color: '#ec4899' },
  brand: { fontSize: 18, fontWeight: '800', color: '#111827' },
  brandSpacer: { width: 32 },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 },
  skeletonCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  loadingText: { fontSize: 16, color: '#6b7280' },

  /** Cards */
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#111827',
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 10,
  },
  cardImageWrap: { flex: 1, backgroundColor: '#ddd' },
  cardImage: { width: '100%', height: '100%' },
  imageSkeleton: { ...StyleSheet.absoluteFillObject, backgroundColor: '#e5e7eb' },

  cardOverlay: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  cardInfo: { gap: 6 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardName: { fontSize: 24, fontWeight: '800', color: 'white' },
  verified: { fontSize: 20, color: '#60a5fa', fontWeight: 'bold' },
  cardLocation: { fontSize: 14, color: '#e5e7eb' },
  cardBio: { fontSize: 14, color: '#fff' },
  interests: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  tag: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  tagText: { color: 'white', fontSize: 12, fontWeight: '600' },

  /** Ribbons */
  ribbon: {
    position: 'absolute',
    top: 18,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 4,
    borderRadius: 8,
    transform: [{ rotate: '-12deg' }],
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  ribbonLike: { left: 14, borderColor: '#10b981' },
  ribbonPass: { right: 14, borderColor: '#ef4444', transform: [{ rotate: '12deg' }] },
  ribbonText: { fontSize: 20, fontWeight: '900', color: '#111827' },

  /** Feedback overlay */
  feedbackOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  feedbackBox: {
    borderWidth: 8,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 22,
    backgroundColor: 'rgba(255,255,255,0.96)',
  },
  feedbackText: { fontSize: 32, fontWeight: '900' },

  /** Footer */
  bottom: { position: 'absolute', bottom: 28, left: 0, right: 0, alignItems: 'center' },
  likesLabel: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  likesNumber: { color: '#ec4899', fontWeight: '800' },

  actionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 16 },
  btnBase: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLg: { width: 68, height: 68 },
  btnSm: { width: 52, height: 52 },
  btnIcon: { fontSize: 28, fontWeight: '800', color: '#6b7280' },
  btnIconDisabled: { color: '#d1d5db' },
  btnIconBlue: { color: '#3b82f6' },
  btnIconPurple: { color: '#8b5cf6' },
  btnBlue: { backgroundColor: 'white' },
  btnPurple: { backgroundColor: 'white' },
  btnDisabled: { opacity: 0.5 },

  /** Upsell */
  upsell: {
    position: 'absolute',
    left: 16, right: 16, bottom: 100,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 10,
  },
  upsellTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  upsellSub: { marginTop: 4, fontSize: 14, color: '#4b5563' },
  upsellRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  upsellBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  upsellGhost: { backgroundColor: '#f3f4f6' },
  upsellPrimary: { backgroundColor: '#ec4899' },
  upsellBtnText: { fontWeight: '800', fontSize: 14 },
  upsellBtnTextGhost: { color: '#111827' },
  upsellBtnTextPrimary: { color: 'white' },

  /** Empty */
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  emptyIcon: { fontSize: 80, color: '#d1d5db' },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: '#111827' },
  emptyText: { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 22 },
  reload: { marginTop: 14, backgroundColor: '#ec4899', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 18 },
  reloadText: { color: 'white', fontSize: 15, fontWeight: '700' },
});
