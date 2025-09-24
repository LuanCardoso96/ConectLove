import React from 'react';
import {View, Text, StyleSheet, Switch, TouchableOpacity, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';

export default function ConfigScreen(){
  const navigation = useNavigation();
  const onLogout = () => {
    // Ajuste para sua rota de Login quando existir:
    // navigation.reset({ index:0, routes:[{name:'Login'}] });
    Alert.alert('Logout', 'Simulação de saída. Integraremos autenticação depois.');
  };

  return (
    <View style={styles.c}>
      <View style={styles.header}>
        <Text style={styles.t}>Configurações</Text>
      </View>
      
      <View style={styles.section}>
        <View style={styles.row}><Text style={styles.label}>Notificações</Text><Switch value/></View>
        <View style={styles.row}><Text style={styles.label}>Modo escuro</Text><Switch/></View>
      </View>
      
      <View style={styles.divider}/>
      
      <TouchableOpacity onPress={onLogout} style={styles.exitBtn}>
        <Text style={styles.exitTxt}>Sair (Logout)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles=StyleSheet.create({
  c:{flex:1,padding:16,gap:12, backgroundColor:'#fef7f7'},
  header:{backgroundColor:'#ffffff', padding:20, borderRadius:16, shadowColor:'#e91e63', shadowOpacity:0.1, shadowRadius:8, elevation:3},
  t:{fontSize:22,fontWeight:'700',alignSelf:'center',marginVertical:8, color:'#e91e63'},
  section:{backgroundColor:'#ffffff', padding:16, borderRadius:12, shadowColor:'#e91e63', shadowOpacity:0.05, shadowRadius:4, elevation:1},
  row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:12},
  label:{fontSize:16, fontWeight:'600', color:'#2d3748'},
  divider:{height:1, backgroundColor:'#e91e63', marginVertical:8},
  exitBtn:{backgroundColor:'#e91e63', borderRadius:12, height:48, alignItems:'center', justifyContent:'center', shadowColor:'#e91e63', shadowOpacity:0.3, shadowRadius:4, elevation:2},
  exitTxt:{color:'#fff', fontWeight:'700'},
});
