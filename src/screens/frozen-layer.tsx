import {ScrollView, View} from 'react-native';
import React from 'react';
import {useRoute} from '@react-navigation/native';
export const FrozenLayer = () => {
  const route = useRoute();
  console.log(route);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}>
      <ScrollView style={{flex: 1}} />
    </View>
  );
};
