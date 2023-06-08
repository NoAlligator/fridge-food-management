/* eslint-disable react-native/no-inline-styles */
import {Button} from '@rneui/themed';
import React, {useCallback, useState} from 'react';
import {Dispatch, FC} from 'react';
import {Modal, StyleSheet, Text, View} from 'react-native';
import {CheckBox} from '@rneui/themed';

import NumericInput from 'react-native-numeric-input';
import {AsyncStorageKeys, CHANNEL_ID, COLORS} from '../constants';
import {
  insertDataToTable,
  sumFieldById,
  updateDataById,
} from '../database/utils';
import {db} from '../database';
import {Toast} from 'react-native-toast-message/lib/src/Toast';
import {getAutoShoppingListFoodById} from '../database/query';
import {useAsyncEffect} from 'ahooks';
import {emitter} from '../store';
import {ShopListItem} from '../types';
import PushNotification from 'react-native-push-notification';
import useAsyncStorage from '../hooks/useAsyncStorage';
export const AddShoppingListModal: FC<{
  visible: boolean;
  setVisible: Dispatch<React.SetStateAction<boolean>>;
  foodName: string;
  foodId: number;
  categoryId: number;
  categoryName: string;
  editMode: boolean;
  editModeData?: ShopListItem;
}> = ({
  visible,
  setVisible,
  foodName,
  foodId,
  categoryId,
  categoryName,
  editMode = false,
  editModeData = {},
}) => {
  const [amount, setAmount] = useState(1);
  const [expAmount, setExpAmount] = useState(1);
  const [warnAmount, setWarnAmount] = useState(0);
  const [checked, setChecked] = useState(
    editMode ? editModeData.auto === 1 : false,
  );
  const [hasAuto, setHasAuto] = useState(false);
  const [autoData, setAutoData] = useState<any>();
  const refresh = useCallback(async () => {
    const data = await getAutoShoppingListFoodById(foodId);
    if (data) {
      setHasAuto(true);
      setAutoData(data);
      setExpAmount(data.auto_exp_amount);
      setWarnAmount(data.auto_min_amount);
    }
  }, [foodId]);
  useAsyncEffect(async () => {
    await refresh();
  }, []);
  const [globalNotification] = useAsyncStorage(
    AsyncStorageKeys.globalNotification,
    true,
  );
  const [exhaustedNotification] = useAsyncStorage(
    AsyncStorageKeys.exhaustedNotification,
    true,
  );
  const handlePress = async () => {
    if (checked) {
      // 自动模式
      setVisible(false);
      const data = await sumFieldById(
        db,
        'food_stocks',
        'food_id',
        foodId,
        'amount',
      );
      let amount = expAmount;
      const {sum_field} = (data as any)[0];
      if (typeof sum_field === 'number' && sum_field < amount) {
        // 数量不足，立即入库
        amount = amount - sum_field;
      }
      if (hasAuto) {
        // 已有自动计划，自动更新
        await updateDataById(db, 'shopping_list_foods', autoData.id, {
          amount,
          auto_exp_amount: expAmount,
          auto_min_amount: warnAmount,
          checked: 0,
        });
        Toast.show({
          type: 'success',
          text1: 'Shopping List',
          text2: `Successfully edit your automatic shopping list item ${foodName}!`,
        });
      } else {
        await insertDataToTable(db, 'shopping_list_foods', {
          food_name: foodName,
          food_id: foodId,
          category_id: categoryId,
          category_name: categoryName,
          amount: amount,
          auto: 1,
          auto_exp_amount: expAmount,
          auto_min_amount: warnAmount,
        });
        Toast.show({
          type: 'success',
          text1: 'Shopping List',
          text2: `Successfully Add ${foodName} to your automatic shopping list!`,
        });
      }
      emitter.emit('Shopping/reset');
      await refresh();
      setChecked(false);
      setAmount(1);
      setTimeout(() => {
        if (
          sum_field <= warnAmount &&
          globalNotification &&
          exhaustedNotification
        ) {
          PushNotification.localNotification({
            channelId: CHANNEL_ID,
            title: 'Exhausted Notice',
            message: `The ${foodName} may exhausted sooner!`,
          });
        }
      }, 2000);
    } else {
      // 普通模式
      setVisible(false);
      setAmount(1);
      await insertDataToTable(db, 'shopping_list_foods', {
        food_name: foodName,
        food_id: foodId,
        category_id: categoryId,
        category_name: categoryName,
        amount: amount,
        auto: 0,
      });
      emitter.emit('Shopping/reset');
      return Toast.show({
        type: 'success',
        text1: 'Shopping List',
        text2: `Successfully Add ${foodName} to your shopping list!`,
      });
    }
  };
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        setVisible(!setVisible);
      }}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View>
            <Text style={{color: COLORS.background, fontSize: 20}}>
              {`${foodName} (${categoryName})`}
            </Text>
          </View>
          <View
            style={{
              width: 200,
              display: 'flex',
              alignItems: 'flex-start',
            }}>
            <CheckBox
              title="Set to automatic addition"
              checked={checked}
              onPress={() => setChecked(!checked)}
              disabled={editMode}
            />
            {!checked ? (
              <View
                style={{
                  marginBottom: 20,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <View style={{width: 80}}>
                  <Text style={{fontSize: 16}}>Quantity</Text>
                </View>
                <NumericInput
                  value={amount}
                  onChange={v => setAmount(Number(v))}
                  minValue={1}
                />
              </View>
            ) : null}
            {checked ? (
              <>
                <View
                  style={{
                    marginVertical: 20,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View style={{width: 80}}>
                    <Text style={{fontSize: 16}}>Expected Quantity</Text>
                  </View>
                  <NumericInput
                    value={expAmount}
                    onChange={v => setExpAmount(Number(v))}
                    minValue={1}
                  />
                </View>
                <View
                  style={{
                    marginBottom: 20,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <View style={{width: 80}}>
                    <Text style={{fontSize: 16}}>Warning Quantity</Text>
                  </View>
                  <NumericInput
                    value={warnAmount}
                    onChange={v => setWarnAmount(Number(v))}
                    minValue={1}
                    maxValue={expAmount}
                    onLimitReached={isMax =>
                      isMax && setWarnAmount(Number(expAmount))
                    }
                  />
                </View>
              </>
            ) : null}
            {checked && hasAuto && !editMode && (
              <Text>
                Notice: This item has been set to be automatically added to the
                shopping list, you are now in editing mode.
              </Text>
            )}
            {editMode && <Text>Notice: You are in edit mode</Text>}
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                width: '100%',
                marginTop: 20,
              }}>
              <Button
                buttonStyle={{
                  borderColor: COLORS.background,
                  marginHorizontal: 20,
                }}
                titleStyle={{
                  color: COLORS.background,
                }}
                type={'outline'}
                onPress={() => setVisible(false)}>
                Cancel
              </Button>
              <Button
                buttonStyle={{
                  backgroundColor: COLORS.background,
                  marginHorizontal: 20,
                }}
                onPress={handlePress}>
                Save
              </Button>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
