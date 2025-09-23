import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomePage from './Pages/Welcome';
import OnboardingPage from './Pages/Onboarding';
import HomePage from './Pages/Home';

export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: { user: any };
  Home: { user: any; profile: any };
};

const Stack = createStackNavigator<RootStackParamList>();

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
          name="Home" 
          component={HomePage}
          options={{
            title: 'Início',
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
