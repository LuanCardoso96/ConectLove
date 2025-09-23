import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { ProfileEntity, LikeEntity, MatchEntity, UserEntity, Profile } from '../Entities';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.75;

const LIKE_LIMITS = { Free: { Masculino: 20, Feminino: 40, Outro: 30 }, Premium: 100, Diamante: 500 };

// Mock data generation function
const generateMockProfiles = () => {
  const profiles: Profile[] = [];
  const genders: ('Feminino' | 'Masculino')[] = ['Feminino', 'Masculino'];
  for (let i = 1; i <= 50; i++) {
    const gender = genders[i % 2];
    profiles.push({
      id: `mock_${i}`,
      name: `${gender === 'Feminino' ? 'Ana' : 'Carlos'} ${i}`,
      age: 20 + (i % 15),
      bio: `Apaixonado(a) por viagens e boa comida. Buscando conexões reais. #${i}`,
      photos: [`https://i.pravatar.cc/500?u=user${i}`],
      interests: ['Viagem', 'Cozinhar', 'Filmes'].slice(0, 1 + (i % 3)),
      gender: gender,
      seeking: gender === 'Feminino' ? 'Masculino' : 'Feminino',
      location_mock: `${i * 2}km de distância`,
      is_verified: i % 5 === 0,
      user_email: `user${i}@example.com`
    });
  }
  return profiles;
};

interface HomePageProps {
  navigation?: any;
  route?: any;
}

