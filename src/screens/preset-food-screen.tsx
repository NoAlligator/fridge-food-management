import React from 'react';
import {StyleSheet, View} from 'react-native';
import {COLORS} from '../constants';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {PresetPage} from '../components/preset-page';
import {useNavigation} from '@react-navigation/native';
export const PresetFoodScreen = ({route}: {route: any}) => {
  const item = route?.params?.item;
  const lifeSpan = route?.params?.lifeSpan;
  const navigation = useNavigation();
  return (
    <View style={modalStyle.modalContainer}>
      <View style={modalStyle.modal}>
        <View style={modalStyle.header}>
          <Icon
            name="arrow-back"
            size={25}
            color="white"
            onPress={() => {
              navigation.goBack();
            }}
          />
        </View>
        <PresetPage itemData={item} lifeSpan={lifeSpan} />
      </View>
    </View>
  );
};

const modalStyle = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    display: 'flex',
    height: '100%',
  },
  modal: {
    backgroundColor: '#ffffff',
    width: '100%',
    height: '100%',
  },
  header: {
    height: 50,
    backgroundColor: COLORS.background,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
});
