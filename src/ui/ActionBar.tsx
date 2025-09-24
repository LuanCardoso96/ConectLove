import React from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';

type Props = {
  onNope: () => void;
  onRewind: () => void;
  onStar: () => void;
  onLike: () => void;
  onBoost: () => void;
};

export default function ActionBar({onNope, onRewind, onStar, onLike, onBoost}: Props) {
  const Btn = ({label, onPress}:{label:string; onPress:()=>void}) => (
    <TouchableOpacity onPress={onPress} style={styles.btn}>
      <Text style={styles.btnText}>{label}</Text>
    </TouchableOpacity>
  );
  return (
    <View style={styles.wrap}>
      <Btn label="✖️" onPress={onNope} />
      <Btn label="↩️" onPress={onRewind} />
      <Btn label="⭐" onPress={onStar} />
      <Btn label="❤️" onPress={onLike} />
      <Btn label="⚡" onPress={onBoost} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    gap:18,
    paddingVertical:16,
  },
  btn:{
    width:68, height:68, borderRadius:34, backgroundColor:'#fff',
    justifyContent:'center', alignItems:'center',
    shadowColor:'#000', shadowOpacity:.15, shadowRadius:12, elevation:4
  },
  btnText:{fontSize:26}
});
