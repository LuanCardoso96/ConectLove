import React from 'react';
import {FlatList, Image, Text, View, StyleSheet} from 'react-native';
import {MOCK_MATCHS} from '../shared/mock';

export default function MatchsScreen(){
  return (
    <FlatList
      data={MOCK_MATCHS}
      numColumns={3}
      keyExtractor={i=>i.id}
      contentContainerStyle={{padding:12, gap:12}}
      columnWrapperStyle={{gap:12}}
      renderItem={({item})=>(
        <View style={styles.card}>
          <Image source={{uri:item.photo}} style={styles.img}/>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        </View>
      )}
    />
  );
}
const styles = StyleSheet.create({
  card:{flex:1, alignItems:'center'},
  img:{width:'100%', aspectRatio:1, borderRadius:16, backgroundColor:'#e5e7eb'},
  name:{marginTop:6, fontWeight:'600', color:'#111827'}
});
