import React from 'react';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#fef7f7',
    primary: '#e91e63',
    secondary: '#ff6b9d',
    accent: '#ff4081',
    surface: '#ffffff',
    text: '#2d3748',
    border: '#e91e63',
  },
};

export default function App() {
  return (
    <NavigationContainer theme={theme}>
      <RootNavigator />
    </NavigationContainer>
  );
}
