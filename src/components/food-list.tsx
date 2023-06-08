/* eslint-disable react-native/no-inline-styles */
import React, {
  Dispatch,
  FC,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {StockFood} from '../types';
import {Modal, StyleSheet, View} from 'react-native';
import {Pressable} from '@react-native-material/core';
import {Text} from '@rneui/base';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import {COLORS} from '../constants';
import {Mode} from '../screens/layer';
import {Badge, Button} from '@rneui/themed';
import NumericInput from 'react-native-numeric-input';
import {getFoodItemById, handleCostSingleFood} from '../database/query';
import {
  FilterContext,
  RefreshContext,
  SearchContext,
  SortContext,
  SortType,
} from '../store';
import moment, {Duration} from 'moment';
import {AddShoppingListModal} from './add-shopping-list';
import {useAsyncEffect} from 'ahooks';

enum Status {
  EXPIRED,
  NORMAL,
  NEAR_EXPIRED,
}

const getStatus = (duration: Duration, outdate_notice_advance_time: number) => {
  const nearExpired =
    duration.asMilliseconds() <= outdate_notice_advance_time * 86400000;
  const hasExpired = duration.asMilliseconds() < 0;
  if (hasExpired) {
    return Status.EXPIRED;
  }
  if (nearExpired) {
    return Status.NEAR_EXPIRED;
  }
  return Status.NORMAL;
};

const getColor = (duration: Duration, outdate_notice_advance_time: number) => {
  const nearExpired =
    duration.asMilliseconds() <= outdate_notice_advance_time * 86400000;
  const hasExpired = duration.asMilliseconds() < 0;
  if (hasExpired) {
    return 'grey';
  }
  if (nearExpired) {
    return 'rgb(255, 25, 12)';
  }
  return 'rgb(82, 196, 26)';
};

const Block: FC<{
  name: string;
  food_unit: string | undefined;
  amount: number;
  mode: Mode;
  selectedSet: Set<number>;
  setSelected: Dispatch<React.SetStateAction<number[]>>;
  id: number; // food_stock id
  food_id: number; // food_item id
  duration: Duration;
  categoryId: number;
  categoryName: string;
  autoListUpdater: (ids: number[]) => any;
  outdate_notice_advance_time: number;
}> = ({
  name,
  amount,
  mode,
  selectedSet,
  setSelected,
  id,
  food_id,
  duration,
  categoryId,
  categoryName,
  autoListUpdater,
  outdate_notice_advance_time,
  food_unit,
}) => {
  const displayMode = mode === 'display';
  const selected = selectedSet.has(id);
  const [modalVisible, setModalVisible] = useState(false);
  const [costValue, setCostValue] = useState(0);
  const [wasteValue, setWasteValue] = useState(0);
  const maxCostValue = useMemo(() => amount - wasteValue, [amount, wasteValue]);
  const maxWasteValue = useMemo(() => amount - costValue, [amount, costValue]);
  const remain = amount - costValue - wasteValue;
  const refresh = useContext(RefreshContext);
  const hasExpired = duration.asMilliseconds() < 0;
  const days = Math.floor(duration.asDays());
  const hours = Math.floor(duration.asHours());
  const [shoppingModal, setShoppingModal] = useState(false);
  const [unit, setUnit] = useState(food_unit);
  useAsyncEffect(async () => {
    if (!unit) {
      const ret = await getFoodItemById(food_id);
      if (ret && ret?.food_unit) {
        setUnit(ret?.food_unit);
      }
    }
  });
  const cornerIcon = displayMode ? null : (
    <View
      style={{
        width: 20,
        height: 20,
        backgroundColor: !selected
          ? 'rgba(102, 102, 102, 0.8)'
          : mode === 'delete'
          ? 'rgba(255, 95, 87, 0.8)'
          : mode === 'discard'
          ? 'black'
          : 'rgba(255, 189, 46, 0.8)',
        borderRadius: 10,
        right: 0,
        top: 5,
        position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      {selected && (
        <Icon2
          name={
            mode === 'delete'
              ? 'delete'
              : mode === 'discard'
              ? 'auto-delete'
              : 'done'
          }
          color="white"
          size={15}
        />
      )}
    </View>
  );
  const color = useMemo(
    () => getColor(duration, outdate_notice_advance_time),
    [duration, outdate_notice_advance_time],
  );
  const expiredIcon = (
    <Badge
      badgeStyle={{backgroundColor: color, borderWidth: 0}}
      containerStyle={{
        left: 2,
        top: 5,
        position: 'absolute',
      }}
      value={
        hasExpired
          ? 'Expired'
          : days > 1
          ? `${days} D`
          : hours > 1
          ? `${hours} H`
          : '< 1 H'
      }
    />
  );
  return (
    <>
      <View
        style={{
          width: '25%',
          paddingHorizontal: 5,
          paddingVertical: 10,
        }}>
        <Pressable
          onPress={() => {
            if (displayMode) {
              return setModalVisible(true);
            }
            if (!selected) {
              setSelected([...selectedSet, id]);
            } else {
              const newset = new Set([...selectedSet]);
              newset.delete(id);
              setSelected([...newset]);
            }
          }}
          style={{
            borderRadius: 10,
            backgroundColor: 'rgb(250, 250, 250)',
            height: 80,
            shadowColor: '#000000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            display: 'flex',
            overflow: 'hidden',
          }}>
          <View
            style={{
              flex: 5,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text>{name}</Text>
          </View>
          <View
            style={{
              flex: 3,
              backgroundColor: 'rgb(239, 239, 239)',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
            }}>
            <Text>
              {amount}
              {unit ? unit : ''}
            </Text>
          </View>
        </Pressable>
        {cornerIcon}
        {expiredIcon}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}>
        <View style={modalStyles.centeredView}>
          <View style={modalStyles.modalView}>
            <View
              style={{
                flex: 5,
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-around',
                paddingHorizontal: 10,
              }}>
              <View
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}>
                <Text style={{fontSize: 20}}>{name}</Text>
              </View>
              <View
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}>
                <Text style={{fontSize: 20}}>Remaining Quantity: {amount}</Text>
              </View>
              <View
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingLeft: 30,
                }}>
                <View style={{width: 100}}>
                  <Text style={{fontSize: 20}}>Used:</Text>
                </View>
                <NumericInput
                  // leftButtonBackgroundColor={COLORS.background}
                  // rightButtonBackgroundColor={COLORS.background}
                  editable={false}
                  value={costValue}
                  onChange={setCostValue}
                  minValue={0}
                  maxValue={maxCostValue}
                />
              </View>
              <View
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingLeft: 30,
                }}>
                <View style={{width: 100}}>
                  <Text style={{fontSize: 20}}>Wasted:</Text>
                </View>
                <NumericInput
                  // leftButtonBackgroundColor={COLORS.background}
                  // rightButtonBackgroundColor={COLORS.background}
                  editable={false}
                  value={wasteValue}
                  onChange={setWasteValue}
                  minValue={0}
                  maxValue={maxWasteValue}
                />
              </View>
              <View
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}>
                <Text style={{fontSize: 20}}>After Consumption: </Text>
                <Text
                  style={{
                    fontSize: 20,
                    color: remain === 0 ? 'red' : 'black',
                  }}>
                  {remain}
                </Text>
              </View>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgb(239, 239, 239)',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-evenly',
              }}>
              <Button
                buttonStyle={{
                  width: 80,
                  height: 40,
                  borderColor: COLORS.background,
                }}
                titleStyle={{color: COLORS.background}}
                onPress={() => {
                  setModalVisible(false);
                  setCostValue(0);
                  setWasteValue(0);
                }}
                type="outline">
                Cancel
              </Button>
              <Button
                color={COLORS.background}
                buttonStyle={{width: 80, height: 40}}
                onPress={async () => {
                  setModalVisible(false);
                  setCostValue(0);
                  setWasteValue(0);
                  await handleCostSingleFood(id, costValue, wasteValue);
                  await autoListUpdater([id]);
                  await refresh();
                }}>
                Save
              </Button>
            </View>
            <Pressable
              style={{
                position: 'absolute',
                right: 5,
                top: 15,
              }}
              onPress={() => {
                setModalVisible(false);
                setShoppingModal(true);
              }}>
              <View
                style={{
                  backgroundColor: COLORS.background,
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Icon2 name="add-shopping-cart" size={20} color="white" />
              </View>
            </Pressable>
          </View>
        </View>
      </Modal>
      <AddShoppingListModal
        visible={shoppingModal}
        setVisible={setShoppingModal}
        foodName={name}
        foodId={food_id}
        categoryId={categoryId}
        categoryName={categoryName}
        editMode={false}
      />
    </>
  );
};

