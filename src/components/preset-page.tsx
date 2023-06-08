/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useEffect, useMemo} from 'react';
import {FC, useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {Button, Card, Divider} from '@rneui/themed';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFoodItem, useFoodItemWhole} from '../hooks/useFoodItem';
import {AsyncStorageKeys, COLORS} from '../constants';
import useAsyncStorage from '../hooks/useAsyncStorage';
import {FoodCategory, FoodItem, StockFood} from '../types';
import 'react-native-get-random-values';
import NumericInput from 'react-native-numeric-input';
import Toast from 'react-native-toast-message';

import {Picker} from '@react-native-picker/picker';
import {useCategories} from '../hooks/useCategories';
import {insertDataToTable, updateDataById} from '../database/utils';
import {db} from '../database';
import {useNavigation} from '@react-navigation/native';
import {emitter} from '../store';

export const PresetPage: FC<{
  itemData?: StockFood;
  lifeSpan?: number;
}> = ({itemData, lifeSpan}) => {
  const createNew = itemData === undefined;
  const {id, name, category_id, category_name, layer} = itemData ?? {};
  // 集合
  const cats = useCategories();
  const catsItems = useMemo<
    {
      label: string;
      value: number;
    }[]
  >(
    () =>
      (cats as FoodCategory[]).map(({id, name}) => ({
        label: name,
        value: id,
      })),
    [cats],
  );
  // 集合
  const [curCat, setCurCat] = useState(category_id);

  // 提前通知时间
  const [_ent] = useAsyncStorage(
    AsyncStorageKeys.expirationNotificationTime,
    7,
  );
  const [entValue, setEntValue] = useState(_ent);

  // 通知频率
  const [_freq] = useAsyncStorage(
    AsyncStorageKeys.expirationNotificationFreq,
    12,
  );
  const [freqValue, setFreqValue] = useState(_freq);

  // 默认保质期
  const initLifeSpanFresh =
    typeof lifeSpan === 'number' && layer === 'Fresh' ? lifeSpan : 7;
  const [lifeSpanFresh, setLifeSpanFresh] = useState(initLifeSpanFresh);
  const changeLifeSpanFresh = (v: number) => setLifeSpanFresh(Number(v));

  const initLifeSpanFreezer =
    typeof lifeSpan === 'number' && layer === 'Frozen' ? lifeSpan : 7;
  const [lifeSpanFreezer, setLifeSpanFreezer] = useState(initLifeSpanFreezer);
  const changeLifeSpanFreezer = (v: number) => setLifeSpanFreezer(Number(v));

  const initLifeSpanPantry =
    typeof lifeSpan === 'number' && layer === 'Normal' ? lifeSpan : 7;
  const [lifeSpanPantry, setLifeSpanPantry] = useState(initLifeSpanPantry);
  const changeLifeSpanPantry = (v: number) => setLifeSpanPantry(Number(v));

  // Unit
  const [unit, setUnit] = useFoodItem(id, 'food_unit');

  // Food name
  const [foodName, setFoodName] = useState(name);

  // Layer
  const [realLayer, setLayer] = useState(layer);
  const [items] = useState([
    {label: 'Fridge', value: 'Fresh'},
    {label: 'Freezer', value: 'Frozen'},
    {label: 'Pantry', value: 'Normal'},
  ]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [foodItemInDatabase] = useFoodItemWhole(id) as [FoodItem | undefined];
  const {
    fresh_persist_time: _fresh_persist_time,
    frozen_persist_time: _frozen_persist_time,
    normal_persist_time: _normal_persist_time,
    food_unit: _food_unit,
  } = foodItemInDatabase ?? {};
  useEffect(() => {
    if (!createNew && foodItemInDatabase) {
      if (layer !== 'Fresh' && typeof _fresh_persist_time === 'number') {
        setLifeSpanFresh(_fresh_persist_time);
      }
      if (layer !== 'Frozen' && typeof _frozen_persist_time === 'number') {
        setLifeSpanFreezer(_frozen_persist_time);
      }
      if (layer !== 'Normal' && typeof _normal_persist_time === 'number') {
        setLifeSpanPantry(_normal_persist_time);
      }
      if (!unit && _food_unit) {
        setUnit(_food_unit);
      }
    }
  }, [
    _food_unit,
    _fresh_persist_time,
    _frozen_persist_time,
    _normal_persist_time,
    createNew,
    foodItemInDatabase,
    layer,
    setUnit,
    unit,
  ]);
  const handlePress = async () => {
    const data = {
      name: foodName,
      category_id: curCat,
      category_name: catsItems.find(({value}) => curCat === value)?.label,
      fresh_persist_time: lifeSpanFresh,
      frozen_persist_time: lifeSpanFreezer,
      normal_persist_time: lifeSpanPantry,
      recommended_layer: realLayer,
      food_unit: unit,
      outdate_notice_advance_time: entValue,
      outdate_notice_frequency: freqValue,
    };
    if (!createNew) {
      setLoading(true);
      await updateDataById(db, 'food_items', id as number, data);
      emitter.emit('AddFood/fresh');
      navigation.goBack();
      Toast.show({
        type: 'success',
        text1: 'Save Preset',
        text2: 'Your preset for had saved',
      });
    } else {
      setLoading(true);
      if (!foodName || foodName === '') {
        setLoading(false);
        return Toast.show({
          type: 'error',
          text1: 'Required',
          text2: 'Food name is required! Please input!',
        });
      }
      if (typeof curCat !== 'number') {
        setLoading(false);
        return Toast.show({
          type: 'error',
          text1: 'Required',
          text2: 'Category is required! Please select!',
        });
      }
      await insertDataToTable(db, 'food_items', data);
      emitter.emit('AddFood/fresh');
      navigation.goBack();
      Toast.show({
        type: 'success',
        text1: 'Create Food',
        text2: "Your Food & its' preset have saved",
      });
    }
  };
  const FreshInputNumber = useCallback(
    () => (
      <NumericInput
        value={lifeSpanFresh}
        onChange={changeLifeSpanFresh}
        minValue={1}
      />
    ),
    [lifeSpanFresh],
  );
  const FrozenInputNumber = useCallback(
    () => (
      <NumericInput
        value={lifeSpanFreezer}
        onChange={changeLifeSpanFreezer}
        minValue={1}
      />
    ),
    [lifeSpanFreezer],
  );
  const PantryInputNumber = useCallback(
    () => (
      <NumericInput
        value={lifeSpanPantry}
        onChange={changeLifeSpanPantry}
        minValue={1}
      />
    ),
    [lifeSpanPantry],
  );
  return (
    <View style={{display: 'flex', marginTop: 10}}>
      <Card>
        <Card.Title>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {createNew ? (
              <>
                <Text
                  style={{
                    color: COLORS.background,
                    fontSize: 20,
                    marginRight: 20,
                  }}>
                  Name*
                </Text>
                <TextInput
                  style={{color: COLORS.background, fontSize: 20}}
                  placeholder="Input name..."
                  placeholderTextColor="#888"
                  value={foodName}
                  onChangeText={v => setFoodName(v)}
                />
                <Icon name="edit" />
              </>
            ) : (
              <Text style={{color: COLORS.background, fontSize: 30}}>
                {foodName}
              </Text>
            )}
            {/*
            <Text style={{color: 'black', fontSize: 18}}> Add Food: </Text>
            <TextInput
              style={{color: 'black', fontSize: 18}}
              placeholder="Input name"
              placeholderTextColor="#888"
              value={foodName}
              onChangeText={v => setFoodName(v)}
            />
            */}
          </View>
        </Card.Title>
        <Card.Divider />
        <View style={[styles.listContainerLayout]}>
          <View style={[styles.titleContainer, {marginRight: 20}]}>
            <Icon
              name="folder"
              size={25}
              style={{marginRight: 5}}
              color="black"
            />
            <Text style={styles.listTitle}>Category*</Text>
          </View>
          {createNew ? (
            <View style={{flex: 1}}>
              <Picker selectedValue={curCat} onValueChange={setCurCat}>
                {catsItems.map(({label, value}) => (
                  <Picker.Item label={label} value={value} key={value} />
                ))}
              </Picker>
            </View>
          ) : (
            <Text style={styles.contentText}>{category_name}</Text>
          )}
        </View>
        <Divider />
        <View style={[styles.listContainerLayout]}>
          <View style={[styles.titleContainer, {marginRight: 20}]}>
            <Icon
              name="location-on"
              size={25}
              style={{marginRight: 5}}
              color="black"
            />
            <Text style={styles.listTitle}>Location*</Text>
          </View>
          <View style={{flex: 1}}>
            <Picker
              selectedValue={realLayer as any}
              onValueChange={v => {
                setLayer(v as any);
              }}>
              {items.map(({label, value}) => (
                <Picker.Item label={label} value={value} key={value} />
              ))}
            </Picker>
          </View>
        </View>
        <Divider />
        <View style={styles.listContainerLayout}>
          <View style={[styles.titleContainer, {marginRight: 35}]}>
            <Icon2
              name="weight"
              size={25}
              style={{marginRight: 5}}
              color="black"
            />
            <Text style={styles.listTitle}>Unit</Text>
          </View>
          <View
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <TextInput
              style={{color: 'black'}}
              placeholderTextColor="#888"
              placeholder="Input unit..."
              value={unit}
              onChangeText={v => setUnit(v)}
            />
            <Icon name="edit" />
          </View>
        </View>
        <Divider />
        <View style={{height: 50}} />
        <View style={styles.listContainerLayout}>
          <View style={styles.titleContainer}>
            <Icon2
              name="fridge-top"
              size={25}
              style={{marginRight: 5}}
              color="black"
            />
            <Text style={styles.listTitle}>Shelf Life (Fridge)</Text>
          </View>
          <View>
            <FreshInputNumber />
          </View>
        </View>
        <Divider />
        <View style={styles.listContainerLayout}>
          <View style={styles.titleContainer}>
            <Icon2
              name="snowflake"
              size={25}
              style={{marginRight: 5}}
              color="black"
            />
            <Text style={styles.listTitle}>Shelf Life (Freezer)</Text>
          </View>
          <View>
            <FrozenInputNumber />
          </View>
        </View>
        <Divider />
        <View style={styles.listContainerLayout}>
          <View style={styles.titleContainer}>
            <Icon
              name="all-inbox"
              size={25}
              style={{marginRight: 5}}
              color="black"
            />
            <Text style={styles.listTitle}>Shelf Life (Pantry)</Text>
          </View>
          <View>
            <PantryInputNumber />
          </View>
        </View>
        <Divider />
        <View style={{height: 50}} />
        <View style={[styles.listContainerLayout]}>
          <View style={styles.titleContainer}>
            <Icon
              name="timer"
              size={25}
              style={{marginRight: 5}}
              color="black"
            />
            <Text style={styles.listTitle}>Near Expiration Date</Text>
          </View>
          <View>
            <NumericInput
              value={entValue}
              onChange={v => setEntValue(Number(v))}
              minValue={0}
            />
          </View>
        </View>
        <Divider />
        <View style={[styles.listContainerLayout]}>
          <View style={styles.titleContainer}>
            <Icon
              name="repeat"
              size={25}
              style={{marginRight: 5}}
              color="black"
            />
            <Text style={styles.listTitle}>Reminder Frequency</Text>
          </View>
          <View>
            <NumericInput
              value={freqValue}
              onChange={v => setFreqValue(Number(v))}
              minValue={3}
            />
          </View>
        </View>
        <Divider />
      </Card>
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: 20,
          marginHorizontal: 14,
        }}>
        <View>
          <Button
            color={COLORS.background}
            onPress={handlePress}
            loading={loading}>
            Save
          </Button>
        </View>
        {/* <View style={{marginTop: 20}}>
          <Button
            buttonStyle={{
              borderColor: COLORS.background,
            }}
            titleStyle={{
              color: COLORS.background,
            }}
            type="outline">
            Save
          </Button>
        </View> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  listTitle: {
    color: 'black',
    fontSize: 14,
  },
  listContainerLayout: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  contentText: {
    color: 'black',
    fontSize: 15,
  },
});