export default function HomePage({ navigation, route }: HomePageProps) {
  const { currentUser, profile } = route?.params || {};
  
  // Debug: Log dos dados recebidos
  React.useEffect(() => {
    console.log('HomePage - currentUser:', currentUser);
    console.log('HomePage - profile:', profile);
  }, [currentUser, profile]);
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [likesLeft, setLikesLeft] = useState(0);

  const fetchProfiles = useCallback(async () => {
    console.log('fetchProfiles called with profile:', profile);
    
    if (!profile) {
      console.log('No profile found, setting loading to false');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check and reset daily likes
      const today = new Date().toISOString().split('T')[0];
      let userLikes = currentUser?.likes_today || 0;
      if (currentUser?.last_like_date !== today) {
        userLikes = 0;
        await UserEntity.updateMyUserData({ likes_today: 0, last_like_date: today });
      }
      const userPlan = currentUser?.plan || 'Free';
      const planLimits = LIKE_LIMITS[userPlan as keyof typeof LIKE_LIMITS];
      const maxLikes = typeof planLimits === 'object' ? planLimits[profile.gender as keyof typeof planLimits] : planLimits;
      setLikesLeft(maxLikes - userLikes);

      // Use mock data directly for now
      const mockProfiles = generateMockProfiles();
      const filteredProfiles = mockProfiles.filter(p => p.user_email !== currentUser?.email);
      
      console.log('Setting profiles:', filteredProfiles.length);
      setProfiles(filteredProfiles);
      setCurrentIndex(filteredProfiles.length - 1);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      // Fallback to mock data
      const mockProfiles = generateMockProfiles();
      setProfiles(mockProfiles);
      setCurrentIndex(mockProfiles.length - 1);
    }
    
    setIsLoading(false);
  }, [currentUser, profile]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleSwipe = async (type: 'like' | 'pass' | 'super-like', likedProfile: Profile) => {
    if (!profile || (likesLeft <= 0 && type !== 'pass')) {
      setFeedback('limit');
      setTimeout(() => setFeedback(null), 1500);
      return;
    }

    setFeedback(type);
    setTimeout(() => setFeedback(null), 500);

    try {
      const likeData = {
        liker_profile_id: profile.id!,
        liked_profile_id: likedProfile.id!,
        type: type
      };
      await LikeEntity.create(likeData);
      
      if (type === 'like' || type === 'super-like') {
        const userLikes = (currentUser?.likes_today || 0) + 1;
        const today = new Date().toISOString().split('T')[0];
        await UserEntity.updateMyUserData({ likes_today: userLikes, last_like_date: today });
        setLikesLeft(prev => prev - 1);
        
        // Check for match
        const theyLikedMe = await LikeEntity.filter({
          liker_profile_id: { eq: likedProfile.id },
          liked_profile_id: { eq: profile.id },
          type: { in: ['like', 'super-like'] }
        });

        if (theyLikedMe.length > 0) {
          setFeedback('match');
          await MatchEntity.create({ profile1_id: profile.id!, profile2_id: likedProfile.id! });
          setTimeout(() => setFeedback(null), 2000);
        }
      }
    } catch (error) {
      console.error('Error handling swipe:', error);
    }
  };

  const activeProfile = profiles[currentIndex];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EC4899" />
          <Text style={styles.loadingText}>Carregando perfis...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!activeProfile) {
    return <EmptyState onReload={fetchProfiles} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.content}>
        <ProfileCard
          profile={activeProfile}
          onSwipe={(direction: 'left' | 'right') => {
            const type = direction === 'right' ? 'like' : 'pass';
            handleSwipe(type, activeProfile);
            setCurrentIndex(i => i - 1);
          }}
          feedback={feedback}
        />

        {feedback && <FeedbackOverlay type={feedback} />}

        <View style={styles.bottomContainer}>
          <Text style={styles.likesText}>
            Likes restantes hoje: <Text style={styles.likesNumber}>{likesLeft}</Text>
          </Text>
          <View style={styles.actionButtons}>
            <ActionButton 
              icon="refresh" 
              size="small" 
              enabled={currentUser?.plan !== 'Free'} 
              onPress={() => {}} 
            />
            <ActionButton 
              icon="close" 
              onPress={() => {
                handleSwipe('pass', activeProfile);
                setCurrentIndex(i => i - 1);
              }} 
            />
            <ActionButton 
              icon="star" 
              color="blue" 
              onPress={() => {
                handleSwipe('super-like', activeProfile);
                setCurrentIndex(i => i - 1);
              }} 
            />
            <ActionButton 
              icon="heart" 
              onPress={() => {
                handleSwipe('like', activeProfile);
                setCurrentIndex(i => i - 1);
              }} 
            />
            <ActionButton 
              icon="flash" 
              size="small" 
              enabled={currentUser?.plan === 'Diamante'} 
              color="purple" 
              onPress={() => {}} 
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const ProfileCard = ({ profile }: { 
  profile: Profile; 
  onSwipe: (direction: 'left' | 'right') => void; 
  feedback: string | null;
}) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: profile.photos[0] }} style={styles.cardImage} />
      <View style={styles.cardOverlay}>
        <View style={styles.cardInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.cardName}>{profile.name}, {profile.age}</Text>
            {profile.is_verified && (
              <Text style={styles.verifiedIcon}>✓</Text>
            )}
          </View>
          <Text style={styles.cardLocation}>{profile.location_mock}</Text>
          <Text style={styles.cardBio}>{profile.bio}</Text>
          <View style={styles.interestsContainer}>
            {profile.interests.slice(0, 3).map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const ActionButton = ({ 
  icon, 
  onPress, 
  size = 'large', 
  color = 'default', 
  enabled = true 
}: { 
  icon: string; 
  onPress: () => void; 
  size?: 'large' | 'small'; 
  color?: 'default' | 'blue' | 'purple'; 
  enabled?: boolean;
}) => {
  const sizeStyles = size === 'large' ? styles.actionButtonLarge : styles.actionButtonSmall;
  
  const colorStyles = {
    default: styles.actionButtonDefault,
    blue: styles.actionButtonBlue,
    purple: styles.actionButtonPurple,
  };

  const iconText = {
    'refresh': '↻',
    'close': '✕',
    'star': '★',
    'heart': '♥',
    'flash': '⚡',
  };

  const iconColor = enabled ? (color === 'default' ? '#6b7280' : color === 'blue' ? '#3b82f6' : '#8b5cf6') : '#d1d5db';
  const iconSize = size === 'large' ? 32 : 24;

  return (
    <TouchableOpacity
      style={[
        sizeStyles,
        colorStyles[color],
        !enabled && styles.actionButtonDisabled
      ]}
      onPress={onPress}
      disabled={!enabled}
    >
      <Text style={[styles.actionButtonIcon, { color: iconColor, fontSize: iconSize }]}>
        {iconText[icon as keyof typeof iconText] || icon}
      </Text>
    </TouchableOpacity>
  );
};

const FeedbackOverlay = ({ type }: { type: string }) => {
  const feedbackConfig = {
    like: { icon: 'heart', color: '#10b981', text: 'LIKE' },
    pass: { icon: 'close', color: '#ef4444', text: 'PASS' },
    'super-like': { icon: 'star', color: '#3b82f6', text: 'SUPER LIKE' },
    match: { icon: 'heart', color: '#ec4899', text: 'É UM MATCH!' },
    limit: { icon: 'information-circle', color: '#f59e0b', text: 'LIKES ESGOTADOS' },
  };

  const config = feedbackConfig[type as keyof typeof feedbackConfig];
  if (!config) return null;

  if (type === 'match') {
    return (
      <View style={styles.matchOverlay}>
        <Text style={styles.matchText}>{config.text}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.feedbackOverlay, { borderColor: config.color }]}>
      <Text style={[styles.feedbackText, { color: config.color }]}>{config.text}</Text>
    </View>
  );
};

const EmptyState = ({ onReload }: { onReload: () => void }) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>♥</Text>
      <Text style={styles.emptyTitle}>Fim da Fila</Text>
      <Text style={styles.emptySubtitle}>
        Você viu todos os perfis por enquanto. Tente novamente mais tarde ou ajuste seus filtros.
      </Text>
      <TouchableOpacity style={styles.reloadButton} onPress={onReload}>
        <Text style={styles.reloadButtonText}>Recarregar</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'absolute',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
    justifyContent: 'flex-end',
  },
  cardInfo: {
    gap: 8,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  verifiedIcon: {
    fontSize: 24,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  cardLocation: {
    fontSize: 14,
    color: '#d1d5db',
  },
  cardBio: {
    fontSize: 14,
    color: 'white',
    marginTop: 4,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  interestTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interestText: {
    fontSize: 12,
    color: 'white',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  likesText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  likesNumber: {
    fontWeight: 'bold',
    color: '#EC4899',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  actionButtonLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtonSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtonDefault: {
    backgroundColor: 'white',
  },
  actionButtonBlue: {
    backgroundColor: 'white',
  },
  actionButtonPurple: {
    backgroundColor: 'white',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonIcon: {
    fontWeight: 'bold',
  },
  feedbackOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    borderWidth: 8,
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  feedbackText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  matchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  matchText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 80,
    color: '#d1d5db',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  reloadButton: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  reloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});