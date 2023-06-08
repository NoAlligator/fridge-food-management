import React, {useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {COLORS} from '../constants';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {ItemAdd} from '../components/item-add';
import {LayerContext, emitter} from '../store';
import {useNavigation} from '@react-navigation/native';
import {AddShoppingListModal} from '../components/add-shopping-list';
import {
  getFoodItemById,
  queryFoodStock,
  queryShoppingList,
} from '../database/query';
import {
  deleteDataById,
  deleteShoppingListItem,
  deleteStockedFood,
} from '../database/utils';
import {db} from '../database';
import Toast from 'react-native-toast-message';
import {useAsyncEffect} from 'ahooks';
import {Layer} from '../types';
const StrMap: Record<Layer, string> = {
  Fresh: 'Refrigerator freshness layer',
  Frozen: 'Refrigerator freezer compartment',
  Normal: 'Pantry',
};

export const EditFoodScreen = ({route}: {route: any}) => {
  const item = route.params.item;
  const layer = route.params.layer as Layer;
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);
  useAsyncEffect(async () => {
    const ret = await getFoodItemById(item.key);
    if (ret?.recommended_layer && ret?.recommended_layer !== layer) {
      Toast.show({
        type: 'info',
        text1: 'Suggested storage locations',
        text2: `It is recommended to store your belongings on ${
          StrMap[ret.recommended_layer as Layer]
        }`,
      });
    }
  });
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
            <View style={{display: 'flex', flexDirection: 'row'}}>
              <Icon
                name="delete"
                size={25}
                color="white"
                style={{marginRight: 10}}
                onPress={async () => {
                  const retShoppingList = await queryShoppingList(item.key);
                  const retStocked = await queryFoodStock(item.key);
                  const haveRet = retShoppingList?.length || retStocked?.length;
                  Alert.alert(
                    'Notice',
                    haveRet
                      ? 'The food has been added to the shopping list or stocked, deleting the food will delete the corresponding food in the shopping list, is the deletion confirmed?'
                      : 'Are you sure you want to perform this operation?',
                    [
                      {text: '取消', style: 'cancel'},
                      {
                        text: '确定',
                        onPress: async () => {
                          if (haveRet) {
                            await deleteShoppingListItem(db, item.key);
                            await deleteStockedFood(db, item.key);
                            emitter.emit('Home/refresh');
                          }
                          await deleteDataById(db, 'food_items', item.key);
                          Toast.show({
                            type: 'success',
                            text1: 'Delete preset food',
                            text2: `Successfully delete preset food ${item.displayValue}!`,
                          });
                          emitter.emit('AddFood/fresh');
                          navigation.goBack();
                        },
                      },
                    ],
                    {cancelable: false},
                  );
                }}
              />
              <Icon
                name="add-shopping-cart"
                size={25}
                color="white"
                onPress={() => {
                  setVisible(true);
                }}
              />
            </View>
          </View>
          <ItemAdd
            multiplyMode={false}
            categoryId={item.categoryId}
            categoryName={item.categoryName}
            itemName={item.displayValue}
            itemId={item.key}
            defaultLifeSpan={item.defaultLifeSpan}
          />
          <AddShoppingListModal
            visible={visible}
            setVisible={setVisible}
            foodName={item.displayValue}
            foodId={item.key}
            categoryId={item.categoryId}
            categoryName={item.categoryName}
            editMode={false}
          />
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
