import {ScrollView, View} from 'react-native';
import React from 'react';
import {useRoute} from '@react-navigation/native';
import {AddFAB} from '../components/add-main-page';
import {LayerContext} from '../store';
export const FrozenLayer = () => {
  const route = useRoute();
  console.log(route);
  return (
    <LayerContext.Provider value={'Frozen'}>
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
