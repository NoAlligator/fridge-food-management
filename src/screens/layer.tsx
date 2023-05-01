/* eslint-disable react-native/no-inline-styles */
import React, {FC, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {AddFAB} from '../components/add-main-page';
import {LayerContext, RefreshContext} from '../store';
import {useAsyncEffect} from 'ahooks';
import {Layer, StockFood} from '../types';
import {FoodList} from '../components/food-list';
import {
  TerminateType,
  getFoodInStockByLayer,
  handleTerminateSingleFood,
} from '../database/query';
import {FAB} from '@rneui/themed';
import {db} from '../database';
import {deleteDataByIds} from '../database/utils';

export type Mode = 'display' | 'delete' | 'exhausted' | 'discard';

export const LayerScreen: FC<{layer: Layer}> = ({layer}) => {
  const [data, setData] = useState<StockFood[]>([]);
  useAsyncEffect(async () => {
    const value = await getFoodInStockByLayer(layer);
    setData(value as any);
  }, []);
  const refresh = async () => {
    const value = await getFoodInStockByLayer(layer);
    setData(value as any);
  };
  const [mode, setMode] = useState<Mode>('display');
  const [selected, setSelected] = useState<number[]>([]);
  const deleteSelected = async () => {
    if (!selected.length) {
      return setMode('display');
    } else {
      try {
        setMode('display');
        await deleteDataByIds(db, 'food_stocks', selected);
        setSelected([]);
      } catch (e) {}
    }
  };
  const exhaustedSelected = async () => {
    setMode('display');
    setSelected([]);
    await Promise.all(
      selected.map(id => handleTerminateSingleFood(id, TerminateType.USED)),
    );
    await refresh();
  };

  const wastedSelected = async () => {
    setMode('display');
    setSelected([]);
    await Promise.all(
      selected.map(id => handleTerminateSingleFood(id, TerminateType.WASTED)),
    );
    await refresh();
  };
  return (
    <RefreshContext.Provider value={refresh}>
      <LayerContext.Provider value={layer}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgb(222, 222, 222)',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: '100%',
            paddingHorizontal: 10,
          }}>
          <ScrollView style={{flex: 1}}>
            <FoodList
              data={data}
              selected={selected}
              setSelected={setSelected}
              mode={mode}
            />
            <View style={{height: 150}} />
          </ScrollView>
          {mode === 'delete' && (
            <FAB
              visible={true}
              placement="right"
              icon={{name: 'delete', color: 'white'}}
              style={{bottom: 80}}
              color="rgb(255, 95, 87)"
              onPress={async () => {
                setMode('display');
                await deleteSelected();
                await refresh();
              }}
            />
          )}
          {mode === 'exhausted' && (
            <FAB
              visible={true}
              placement="right"
              icon={{name: 'done', color: 'white'}}
              style={{bottom: 80}}
              color="rgb(255, 189, 46)"
              onPress={async () => {
                await exhaustedSelected();
              }}
            />
          )}
          {mode === 'discard' && (
            <FAB
              visible={true}
              placement="right"
              icon={{name: 'auto-delete', color: 'white'}}
              style={{bottom: 80}}
              color="black"
              onPress={async () => {
                await wastedSelected();
              }}
            />
          )}
          {mode === 'display' ? (
            <AddFAB
              mode={mode}
              setMode={setMode}
              refresh={refresh}
              showEdit={data.length > 0}
            />
          ) : (
            <FAB
              visible={true}
              placement="right"
              icon={{name: 'close', color: 'white'}}
              color="grey"
              onPress={() => {
                setMode('display');
                setSelected([]);
              }}
            />
          )}
        </View>
      </LayerContext.Provider>
    </RefreshContext.Provider>
  );
};
