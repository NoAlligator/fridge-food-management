/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useRef, useState} from 'react';
import {Animated, ScrollView, StyleSheet, View} from 'react-native';
import {COLORS} from '../constants';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {ItemAdd} from '../components/item-add';
import {LayerContext, emitter} from '../store';
import {useNavigation} from '@react-navigation/native';
import {ShopListItem} from '../types';
import {
  deleteDataById,
  queryByCondition,
  updateDataById,
} from '../database/utils';
import {db} from '../database';

export const MultiEditFoodScreen = ({route}: {route: any}) => {
  const _items = route.params.items as ShopListItem[];
  const [items, setItems] = useState(_items);
  const layer = route.params.layer;
  const navigation = useNavigation();
  useEffect(() => {
    if (items.length === 0) {
      navigation.goBack();
    }
  }, [items, navigation]);
  return (
    <LayerContext.Provider value={layer}>
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
          <View style={{display: 'flex', height: '100%'}}>
            <ScrollView style={{flex: 1}}>
              {items.map((item: any) => (
                <ItemAdd
                  key={item.id}
                  categoryId={item.category_id}
                  categoryName={item.category_name}
                  itemName={item.food_name}
                  itemId={item.food_id}
                  defaultLifeSpan={null}
                  multiplyMode={true}
                  multiplyData={{
                    amount: item.amount,
                    addedCallback: async (inStockNumber: number) => {
                      if (item.auto === 1) {
                        await updateDataById(
                          db,
                          'shopping_list_foods',
                          item.id,
                          {
                            amount: item.amount - inStockNumber,
                          },
                        );
                      } else {
                        await deleteDataById(
                          db,
                          'shopping_list_foods',
                          item.id,
                        );
                      }
                      setItems(items.filter(({id}) => id !== item.id));
                      emitter.emit('Shopping/reset');
                    },
                  }}
                />
              ))}
              <View style={{height: 50}} />
            </ScrollView>
          </View>
        </View>
      </View>
    </LayerContext.Provider>
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
