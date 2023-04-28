import {ScrollView, View} from 'react-native';
import React from 'react';
export const NormalLayer = () => {
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
