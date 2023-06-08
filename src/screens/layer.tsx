/* eslint-disable react-native/no-inline-styles */
import React, {FC, useCallback, useEffect, useState, useMemo} from 'react';
import {ScrollView, View} from 'react-native';
import {AddFAB} from '../components/add-main-page';
import {RefreshContext, emitter} from '../store';
import {useAsyncEffect} from 'ahooks';
import {Layer, ShopListItem, StockFood} from '../types';
import {FoodList} from '../components/food-list';
import {
  TerminateType,
  getFoodInStockByLayer,
  getFoodTotalAmount,
  handleTerminateSingleFood,
} from '../database/query';
import {FAB} from '@rneui/themed';
import {db} from '../database';
import {
  deleteDataByIds,
  queryByCondition,
  updateDataById,
} from '../database/utils';

export type Mode = 'display' | 'delete' | 'exhausted' | 'discard';

export const LayerScreen: FC<{layer: Layer}> = ({layer}) => {
  const [data, setData] = useState<StockFood[]>([]);
  useAsyncEffect(async () => {
    const value = await getFoodInStockByLayer(layer);
    setData(value as any);
  }, []);
  const dataMap = useMemo<Map<number, number>>(
    () => new Map(data.map(({id, food_id}) => [id, food_id])),
    [data],
  );
  const refresh = useCallback(async () => {
    const value = await getFoodInStockByLayer(layer);
    setData(value as any);
  }, [layer]);
  useEffect(() => {
    emitter.on('Home/refresh', refresh);
    return () => {
      emitter.off('Home/refresh', refresh);
    };
  }, [refresh]);
  const [mode, setMode] = useState<Mode>('display');
  const [selected, setSelected] = useState<number[]>([]);

  // 必须在操作数据库之后执行
  const autoListUpdater = useCallback(
    async (ids: number[]) => {
      return await Promise.all(
        ids.map(async stock_id => {
          const food_id = dataMap.get(stock_id);
          // 获取是否有自动计划
          const _data = await queryByCondition(db, 'shopping_list_foods', {
            food_id,
            auto: 1,
          });
          if (_data.length) {
            const {auto_min_amount, auto_exp_amount, id} =
              _data[0] as ShopListItem;
            // 获取剩余总数
            const retAmount = await getFoodTotalAmount(food_id as number);
            // 剩余低于警戒线
            if (retAmount < (auto_min_amount as number)) {
              const amountToAdd = (auto_exp_amount as number) - retAmount;
              updateDataById(db, 'shopping_list_foods', id, {
                amount: amountToAdd,
                checked: 0,
              });
            }
          }
        }),
      );
    },
    [dataMap],
  );

  const deleteSelected = async () => {
    if (!selected.length) {
      return setMode('display');
    } else {
      try {
        setMode('display');
        await deleteDataByIds(db, 'food_stocks', selected);
        await autoListUpdater(selected);
        setSelected([]);
      } catch (e) {}
    }
  };
  const exhaustedSelected = async () => {
    setMode('display');
    await Promise.all(
      selected.map(id => handleTerminateSingleFood(id, TerminateType.USED)),
    );
    setSelected([]);
    await autoListUpdater(selected);
    await refresh();
  };

  const wastedSelected = async () => {
    setMode('display');
    await Promise.all(
      selected.map(id => handleTerminateSingleFood(id, TerminateType.WASTED)),
    );
    setSelected([]);
    await autoListUpdater(selected);
    await refresh();
  };
  return (
    <>
      <RefreshContext.Provider value={refresh}>
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
              autoListUpdater={autoListUpdater}
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
              layer={layer}
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
      </RefreshContext.Provider>
    </>
  );
};
