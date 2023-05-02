/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {SpeedDial} from '@rneui/themed';
import {COLORS, SIZE} from '../constants';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {useAsyncEffect} from 'ahooks';
import {checkShoppingListFood, getAllShoppingListFood} from '../database/query';
import {ShopListItem} from '../types';
import {FAB, ListItem} from '@rneui/themed';
import {Pressable} from '@react-native-material/core';
import {deleteDataByIds} from '../database/utils';
import {db} from '../database';
import AlertAsync from 'react-native-alert-async';
import {emitter} from '../store';
import {AddShoppingListModal} from '../components/add-shopping-list';

const Block = ({
  data,
  selected,
  setSelected,
  refresh,
  mode,
}: {
  data: ShopListItem;
  selected: any;
  setSelected: any;
  refresh: any;
  mode: Mode;
}) => {
  const {
    food_name,
    food_id,
    auto,
    amount,
    id,
    checked,
    category_id,
    category_name,
  } = data;
  const meSelected = useMemo(() => selected.has(id), [selected, id]);
  const handlePressCheckbox = (event: any) => {
    event.stopPropagation();
    const newSet = new Set([...selected]);
    if (selected.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelected(newSet);
  };
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Pressable
        onPress={async e => {
          if (mode === 'display') {
            await checkShoppingListFood(id, checked === 1 ? 0 : 1);
            await refresh();
          } else {
            handlePressCheckbox(e);
          }
        }}
        onLongPress={() => {
          setVisible(true);
        }}
        style={{
          backgroundColor: checked ? 'rgba(255, 255, 255, 0)' : 'white',
        }}
        key={id}>
        <ListItem
          containerStyle={{backgroundColor: 'transparent'}}
          bottomDivider>
          {mode !== 'display' && (
            <ListItem.CheckBox
              containerStyle={{
                backgroundColor: checked ? 'rgba(255, 255, 255, 0)' : 'white',
              }}
              iconType="material-community"
              checkedIcon="checkbox-marked"
              uncheckedIcon="checkbox-blank-outline"
              checked={meSelected}
              onPress={handlePressCheckbox}
            />
          )}
          <ListItem.Content>
            <ListItem.Title
              style={{
                textDecorationLine: checked ? 'line-through' : 'none',
                color: checked ? 'grey' : 'black',
              }}>
              {food_name}
            </ListItem.Title>
            <ListItem.Subtitle
              style={{
                textDecorationLine: checked ? 'line-through' : 'none',
                color: checked ? 'grey' : 'black',
              }}>
              x{amount}
            </ListItem.Subtitle>
          </ListItem.Content>
          {auto === 1 && <Icon name="update" size={20} />}
        </ListItem>
      </Pressable>
      <AddShoppingListModal
        visible={visible}
        setVisible={setVisible}
        foodName={food_name}
        foodId={food_id}
        categoryId={category_id}
        categoryName={category_name}
        editMode
        editModeData={data}
      />
    </>
  );
};

type Mode = 'display' | 'delete' | 'storage';

