/* eslint-disable react-native/no-inline-styles */
import React, {FC, useCallback, useContext, useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {Button, Divider} from '@rneui/themed';
import {COLORS} from '../constants';
import CustomAlphabetList from './alphabet-flat-list';
import {useAsyncEffect} from 'ahooks';
import {getAllCategories} from '../database/query';
import {FoodCategory} from '../types';
import {ShoppingModeContext, emitter} from '../store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Pressable} from '@react-native-material/core';
const CategoryButton: FC<{
  name: string;
  activeId: number | null;
  id: number;
  setActiveCategoryId: React.Dispatch<React.SetStateAction<number | null>>;
}> = ({name, activeId, id, setActiveCategoryId}) => {
  const isActivated = activeId === id;
  return (
    <Button
      onPress={() => {
        if (activeId === id) {
          return setActiveCategoryId(null);
        } else {
          setActiveCategoryId(id);
        }
      }}
      type={isActivated ? 'solid' : 'outline'}
      buttonStyle={{
        borderColor: COLORS.background,
        backgroundColor: isActivated ? COLORS.background : 'white',
      }}>
      <Text style={{color: isActivated ? 'white' : 'black', fontSize: 10}}>
        {name}
      </Text>
    </Button>
  );
};

export const AddFoodCategoriesAndList: FC<{
  filterText: string;
}> = ({filterText}) => {
  const inSearch = filterText !== '';
  const [activeCategoryId, setActiveCategoryId] = useState<null | number>(null);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  useAsyncEffect(async () => {
    await refresh();
  }, []);
  const refresh = useCallback(async () => {
    const data = await getAllCategories();
    console.log('refresh', data);
    setCategories(data as any);
    if (data.length) {
      setActiveCategoryId(data[0].id);
    }
  }, []);

  const [folded, setFolded] = useState(false);

  return (
    <View style={{display: 'flex', height: '100%', flex: 1}}>
      {!inSearch && !folded && (
        <>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginTop: 5,
            }}>
            {categories.map(({name, id}) => (
              <View style={{flexBasis: '33.33%', padding: 5}} key={id}>
                <CategoryButton
                  name={name}
                  id={id}
                  activeId={activeCategoryId}
                  setActiveCategoryId={setActiveCategoryId}
                />
              </View>
            ))}
          </View>
          <Divider style={{margin: 5}} />
        </>
      )}
      {!inSearch && (
        <Pressable
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            paddingVertical: 10,
          }}
          onPress={() => {
            setFolded(!folded);
          }}>
          {folded ? (
            <Icon name="arrow-collapse-down" />
          ) : (
            <Icon name="arrow-collapse-up" />
          )}
        </Pressable>
      )}
      <CustomAlphabetList
        activeCategoryId={activeCategoryId}
        filterText={filterText}
      />
    </View>
  );
};