const modalStyles = StyleSheet.create({
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
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: 300,
    height: 400,
    display: 'flex',
    flexDirection: 'column',
  },
});

const DashedLine = () => {
  return <View style={styles.dashedLine} />;
};

const styles = StyleSheet.create({
  dashedLine: {
    borderTopWidth: 1,
    borderColor: 'gray',
    borderStyle: 'dashed',
    width: '100%',
  },
});

export const FoodList: FC<{
  data: StockFood[];
  selected: number[];
  setSelected: Dispatch<React.SetStateAction<number[]>>;
  mode: Mode;
  autoListUpdater: (ids: number[]) => any;
}> = ({data, selected, setSelected, mode, autoListUpdater}) => {
  const [{grouping, expired, nearExpired, normal}] = useContext(FilterContext);
  const selectedSet = useMemo(() => new Set(selected.map(v => v)), [selected]);
  const [search] = useContext(SearchContext);
  const groups = useMemo(() => {
    const map = new Map();
    if (!grouping) {
      map.set('no-category', data);
      return [...map.entries()];
    }
    data.forEach(item => {
      const {
        category_name,
        start_time,
        end_time,
        outdate_notice_advance_time,
        name,
      } = item;
      if (search !== '') {
        const ret = name.match(new RegExp(search, 'i'));
        if (ret === null) {
          return;
        }
      }
      const targetDate = moment(end_time);
      const diff = targetDate.diff(start_time);
      const duration = moment.duration(diff);
      const status = getStatus(duration, outdate_notice_advance_time);
      const shouldSkip =
        (status === Status.EXPIRED && !expired) ||
        (status === Status.NEAR_EXPIRED && !nearExpired) ||
        (status === Status.NORMAL && !normal);
      if (shouldSkip) {
        return;
      }
      if (!map.has(category_name)) {
        map.set(category_name, [item]);
      } else {
        const array = map.get(category_name);
        array.push(item);
      }
    });
    return [...map.entries()];
  }, [data, expired, grouping, normal, nearExpired, search]);
  const [now, setNow] = useState(() => moment());
  useEffect(() => {
    setTimeout(() => {
      setNow(moment());
    }, 60000);
  }, [now]);
  const [sort] = useContext(SortContext);
  return (
    <View>
      {groups.map(([category_name, items]: [string, StockFood[]]) => {
        return (
          <View
            style={{flex: 1, marginTop: 20, marginBottom: 10}}
            key={category_name}>
            {grouping && (
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    marginLeft: 5,
                  }}>{`${category_name}(${items.length})`}</Text>
                <View style={{flex: 1, paddingLeft: 15, paddingRight: 10}}>
                  <DashedLine />
                </View>
              </View>
            )}
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
              }}>
              {items
                .sort((a, b) => {
                  if (sort === SortType.NAME) {
                    return a.name.localeCompare(b.name);
                  }
                  if (sort === SortType.START_TIME) {
                    return a.start_time - b.start_time;
                  }
                  if (sort === SortType.EXPIRED_TIME) {
                    return a.end_time - b.end_time;
                  }
                  if (sort === SortType.REST_TIME) {
                    return (
                      a.end_time - a.start_time - (b.end_time - b.start_time)
                    );
                  }
                  return 0;
                })
                .map(
                  ({
                    name,
                    amount,
                    id,
                    end_time,
                    food_id,
                    category_id,
                    category_name: _category_name,
                    outdate_notice_advance_time,
                    start_time,
                    food_unit,
                  }) => {
                    const targetDate = moment(end_time);
                    const diff = targetDate.diff(start_time);
                    const duration = moment.duration(diff);
                    return (
                      <Block
                        autoListUpdater={autoListUpdater}
                        duration={duration}
                        name={name}
                        amount={amount}
                        key={id}
                        id={id}
                        mode={mode}
                        selectedSet={selectedSet}
                        setSelected={setSelected}
                        food_id={food_id}
                        categoryId={category_id}
                        categoryName={_category_name}
                        outdate_notice_advance_time={
                          outdate_notice_advance_time
                        }
                        food_unit={food_unit}
                      />
                    );
                  },
                )}
            </View>
          </View>
        );
      })}
    </View>
  );
};
