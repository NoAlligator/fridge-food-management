import React from 'react';
import {View} from 'react-native';
import {COLORS, SIZE} from '../constants';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
export const ShoppingList = () => {
  const navigation = useNavigation();
  return (
    <View>
      <View
        style={{
          backgroundColor: COLORS.background,
          height: 50,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: SIZE.headerPaddingHorizontal,
        }}>
        <Icon
          name="arrow-back"
          size={25}
          color="white"
          onPress={() => {
            // @ts-ignore
            navigation.navigate('Home');
          }}
        />
      </View>
    </View>
  );
};
