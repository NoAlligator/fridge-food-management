/* eslint-disable react-native/no-inline-styles */
import React, {FC, useRef, useState} from 'react';
import {SearchBar} from '@rneui/themed';
import {COLORS} from '../constants';
import {StyleSheet, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {AddFoodCategoriesAndList} from '../components/food-category-list';
import {LayerContext, ShoppingModeContext} from '../store';
import {useNavigation} from '@react-navigation/native';
export const SelectFoodScreen: FC<{
  route: any;
}> = ({route}) => {
  const shoppingListMode = route.params.shoppingListMode;
  const [search, setSearch] = useState('');
  const updateSearch = (value: string) => {
    setSearch(value);
  };
  const ref = useRef<any>(null);
  const navigation = useNavigation();
  return (
    <ShoppingModeContext.Provider value={shoppingListMode === true}>
      <LayerContext.Provider value={route.params.layer}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Icon
              name="arrow-back"
              size={25}
              color="white"
              onPress={() => {
                navigation.goBack();
              }}
            />
            <SearchBar
              ref={ref}
              platform="android"
              placeholderTextColor="white"
              placeholder="Search..."
              containerStyle={{
                width: 200,
                backgroundColor: 'transparent',
              }}
              cancelIcon={
                <Icon
                  name="check"
                  size={25}
                  color="white"
                  onPress={() => {
                    ref.current && ref.current.blur();
                  }}
                />
              }
              searchIcon={<Icon name="search" size={25} color="white" />}
              inputStyle={{color: 'white'}}
              clearIcon={
                <Icon
                  name="close"
                  color="white"
                  size={25}
                  onPress={() => {
                    setSearch('');
                  }}
                />
              }
              onChangeText={updateSearch}
              value={search}
            />
          </View>
          <AddFoodCategoriesAndList filterText={search} />
        </View>
      </LayerContext.Provider>
    </ShoppingModeContext.Provider>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {position: 'absolute', right: 25, bottom: 20},
  button: {
    padding: 0,
    width: 50,
    height: 50,
    backgroundColor: COLORS.background,
  },
  modalContainer: {
    display: 'flex',
    height: '100%',
  },
  header: {
    height: 50,
    paddingLeft: 20,
    backgroundColor: COLORS.background,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
