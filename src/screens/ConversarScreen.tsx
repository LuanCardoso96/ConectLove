import React from 'react';
import {FlatList, View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {MOCK_CHATS} from '../shared/mock';

export default function ConversarScreen(){
  return (
    <FlatList
      data={MOCK_CHATS}
      keyExtractor={i=>i.id}
      ItemSeparatorComponent={()=> <View style={styles.sep}/>}
      contentContainerStyle={{padding:12}}
      renderItem={({item})=>(
        <TouchableOpacity style={styles.row}>
          <View style={styles.avatar}/>
          <View style={{flex:1}}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.last} numberOfLines={1}>{item.last}</Text>
          </View>
          <Text style={styles.time}>{item.time}</Text>
        </TouchableOpacity>
      )}
    />
  );
}
const styles=StyleSheet.create({
  row:{flexDirection:'row', alignItems:'center', gap:12, paddingVertical:12},
  avatar:{width:48,height:48,borderRadius:24,backgroundColor:'#e5e7eb'},
  name:{fontWeight:'700', fontSize:16, color:'#111827'},
  last:{color:'#6b7280', marginTop:2},
  time:{color:'#9ca3af', fontSize:12},
  sep:{height:1, backgroundColor:'#eef2f7'}
});
