import React, {useState} from 'react';
import {ScrollView, View, Text, StyleSheet, TextInput, TouchableOpacity} from 'react-native';

export default function PerfilScreen() {
  const [name,setName] = useState('Luan');
  const [age,setAge] = useState('24');
  const [bio,setBio] = useState('Profissional de vendas e programador.');
  const [interests,setInterests] = useState('música, tecnologia, viagens');
  const [prefGender,setPrefGender] = useState<'Masculino'|'Feminino'|'Outros'>('Outros');
  const [distance,setDistance] = useState('50');

  const PhotoSlot = () => (
    <TouchableOpacity style={styles.slot}>
      <Text style={styles.photoIcon}>📷</Text>
      <Text style={styles.photoText}>Adicionar</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>

      <View style={styles.photoGrid}>
        <PhotoSlot/><PhotoSlot/><PhotoSlot/>
        <PhotoSlot/><PhotoSlot/><PhotoSlot/>
      </View>

      <View style={styles.group}><Text style={styles.label}>Nome</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName}/>
      </View>

      <View style={styles.row2}>
        <View style={[styles.group,{flex:1}]}>
          <Text style={styles.label}>Idade</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={age} onChangeText={setAge}/>
        </View>
        <View style={[styles.group,{flex:1}]}>
          <Text style={styles.label}>Distância máx. (km)</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={distance} onChangeText={setDistance}/>
        </View>
      </View>

      <View style={styles.group}><Text style={styles.label}>Bio</Text>
        <TextInput style={[styles.input,{height:100,textAlignVertical:'top'}]} multiline value={bio} onChangeText={setBio}/>
      </View>

      <View style={styles.group}><Text style={styles.label}>Interesses (vírgula)</Text>
        <TextInput style={styles.input} value={interests} onChangeText={setInterests}/>
      </View>

      <View style={styles.group}><Text style={styles.label}>Prefere ver</Text>
        <View style={styles.pills}>
          {(['Masculino','Feminino','Outros'] as const).map(g=>(
            <TouchableOpacity key={g} onPress={()=>setPrefGender(g)} style={[styles.pill, prefGender===g && styles.pillActive]}>
              <Text style={[styles.pillText, prefGender===g && styles.pillTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn}><Text style={styles.saveTxt}>Salvar (mock)</Text></TouchableOpacity>
      <Text style={styles.note}>* Sem persistência por enquanto. Integraremos Firestore/Storage depois.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{padding:16, gap:12},
  title:{fontSize:22, fontWeight:'800', alignSelf:'center', marginBottom:6},
  photoGrid:{flexDirection:'row', flexWrap:'wrap', gap:10, justifyContent:'space-between'},
  slot:{width:'32%', aspectRatio:1, borderRadius:16, borderWidth:2, borderColor:'#e91e63', alignItems:'center', justifyContent:'center', backgroundColor:'#fef7f7'},
  photoIcon:{fontSize:24, marginBottom:4},
  photoText:{color:'#e91e63', fontSize:12, fontWeight:'600'},
  group:{gap:6},
  label:{color:'#6b7280', fontSize:12, fontWeight:'600'},
  input:{borderWidth:1, borderColor:'#e5e7eb', borderRadius:12, paddingHorizontal:12, height:44, backgroundColor:'#fff'},
  row2:{flexDirection:'row', gap:12},
  pills:{flexDirection:'row', gap:8},
  pill:{paddingHorizontal:12, paddingVertical:8, borderRadius:999, borderWidth:1, borderColor:'#e5e7eb'},
  pillActive:{backgroundColor:'#e91e63', borderColor:'#e91e63'},
  pillText:{color:'#111827', fontWeight:'600'},
  pillTextActive:{color:'#fff'},
  saveBtn:{marginTop:8, backgroundColor:'#e91e63', borderRadius:12, height:48, alignItems:'center', justifyContent:'center'},
  saveTxt:{color:'#fff', fontWeight:'700'},
  note:{color:'#9ca3af', fontSize:12, marginTop:6, alignSelf:'center'}
});
