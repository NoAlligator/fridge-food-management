import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {COLORS} from '../constants';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {ItemAdd} from '../components/item-add';
import {LayerContext} from '../store';
import {useNavigation} from '@react-navigation/native';
import {AddShoppingListModal} from '../components/add-shopping-list';
export const EditFoodScreen = ({route}: {route: any}) => {
  const item = route.params.item;
  const layer = route.params.layer;
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);
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
            <Icon
              name="add-shopping-cart"
              size={25}
              color="white"
              onPress={() => {
                setVisible(true);
              }}
            />
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
