import React, {FC, useState} from 'react';
import {Text, View} from 'react-native';
import {Button, Divider} from '@rneui/themed';
import {COLORS} from '../constants';
import List from './alphabet-flat-list';
import {useAsyncEffect} from 'ahooks';
import {getAllCategories} from '../database/query';
import {FoodCategory} from '../types';
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

export const AddFood: FC<{
  filterText: string;
}> = ({filterText}) => {
  const inSearch = filterText !== '';
  const [activeCategoryId, setActiveCategoryId] = useState<null | number>(null);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  useAsyncEffect(async () => {
    const data = await getAllCategories();
    setCategories(data as any);
  }, []);
  return (
    <View style={{display: 'flex', height: '100%', flex: 1}}>
      {!inSearch && (
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
      <List activeCategoryId={activeCategoryId} filterText={filterText} />
    </View>
  );
};