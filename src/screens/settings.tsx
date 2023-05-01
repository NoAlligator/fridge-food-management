import React, {FC, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {AsyncStorageKeys, COLORS, SIZE} from '../constants';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Divider, ListItem, Switch} from '@rneui/themed';
import useAsyncStorage from '../hooks/useAsyncStorage';
import {useNavigation} from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import NumericInput from 'react-native-numeric-input';
const style = StyleSheet.create({
  headerContainer: {
    height: 50,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZE.headerPaddingHorizontal,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

function TimeSelect() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    {label: 'Expiry date', value: '0'},
    {label: '1 days early', value: '1'},
    {label: '2 days early', value: '2'},
    {label: '3 days early', value: '3'},
  ]);

  const [value, setStoredValue] = useAsyncStorage(
    AsyncStorageKeys.expirationNotificationTime,
    1,
  );

  return (
    <DropDownPicker
      style={{width: 150}}
      open={open}
      value={value}
      items={items as any}
      setOpen={setOpen}
      onChangeValue={v => setStoredValue(v as any)}
      setValue={setStoredValue as any}
      setItems={setItems}
    />
  );
}

function FrequencySelect() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    {label: '12 hours', value: '12'},
    {label: '6 hours', value: '6'},
    {label: '3 hours', value: '3'},
    {label: '2 hours', value: '2'},
    {label: '1 hours', value: '1'},
  ]);

  const [value, setStoredValue] = useAsyncStorage(
    AsyncStorageKeys.expirationNotificationFreq,
    6,
  );

  return (
    <DropDownPicker
      style={{width: 150}}
      open={open}
      value={value}
      items={items as any}
      setOpen={setOpen}
      setValue={setStoredValue as any}
      setItems={setItems}
      onChangeValue={v => setStoredValue(v as any)}
    />
  );
}

function DailyTimeSelect() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    {label: 'Expiry date', value: '0'},
    {label: '1 days early', value: '1'},
    {label: '2 days early', value: '2'},
    {label: '3 days early', value: '3'},
  ]);

  const [value, setStoredValue] = useAsyncStorage(
    AsyncStorageKeys.dailyNotificationTime,
    1,
  );

  return (
    <DropDownPicker
      style={{width: 150}}
      open={open}
      value={value}
      items={items as any}
      setOpen={setOpen}
      setValue={setStoredValue as any}
      setItems={setItems}
      onChangeValue={v => setStoredValue(v as any)}
    />
  );
}

function RNEListItemAccordion() {
  const [expanded, setExpanded] = React.useState(false);
  const [nearDays, setNearDays] = useAsyncStorage(
    AsyncStorageKeys.expirationNotificationTime,
    7,
  );
  const [freq, setFreq] = useAsyncStorage(
    AsyncStorageKeys.expirationNotificationFreq,
    12,
  );

  return (
    <View style={{zIndex: 9000}}>
      <ListItem.Accordion
        content={
          <ListItem.Content>
            <ListItem.Title>Expiration Notification</ListItem.Title>
            <ListItem.Subtitle>
              Set the time and frequency of the default expiration notification,
              which you can change individually for a particular food
            </ListItem.Subtitle>
          </ListItem.Content>
        }
        isExpanded={expanded}
        onPress={() => {
          setExpanded(!expanded);
        }}>
        <View>
          <SwitchList
            title="Expiration Notification Switch"
            asyncKey={AsyncStorageKeys.expiredNotification}
          />
        </View>
        <View style={{zIndex: 200}}>
          <ListItem>
            <ListItem.Content>
              <ListItem.Title style={{marginLeft: 20}}>
                Default Near Expiration Date
              </ListItem.Title>
            </ListItem.Content>
            <View>
              <NumericInput
                value={nearDays}
                onChange={v => setNearDays(Number(v))}
                minValue={0}
              />
              {/* <TimeSelect /> */}
            </View>
          </ListItem>
        </View>
        <View style={{zIndex: 100}}>
          <ListItem>
            <ListItem.Content>
              <ListItem.Title style={{marginLeft: 20}}>
                Default Alert Frequency(hours)
              </ListItem.Title>
            </ListItem.Content>
            <View>
              {/* <FrequencySelect /> */}
              <NumericInput value={freq} onChange={setFreq} minValue={3} />
            </View>
          </ListItem>
        </View>
      </ListItem.Accordion>
    </View>
  );
}

const SwitchList: FC<{title: string; subTitle?: string; asyncKey: string}> = ({
  title,
  subTitle,
  asyncKey,
}) => {
  const [value, setValue] = useAsyncStorage(asyncKey ?? '', true);
  return (
    <ListItem>
      <ListItem.Content>
        <ListItem.Title>{title}</ListItem.Title>
        {subTitle && <ListItem.Subtitle>{subTitle}</ListItem.Subtitle>}
      </ListItem.Content>
      <Switch
        color={COLORS.background}
        value={value}
        onChange={e => setValue(e.nativeEvent.value)}
      />
    </ListItem>
  );
};

export const Setting = () => {
  const navigation = useNavigation();
  return (
    <View style={{display: 'flex', height: '100%'}}>
      <View style={style.headerContainer}>
        <Icon
          name="arrow-back"
          color="white"
          size={SIZE.icon}
          onPress={() => {
            // @ts-ignore
            navigation.navigate('Home');
          }}
        />
      </View>
      <View style={{flex: 1}}>
        <ScrollView style={{zIndex: 9999}}>
          <SwitchList
            title="Global Notification Switch"
            asyncKey={AsyncStorageKeys.globalNotification}
          />
          <Divider />
          <RNEListItemAccordion />
          <Divider />
          <SwitchList
            title="Expired Reminder"
            subTitle="Whether to remind you after the food expired"
            asyncKey={AsyncStorageKeys.expiredNotification}
          />
          <Divider />
          <SwitchList
            title="Exhausted Reminder"
            asyncKey={AsyncStorageKeys.exhaustedNotification}
          />
          <Divider />
          {/* <View style={{zIndex: 0}}>
            <SwitchList
              title="Daily Expiration Reminder"
              subTitle="Remind you at a regular time each day of what foods will expire"
              asyncKey={AsyncStorageKeys.dailyNotification}
            />
          </View>
          <Divider />
          <View style={{zIndex: 100}}>
            <ListItem>
              <ListItem.Content>
                <ListItem.Title style={{marginLeft: 20}}>
                  Daily Expiration Reminder Time
                </ListItem.Title>
              </ListItem.Content>
              <View>
                <DailyTimeSelect />
              </View>
            </ListItem>
          </View>
          <Divider />
          <View style={{height: 200}} /> */}
        </ScrollView>
      </View>
    </View>
  );
};
