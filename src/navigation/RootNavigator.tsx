import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import InicioScreen from '../screens/InicioScreen';
import PerfilScreen from '../screens/PerfilScreen';
import ConversarScreen from '../screens/ConversarScreen';
import MatchsScreen from '../screens/MatchsScreen';
import PlanosScreen from '../screens/PlanosScreen';
import ConfigScreen from '../screens/ConfigScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs(){
  return (
    <Tab.Navigator screenOptions={{headerTitleAlign:'center', tabBarActiveTintColor:'#e91e63', tabBarLabelStyle:{fontSize:12}}}>
      <Tab.Screen name="Início" component={InicioScreen}/>
      <Tab.Screen name="Perfil" component={PerfilScreen}/>
      <Tab.Screen name="Conversar" component={ConversarScreen}/>
      <Tab.Screen name="Matchs" component={MatchsScreen}/>
      <Tab.Screen name="Planos" component={PlanosScreen}/>
      <Tab.Screen name="Configurações" component={ConfigScreen}/>
    </Tab.Navigator>
  );
}

export default function RootNavigator(){
  return (
    <Stack.Navigator>
      {/* Se tiver tela Login, registre e inicie por ela. Aqui iniciamos direto nas tabs. */}
      <Stack.Screen name="ConectLove" component={Tabs} options={{headerShown:false}}/>
    </Stack.Navigator>
  );
}
