import React from 'react';
import {ScrollView, View, Text, StyleSheet, TouchableOpacity} from 'react-native';

const plans = [
  {tier:'Free',    price:'R$0/mês',  likes:20,  matches:10,  msgs:0,  boosts:0, highlight:false, desc:'Comece a usar'},
  {tier:'Prata',   price:'R$25/mês', likes:50,  matches:50,  msgs:0,  boosts:1, highlight:false, desc:'Para quem está começando'},
  {tier:'Ouro',    price:'R$49/mês', likes:120, matches:120, msgs:10, boosts:2, highlight:true,  desc:'Mais alcance e mensagens'},
  {tier:'Platina', price:'R$79/mês', likes:250, matches:250, msgs:25, boosts:3, highlight:false, desc:'Para quem quer acelerar'},
  {tier:'Premium', price:'R$99/mês', likes:500, matches:500, msgs:50, boosts:5, highlight:false, desc:'Tudo ilimitado por mais tempo'},
];

export default function PlanosScreen(){
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Planos ConectLove</Text>
      <Text style={styles.subtitle}>Escolha o melhor para sua vibe 🚀</Text>

      {plans.map(p=>(
        <View key={p.tier} style={[styles.card, p.highlight && styles.cardHL]}>
          <View style={styles.cardHeader}>
            <Text style={styles.tier}>{p.tier}</Text>
            <Text style={styles.price}>{p.price}</Text>
          </View>
          <View style={styles.benefits}>
            <Text style={styles.item}>❤️ {p.likes} curtidas/mês</Text>
            <Text style={styles.item}>⭐ {p.matches} matchs/mês</Text>
            <Text style={styles.item}>💬 {p.msgs} mensagens de "Oi"</Text>
            <Text style={styles.item}>⚡ {p.boosts} boosts</Text>
          </View>
          <Text style={styles.desc}>{p.desc}</Text>
          <TouchableOpacity style={[styles.cta, p.highlight && styles.ctaHL]}>
            <Text style={styles.ctaTxt}>{p.tier==='Free' ? 'Continuar grátis' : 'Assinar agora'}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{padding:16, gap:14},
  title:{fontSize:22, fontWeight:'800', alignSelf:'center'},
  subtitle:{color:'#6b7280', alignSelf:'center', marginBottom:8},
  card:{backgroundColor:'#fff', borderRadius:16, padding:16, gap:12, shadowColor:'#000', shadowOpacity:.08, shadowRadius:10, elevation:3},
  cardHL:{borderWidth:2, borderColor:'#e91e63'},
  cardHeader:{flexDirection:'row', justifyContent:'space-between', alignItems:'center'},
  tier:{fontSize:18, fontWeight:'800', color:'#111827'},
  price:{fontSize:16, fontWeight:'700', color:'#e91e63'},
  benefits:{gap:6},
  item:{color:'#111827'},
  desc:{color:'#6b7280'},
  cta:{height:44, borderRadius:12, backgroundColor:'#111827', alignItems:'center', justifyContent:'center'},
  ctaHL:{backgroundColor:'#e91e63'},
  ctaTxt:{color:'#fff', fontWeight:'700'}
});