export const ShoppingList = () => {
  const navigation = useNavigation();
  const [data, setData] = useState<ShopListItem[]>([]);
  const [mode, setMode] = useState<Mode>('display');
  const [selected, setSelected] = useState(() => new Set());
  const refresh = useCallback(async () => {
    const ret = await getAllShoppingListFood();
    setData(ret as ShopListItem[]);
  }, []);
  useAsyncEffect(async () => {
    await refresh();
  }, []);
  const [open, setOpen] = useState(false);
  const reset = useCallback(async () => {
    setMode('display');
    setSelected(new Set());
    await refresh();
  }, [refresh]);
  useEffect(() => {
    emitter.on('Shopping/reset', reset);
    return () => {
      emitter.off('Shopping/reset', reset);
    };
  }, [reset]);
  return (
    <>
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
        <View style={{display: 'flex', height: '100%'}}>
          <ScrollView style={{flex: 1}}>
            {data.map(item => {
              if (item.auto === 1 && item.amount === 0) {
                return null;
              }
              return (
                <Block
                  key={item.id}
                  mode={mode}
                  data={item}
                  selected={selected}
                  setSelected={setSelected}
                  refresh={refresh}
                />
              );
            })}
            <View style={{height: 30}} />
          </ScrollView>
        </View>
      </View>
      {mode == 'display' ? (
        <SpeedDial
          isOpen={open}
          icon={{name: 'edit', color: 'white'}}
          openIcon={{name: 'close', color: 'white'}}
          onOpen={() => setOpen(!open)}
          onClose={() => setOpen(!open)}
          color={COLORS.background}>
          <SpeedDial.Action
            icon={{name: 'add', color: 'white'}}
            buttonStyle={{backgroundColor: 'rgb(40, 200, 64)'}}
            title="Add"
            onPress={() => {
              setOpen(!open);
              // @ts-ignore
              navigation.navigate('AddFood', {
                shoppingListMode: true,
              });
            }}
          />
          <SpeedDial.Action
            icon={{name: 'delete', color: 'white'}}
            buttonStyle={{backgroundColor: 'rgb(255, 95, 87)'}}
            title="Delete"
            onPress={() => {
              setMode('delete');
              setOpen(!open);
            }}
          />
          <SpeedDial.Action
            icon={{name: 'archive', color: 'white'}}
            buttonStyle={{backgroundColor: 'rgb(254, 188, 46)'}}
            title="Storage"
            onPress={() => {
              setMode('storage');
              setOpen(!open);
            }}
          />
        </SpeedDial>
      ) : (
        <>
          {mode === 'delete' && (
            <View style={{position: 'absolute', right: 16, bottom: 90}}>
              <FAB
                visible={true}
                icon={{name: 'delete', color: 'white'}}
                buttonStyle={{backgroundColor: 'rgb(255, 95, 87)'}}
                onPress={async () => {
                  if ((selected as any).size === 0) {
                    return setMode('display');
                  } else {
                    const dataMap = new Map();
                    const list = [] as ShopListItem[];
                    data.forEach(({id}, index) => {
                      dataMap.set(id, data[index]);
                    });
                    selected.forEach(id => {
                      list.push(dataMap.get(id));
                    });
                    const autoList = list.filter(value => value.auto === 1);
                    if (autoList.length) {
                      const ret = await AlertAsync(
                        'Notice',
                        'You have selected a food that is automatically added to your shopping list. Deleting it will turn off the automatic addition of that food. Are you sure?',
                        [
                          {text: 'Yes', onPress: () => Promise.resolve(true)},
                          {text: 'No', onPress: () => Promise.resolve(false)},
                        ],
                        {
                          cancelable: true,
                          onDismiss: () => Promise.resolve(false),
                        },
                      );
                      if (ret === false) {
                        return;
                      }
                    }
                    await deleteDataByIds(
                      db,
                      'shopping_list_foods',
                      list.map(({id}) => id),
                    );
                    await refresh();
                    setSelected(new Set());
                    setMode('display');
                  }
                }}
              />
            </View>
          )}
          {mode === 'storage' && (
            <View style={{position: 'absolute', right: 16, bottom: 90}}>
              <FAB
                icon={{name: 'archive', color: 'white'}}
                buttonStyle={{backgroundColor: 'rgb(254, 188, 46)'}}
                visible={true}
                onPress={() => {
                  const dataMap = new Map();
                  const list = [] as ShopListItem[];
                  data.forEach(({id}, index) => {
                    dataMap.set(id, data[index]);
                  });
                  selected.forEach(id => {
                    list.push(dataMap.get(id));
                  });
                  // @ts-ignore
                  navigation.navigate('MultiEdit', {
                    items: list,
                    layer: 'Fresh',
                  });
                }}
              />
            </View>
          )}
          <View style={{position: 'absolute', right: 16, bottom: 16}}>
            <FAB
              onPress={() => {
                setMode('display');
                setSelected(new Set());
              }}
              buttonStyle={{backgroundColor: 'grey'}}
              visible={true}
              icon={{name: 'cancel', color: 'white'}}
            />
          </View>
        </>
      )}
    </>
  );
};
