import React, {useRef, useState, useEffect, useCallback} from 'react';
import {View, StyleSheet, Text, TouchableOpacity, StatusBar} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import {MOCK_PROFILES, Profile} from '../shared/mock';
import ProfileCard from '../ui/ProfileCard';
import ActionBar from '../ui/ActionBar';
import {useNavigation} from '@react-navigation/native';

function shuffleNoRepeat(list: Profile[]): Profile[] {
  // evita repetições óbvias embaralhando a cópia
  return [...list].sort(() => Math.random() - 0.5);
}

export default function InicioScreen(){
  const [cards, setCards] = useState<Profile[]>(shuffleNoRepeat(MOCK_PROFILES));
  const [index, setIndex] = useState(0);
  const swiperRef = useRef<Swiper<Profile>>(null);
  const navigation = useNavigation();

  const resetDeck = useCallback(()=>{
    setCards(shuffleNoRepeat(MOCK_PROFILES));
    setIndex(0);
    swiperRef.current?.jumpToCardIndex(0);
  },[]);

  useEffect(()=>{
    const unsub = navigation.addListener('tabPress', resetDeck);
    return unsub;
  },[navigation, resetDeck]);

  const onSwiped = ()=> setIndex(prev => prev + 1);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content"/>
      <View style={styles.topBar}>
        <Text style={styles.brand}>ConectLove</Text>
        <TouchableOpacity style={styles.moreBtn} onPress={resetDeck}>
          <Text style={styles.moreTxt}>Mais pessoas</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.deckArea}>
        <Swiper
          ref={swiperRef}
          cards={cards}
          cardIndex={index}
          renderCard={(card)=> card ? <ProfileCard profile={card}/> : <View style={styles.empty}><Text>Acabaram os perfis</Text></View>}
          backgroundColor="transparent"
          stackSize={3}
          cardVerticalMargin={0}
          cardHorizontalMargin={0}
          onSwiped={onSwiped}
          animateOverlayLabelsOpacity
        />
      </View>

      <ActionBar
        onNope={()=>swiperRef.current?.swipeLeft()}
        onRewind={()=>swiperRef.current?.jumpToCardIndex(Math.max(index-1,0))}
        onStar={()=>{}}
        onLike={()=>swiperRef.current?.swipeRight()}
        onBoost={()=>{}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1, backgroundColor:'#fef7f7', paddingHorizontal:16},
  topBar:{flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginVertical:12, backgroundColor:'#ffffff', paddingHorizontal:16, paddingVertical:12, borderRadius:16, shadowColor:'#e91e63', shadowOpacity:0.1, shadowRadius:8, elevation:3},
  brand:{fontSize:24, fontWeight:'800', color:'#e91e63'},
  moreBtn:{paddingHorizontal:16, paddingVertical:10, backgroundColor:'#e91e63', borderRadius:12, shadowColor:'#e91e63', shadowOpacity:0.3, shadowRadius:4, elevation:2},
  moreTxt:{color:'#ffffff', fontWeight:'700'},
  deckArea:{flex:1, justifyContent:'center'}, // sem padding/lateral que cause "brecha"
  empty:{height:360, alignItems:'center', justifyContent:'center'},
});
