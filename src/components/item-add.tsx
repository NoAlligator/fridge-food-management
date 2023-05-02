/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import React, {Dispatch, useMemo} from 'react';
import {FC, useContext, useState} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {emitter} from '../store/index';
import {Button, Card, Divider} from '@rneui/themed';
import {LayerContext, LayerUpdaterContext, RefreshContext} from '../store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import {useFoodItem} from '../hooks/useFoodItem';
import moment, {Moment} from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import {AsyncStorageKeys, CHANNEL_ID, COLORS} from '../constants';
import useAsyncStorage from '../hooks/useAsyncStorage';
import {StockFood} from '../types';
import 'react-native-get-random-values';
import NumericInput from 'react-native-numeric-input';
import PushNotification from 'react-native-push-notification';
import {insertDataToTable} from '../database/utils';
import {db} from '../database';
import {useNavigation} from '@react-navigation/native';
import {getExpirationStatus} from '../utils';
import {Picker} from '@react-native-picker/picker';

export const ItemAdd: FC<{
  categoryId: number;
  categoryName: string;
  itemName: string;
  itemId: number;
  defaultLifeSpan: number | null;
  multiplyMode: boolean;
  multiplyData?: {
    amount: number;
    addedCallback: (num: number) => any;
  };
}> = ({
  itemId,
  itemName,
  categoryId,
  categoryName,
  defaultLifeSpan,
  multiplyMode = false,
  multiplyData,
}) => {
  // 数量
  const [num, setNum] = useState(multiplyMode ? multiplyData?.amount ?? 1 : 1);
  // 提前通知时间
  const [ent] = useAsyncStorage(AsyncStorageKeys.expirationNotificationTime, 7);
  const [entValue, setEntValue] = useState(ent);

  // 通知频率
  const [freq] = useAsyncStorage(
    AsyncStorageKeys.expirationNotificationFreq,
    12,
  );
  const [freqValue, setFreqValue] = useState(freq);

  // 默认保质期
  const initLifeSpan =
    typeof defaultLifeSpan === 'number' ? defaultLifeSpan : 7;
  const initDate = useMemo(() => moment(), []);
  const [[startTime, endTime], setTimeRange] = useState([
    initDate.toDate(),
    initDate.add(initLifeSpan, 'days').toDate(),
  ]);
  const [lifeSpan, setLifeSpan] = useState(initLifeSpan);

  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  const changeLifeSpan = (v: number) => {
    setLifeSpan(v);
    setTimeRange([startTime, moment(startTime).add(v, 'days').toDate()]);
  };

  const changeEndDate = (date: Date) => {
    const duration = Math.floor(
      moment.duration(date.getTime() - startTime.getTime()).asDays(),
    );
    if (duration <= 0) {
      return Alert.alert(
        'Failed to set Expiry Date',
        'The expiry date must be before the start date.',
      );
    }
    setLifeSpan(duration);
    setTimeRange([startTime, date]);
  };

  const changeStartDate = (date: Date) => {
    const duration = Math.floor(
      moment.duration(endTime.getTime() - date.getTime()).asDays(),
    );
    const startMoment = moment(startTime);
    const endMoment = moment(date).set({
      hour: startMoment.hour(),
      minute: startMoment.minute(),
      second: startMoment.second(),
      millisecond: startMoment.millisecond(),
    });
    if (duration <= 0) {
      return Alert.alert(
        'Failed to set Start Date',
        'The start date must be after the expiry date.',
      );
    }
    setLifeSpan(duration);
    setTimeRange([date, endMoment.toDate()]);
  };

  // Unit
  const [unit, setUnit] = useFoodItem(itemId, 'food_unit');

  // Layer
  const layer = useContext(LayerContext);
  const [realLayer, setLayer] = useState(layer);
  const [items] = useState([
    {label: 'Crisper layer', value: 'Fresh'},
    {label: 'Freezer layer', value: 'Frozen'},
    {label: 'Pantry', value: 'Normal'},
  ]);
  const navigation = useNavigation();

  const ret: Partial<StockFood> = {
    name: itemName,
    food_id: itemId,
    category_id: categoryId,
    category_name: categoryName,
    layer: realLayer,
    food_unit: unit,
    outdate_notice_advance_time: entValue,
    outdate_notice_frequency: freqValue,
    start_time: +startTime,
    end_time: +endTime,
    amount: num,
  };
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    let firstNotificationTime = moment(endTime).subtract(
      Number(entValue),
      'days',
    );
    if (
      firstNotificationTime.isBefore(moment(startTime).local().startOf('day'))
    ) {
      // 如果减去提前提醒是时间是入库时间之前，手动将初次提醒时间置为入库时间
      firstNotificationTime = moment(startTime);
    }
    const notificationTimes: Moment[] = []; // 需要通知的时间
    let nextNotificationTime = firstNotificationTime.clone();
    while (nextNotificationTime.isBefore(endTime)) {
      notificationTimes.push(nextNotificationTime);
      nextNotificationTime = nextNotificationTime
        .clone()
        .add(Number(freqValue), 'hours');
    }
    const generateUniqueId = () => {
      const uniqueId = Math.floor(Math.random() * 2 ** 32).toString();
      return uniqueId;
    };

    const ids = notificationTimes.map(() => generateUniqueId());
    const idsStr = JSON.stringify(ids);
    const dataToStore: Partial<StockFood> = {
      ...ret,
      notify_ids: idsStr,
    };
    try {
      await insertDataToTable(db, 'food_stocks', dataToStore as any);
      // @ts-ignore
      emitter.emit('Home/refresh');
      if (!multiplyMode) {
        // @ts-ignore
        navigation.navigate('Home');
      }
      notificationTimes.forEach((date, index) => {
        const duration = moment.duration(moment(endTime).diff(date));
        const days = Math.floor(duration.asDays());
        const hours = Math.floor(duration.asHours());
        const display =
          days === 0
            ? `will expire in ${hours} hours`
            : `will expire in ${days} days`;
        PushNotification.localNotificationSchedule({
          channelId: CHANNEL_ID,
          id: ids[index],
          title: 'Food Expiration Reminder',
          message: `Note that your ${itemName} ${display}. Please eat it as soon as possible to avoid wasting it`,
          date: date.toDate(),
          allowWhileIdle: false,
        });
      });
      if (multiplyMode) {
        await multiplyData?.addedCallback(num);
      }
    } catch (e) {
      console.log(e);
    }
  };
  const ENT = useMemo(
    () =>
      ({value}: {value: number}) =>
        (
          <NumericInput
            value={value}
            onChange={v => setEntValue(Number(v))}
            minValue={0}
            maxValue={lifeSpan}
          />
        ),
    [lifeSpan],
  );

  return (
    <View style={{display: 'flex', marginTop: 10}}>
      <Card wrapperStyle={{zIndex: 100}}>
        <Card.Title>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{color: COLORS.background, fontSize: 30}}>
              {itemName}
            </Text>
          </View>
        </Card.Title>
        <Card.Divider />
        <View style={[styles.listContainerLayout, {zIndex: 600}]}>
          <View style={styles.titleContainer}>
            <Icon
              name="folder"
              size={25}
              style={{marginRight: 5}}
              color="black"
            />
            <Text style={styles.listTitle}>Category</Text>
          </View>
          <Text style={styles.contentText}>{categoryName}</Text>
        </View>
        <Divider />
        <View style={[styles.listContainerLayout, {zIndex: 500}]}>
          <View style={styles.titleContainer}>
            <Icon
              name="location-on"
              size={25}
              style={{marginRight: 5}}
              color="black"
            />
            <Text style={styles.listTitle}>Location</Text>
          </View>
          <View style={{width: 150}}>
            <Picker selectedValue={realLayer as any} onValueChange={setLayer}>
              {items.map(({label, value}) => (
                <Picker.Item label={label} value={value} key={value} />
              ))}
            </Picker>
          </View>
        </View>
        <Divider />
        <View style={styles.listContainerLayout}>
          <View style={styles.titleContainer}>
            <Icon2
              name="calculator"
              size={25}
              style={{marginRight: 5}}
              color="black"
            />
            <Text style={styles.listTitle}>Amount</Text>
          </View>
          <View>
            <NumericInput
              onChange={value => setNum(Number(value))}
              value={num}
              minValue={1}
            />
          </View>
        </View>
        <Divider />
        <View style={styles.listContainerLayout}>
          <View style={styles.titleContainer}>
            <Icon2
              name="weight"
              size={25}
              style={{marginRight: 5}}
              color="black"
            />
            <Text style={styles.listTitle}>Unit</Text>
          </View>
          <View style={{width: 100}}>
            <TextInput
              style={{color: 'black'}}
              placeholderTextColor="#888"
              placeholder="Input unit..."
              value={unit}
              onChangeText={v => setUnit(v)}
            />
          </View>
        </View>
        <Divider />
        <View style={[styles.listContainerLayout, {zIndex: 400}]}>
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
            <ENT value={entValue} />
          </View>
        </View>
        <Divider />
        <View style={[styles.listContainerLayout, {zIndex: 300}]}>
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
        <View style={styles.listContainerLayout}>
          <View style={styles.titleContainer}>
            <Icon2
              name="reload"
              size={25}
              style={{marginRight: 5}}
              color="black"
            />
            <Text style={styles.listTitle}>Shelf Life</Text>
          </View>
          <View>
            <NumericInput
              value={lifeSpan}
              onChange={v => {
                changeLifeSpan(Number(v));
                if (Number(v) < entValue) {
                  setEntValue(getExpirationStatus(Number(v)));
                }
              }}
              minValue={1}
            />
          </View>
        </View>
        <Divider />
        <View style={styles.listContainerLayout}>
          <View style={styles.titleContainer}>
            <Icon2
              name="timer-sand"
              size={25}
              style={{marginRight: 5}}
              color="black"
            />
            <Text style={styles.listTitle}>Start Date</Text>
          </View>
          <TouchableOpacity onPress={() => setShowStart(true)}>
            <Text style={styles.contentText}>
              {moment(startTime).format('YYYY-MM-DD')}
              {'  '}
              <Icon name="edit" />
            </Text>
          </TouchableOpacity>
          {showStart && (
            <DateTimePicker
              value={startTime}
              mode="date"
              onChange={(_, v) => {
                setShowStart(false);
                changeStartDate(v as any);
              }}
            />
          )}
        </View>
        <Divider />
        <View style={styles.listContainerLayout}>
          <View style={styles.titleContainer}>
            <Icon2
              name="timer-sand-complete"
              size={25}
              style={{marginRight: 5}}
              color="black"
            />
            <Text style={styles.listTitle}>Expiry Date</Text>
          </View>
          <TouchableOpacity onPress={() => setShowEnd(true)}>
            <Text style={styles.contentText}>
              {moment(endTime).format('YYYY-MM-DD')}
              {'  '}
              <Icon name="edit" />
            </Text>
          </TouchableOpacity>
          {showEnd && (
            <DateTimePicker
              value={endTime}
              mode="date"
              onChange={(_, v) => {
                setShowEnd(false);
                changeEndDate(v as any);
              }}
            />
          )}
        </View>
      </Card>
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: 20,
          marginHorizontal: 14,
          zIndex: -1,
        }}>
        <View>
          <Button
            color={COLORS.background}
            onPress={handlePress}
            loading={loading}>
            Add
          </Button>
        </View>
        <View style={{marginTop: 20}}>
          {!multiplyMode ? (
            <Button
              buttonStyle={{
                borderColor: COLORS.background,
              }}
              titleStyle={{
                color: COLORS.background,
              }}
              type="outline"
              onPress={() => {
                // @ts-ignore
                navigation.navigate('Preset', {
                  item: {
                    id: itemId,
                    name: itemName,
                    category_id: categoryId,
                    category_name: categoryName,
                    layer,
                  },
                  lifeSpan,
                });
              }}>
              Save As Preset
            </Button>
          ) : (
            <Divider />
          )}
        </View>
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
    marginVertical: 0,
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentText: {
    color: 'black',
    fontSize: 15,
  },
});
