import React from 'react';
import {ScrollView, View} from 'react-native';

export const FreshLayer = () => {
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
