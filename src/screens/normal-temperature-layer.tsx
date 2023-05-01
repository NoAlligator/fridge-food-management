import {ScrollView, View} from 'react-native';
import React from 'react';
import {AddFAB} from '../components/add-main-page';
import {LayerContext} from '../store';
export const NormalLayer = () => {
  return (
    <LayerContext.Provider value={'Normal'}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'white',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}>
        <ScrollView style={{flex: 1}} />
        <AddFAB />
      </View>
    </LayerContext.Provider>
  );
};
