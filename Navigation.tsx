import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomePage from './Pages/Welcome';
import OnboardingPage from './Pages/Onboarding';
import HomePage from './Pages/Home';

export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: { user: any };
  Main: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Custom Header Component with Hamburger Menu
function CustomHeader({ navigation, route }: any) {
  const [isMenuVisible, setIsMenuVisible] = React.useState(false);
  
  const menuItems = [
    { id: 'Home', label: 'Início', icon: '🏠', screen: 'Home' },
    { id: 'Profile', label: 'Perfil', icon: '👤', screen: 'Profile' },
    { id: 'Conversations', label: 'Conversar', icon: '💬', screen: 'Conversations' },
    { id: 'Matches', label: 'Matchs', icon: '💕', screen: 'Matches' },
    { id: 'Plans', label: 'Planos', icon: '💎', screen: 'Plans' },
    { id: 'Settings', label: 'Configurações', icon: '⚙️', screen: 'Settings' },
  ];

  const handleMenuPress = (screen: string) => {
    setIsMenuVisible(false);
    if (screen === 'Settings') {
      // Handle logout
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } else {
      // Navigate to placeholder screen
      navigation.navigate('Placeholder', { screenName: screen });
    }
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={() => setIsMenuVisible(true)}
      >
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>
        {route?.name === 'Home' ? 'Início' : 
         route?.name === 'Placeholder' ? route?.params?.screenName : 'ConectLove'}
      </Text>
      
      <View style={styles.headerRight} />

      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setIsMenuVisible(false)}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleMenuPress(item.screen)}
              >
                <Text style={styles.menuItemIcon}>{item.icon}</Text>
                <Text style={styles.menuItemLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Placeholder Screen Component
function PlaceholderScreen({ navigation, route }: any) {
  const screenName = route?.params?.screenName || 'Tela';
  
  const getScreenContent = (name: string) => {
    switch (name) {
      case 'Profile':
        return {
          title: 'Meu Perfil',
          description: 'Aqui você poderá editar seu perfil, fotos e informações pessoais.',
          icon: '👤'
        };
      case 'Conversations':
        return {
          title: 'Conversas',
          description: 'Suas conversas com matches aparecerão aqui.',
          icon: '💬'
        };
      case 'Matches':
        return {
          title: 'Matches',
          description: 'Veja todos os seus matches aqui.',
          icon: '💕'
        };
      case 'Plans':
        return {
          title: 'Planos',
          description: 'Escolha o plano ideal para você: Free, Premium ou Diamante.',
          icon: '💎'
        };
      case 'Settings':
        return {
          title: 'Configurações',
          description: 'Configure suas preferências e configurações da conta.',
          icon: '⚙️'
        };
      default:
        return {
          title: screenName,
          description: 'Funcionalidade em desenvolvimento.',
          icon: '📱'
        };
    }
  };

  const content = getScreenContent(screenName);

  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderIcon}>{content.icon}</Text>
      <Text style={styles.placeholderTitle}>{content.title}</Text>
      <Text style={styles.placeholderDescription}>{content.description}</Text>
      
      {screenName === 'Settings' && (
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          }}
        >
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      >
        <Stack.Screen 
          name="Welcome" 
          component={WelcomePage}
          options={{
            title: 'Bem-vindo',
          }}
        />
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingPage}
          options={{
            title: 'Criar Perfil',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="Main" 
          component={HomePage}
          options={{
            title: 'Principal',
            gestureEnabled: false,
            headerShown: true,
            header: (props) => <CustomHeader {...props} />,
          }}
        />
        <Stack.Screen 
          name="Placeholder" 
          component={PlaceholderScreen}
          options={{
            title: 'Funcionalidade',
            gestureEnabled: false,
            headerShown: true,
            header: (props) => <CustomHeader {...props} />,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EC4899',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 44, // Status bar height
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    paddingTop: 100,
  },
  menuContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 20,
    color: '#6b7280',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuItemLabel: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 32,
  },
  placeholderIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  placeholderDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
