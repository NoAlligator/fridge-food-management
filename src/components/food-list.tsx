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
import Icon from 'react-native-vector-icons/AntDesign';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import {COLORS} from '../constants';
import {Mode} from '../screens/layer';
import {Badge, Button} from '@rneui/themed';
import NumericInput from 'react-native-numeric-input';
import {getAllCategories, handleCostSingleFood} from '../database/query';
import {
  getAllDataFromTable,
  getAllDataFromTableParsed,
} from '../database/utils';
import {db} from '../database';
import {RefreshContext} from '../store';
import moment, {Duration} from 'moment';

const getColor = (duration: Duration) => {
  const hasExpired = duration.asMilliseconds() < 0;
  const days = Math.floor(duration.asDays());
  const hours = Math.floor(duration.asHours());
  if (hasExpired) {
    return 'grey';
  } else {
    if (days >= 7) {
      return 'rgb(82, 196, 26)';
    }
    if (days > 1) {
      return 'rgb(32, 137, 220)';
    }
    if (hours > 1) {
      return 'rgb(250, 173, 20)';
    }
    if (hours < 1) {
      return 'rgb(255, 25, 12)';
    }
  }
};

const Block: FC<{
  name: string;
  amount: number;
  mode: Mode;
  selectedSet: Set<number>;
  setSelected: Dispatch<React.SetStateAction<number[]>>;
  id: number;
  duration: Duration;
}> = ({name, amount, mode, selectedSet, setSelected, id, duration}) => {
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
  const color = useMemo(() => getColor(duration), [duration]);
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
            {/* {displayMode && (
              <View>
                <Icon name="minuscircle" size={15} color={COLORS.background} />
              </View>
            )} */}
            <Text>{amount}</Text>
            {/* {displayMode && (
              <View>
                <Icon name="pluscircle" size={15} color={COLORS.background} />
              </View>
            )} */}
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
                  leftButtonBackgroundColor={COLORS.background}
                  rightButtonBackgroundColor={COLORS.background}
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
                  leftButtonBackgroundColor={COLORS.background}
                  rightButtonBackgroundColor={COLORS.background}
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
                color={COLORS.background}
                buttonStyle={{width: 100}}
                onPress={() => {
                  setModalVisible(false);
                  setCostValue(0);
                  setWasteValue(0);
                }}>
                Cancel
              </Button>
              <Button
                color={COLORS.background}
                buttonStyle={{width: 100}}
                onPress={async () => {
                  setModalVisible(false);
                  setCostValue(0);
                  setWasteValue(0);
                  await handleCostSingleFood(id, costValue, wasteValue);
                  await refresh();
                }}>
                Save
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
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
}> = ({data, selected, setSelected, mode}) => {
  const selectedSet = useMemo(() => new Set(selected.map(v => v)), [selected]);
  const groups = useMemo(() => {
    const map = new Map();
    data.forEach(item => {
      const {category_name} = item;
      if (!map.has(category_name)) {
        map.set(category_name, [item]);
      } else {
        const array = map.get(category_name);
        array.push(item);
      }
    });
    return [...map.entries()];
  }, [data]);
  const [now, setNow] = useState(() => moment());
  useEffect(() => {
    setTimeout(() => {
      setNow(moment());
    }, 60000);
  }, [now]);
  return (
    <View>
      {groups.map(([category_name, items]: [string, StockFood[]]) => {
        return (
          <View
            style={{flex: 1, marginTop: 20, marginBottom: 10}}
            key={category_name}>
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
            <View
              style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
              {items.map(({name, amount, id, end_time}) => {
                const targetDate = moment(end_time);
                const diff = targetDate.diff(now);
                const duration = moment.duration(diff);
                return (
                  <Block
                    duration={duration}
                    name={name}
                    amount={amount}
                    key={id}
                    id={id}
                    mode={mode}
                    selectedSet={selectedSet}
                    setSelected={setSelected}
                  />
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
};
