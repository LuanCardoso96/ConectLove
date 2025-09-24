import React from 'react';
import {View, StyleSheet, ImageBackground, Text} from 'react-native';
import type {Profile} from '../shared/mock';

export default function ProfileCard({profile}:{profile:Profile}) {
  return (
    <View style={styles.card}>
      <ImageBackground
        source={{uri: profile.photo}}
        style={styles.image}
        imageStyle={styles.imageInner}
        resizeMode="cover"  // cobre e centraliza, cortando sobras
      >
        <View style={styles.footer}>
          <Text style={styles.name}>
            {profile.name} <Text style={styles.age}>{profile.age}</Text>
          </Text>
          <Text style={styles.bio} numberOfLines={2}>{profile.bio}</Text>
          <Text style={styles.dist}>{profile.distanceKm} km de distância</Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  card:{
    alignSelf:'center',
    width:'100%',
    maxWidth:720,
    aspectRatio:3/4,
    borderRadius:24,
    overflow:'hidden',
    backgroundColor:'#f3f4f6',
    shadowColor:'#000', shadowOpacity:.12, shadowRadius:12, elevation:6,
  },
  image:{flex:1, justifyContent:'flex-end'},
  imageInner:{borderRadius:24},
  footer:{backgroundColor:'rgba(0,0,0,.45)', padding:16},
  name:{color:'#fff', fontSize:24, fontWeight:'800'},
  age:{color:'#fff', fontWeight:'600'},
  bio:{color:'#fff', marginTop:6},
  dist:{color:'#e5e7eb', marginTop:6, fontSize:12},
});
