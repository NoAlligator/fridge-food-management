/* eslint-disable react-native/no-inline-styles */
import React, {useContext, useState} from 'react';
import {View, Image, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS} from '../constants';
import {Divider} from '@rneui/themed';
import {useNavigation} from '@react-navigation/native';
import {FilterModal} from './filter-modal';
import {SortModal} from './sort-modal';
import {SearchModal} from './search-modal';
import {SearchContext} from '../store';

const headerStyle = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    height: 50,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconsContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  logo: {resizeMode: 'contain', width: 100, marginLeft: 10},
  popOverContainer: {padding: 0},
  moreOption: {
    height: 40,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartIconStyle: {
    marginRight: 10,
  },
  iconStyle: {
    marginLeft: 5,
    marginRight: 5,
  },
});

export const Header = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [search] = useContext(SearchContext);
  return (
    <>
      <View style={headerStyle.container}>
        <Image
          style={headerStyle.logo}
          source={require('../assets/png/logo-en-white.png')} // 引入本地图片
        />
        <View style={headerStyle.iconsContainer}>
          <Icon
            name="shopping-cart"
            size={20}
            color="white"
            style={headerStyle.iconStyle}
            onPress={() => {
              // @ts-ignore
              navigation.navigate('Shopping');
            }}
          />
          <Icon
            name="bar-chart"
            size={20}
            color="white"
            style={headerStyle.iconStyle}
            onPress={() => {
              // @ts-ignore
              navigation.navigate('Statistic');
            }}
          />
          <Divider
            orientation="vertical"
            style={{marginVertical: 4, marginHorizontal: 5}}
          />
          <Icon
            name="search"
            size={20}
            color={search !== '' ? 'black' : 'white'}
            style={headerStyle.iconStyle}
            onPress={() => {
              setSearchModalVisible(true);
            }}
          />
          <Icon
            name="filter-alt"
            size={20}
            color="white"
            style={headerStyle.iconStyle}
            onPress={() => {
              setModalVisible(true);
            }}
          />
          <Icon
            name="sort"
            size={20}
            color="white"
            style={headerStyle.iconStyle}
            onPress={() => {
              setSortModalVisible(true);
            }}
          />
          <Divider
            orientation="vertical"
            style={{marginVertical: 4, marginHorizontal: 5}}
          />
          <Icon
            name="settings"
            size={20}
            color="white"
            style={[
              headerStyle.iconStyle,
              {
                marginRight: 10,
              },
            ]}
            onPress={() => {
              // @ts-ignore
              navigation.navigate('Setting');
            }}
          />
        </View>
      </View>
      <FilterModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
      <SortModal
        modalVisible={sortModalVisible}
        setModalVisible={setSortModalVisible}
      />
      <SearchModal
        modalVisible={searchModalVisible}
        setModalVisible={setSearchModalVisible}
      />
    </>
  );
};
