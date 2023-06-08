import moment, {Moment} from 'moment';
import PushNotification from 'react-native-push-notification';
import {CHANNEL_ID} from '../constants';
import {getAllFoodStocked} from '../database/query';
import {updateDataById} from '../database/utils';
import {db} from '../database';

const generateUniqueId = () => {
  const uniqueId = Math.floor(Math.random() * 2 ** 32).toString();
  return uniqueId;
};

export const subscribeNotification = (
  startTime: Date,
  endTime: Date,
  entValue: number,
  freqValue: number,
  itemName: string,
) => {
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

  const ids = notificationTimes.map(() => generateUniqueId());
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
      title: 'Food Advent Reminder',
      message: `Note that your ${itemName} ${display}. Please eat it as soon as possible to avoid wasting it`,
      date: date.toDate(),
      allowWhileIdle: false,
    });
  });
  return ids;
};

export const subscribeExpiredNotification = (end_time: Date, name: string) => {
  const id = generateUniqueId();
  PushNotification.localNotificationSchedule({
    channelId: CHANNEL_ID,
    id,
    title: 'Food Expired Reminder',
    message: `Note that your ${name} has expired.`,
    date: end_time,
    allowWhileIdle: false,
  });
  return id;
};

export const reopenAdventReminder = async () => {
  const allStockedFood = await getAllFoodStocked();
  allStockedFood.forEach(
    async ({
      start_time,
      end_time,
      outdate_notice_advance_time,
      outdate_notice_frequency,
      name,
      id,
    }) => {
      const ids = subscribeNotification(
        new Date(start_time),
        new Date(end_time),
        outdate_notice_advance_time,
        outdate_notice_frequency,
        name,
      );
      const idsStr = JSON.stringify(ids);
      await updateDataById(db, 'food_stocks', id, {
        notify_ids: idsStr,
      });
    },
  );
};

export const closeAllAdventReminder = async () => {
  const allStockedFood = await getAllFoodStocked();
  const ids = allStockedFood.map(({notify_ids}) => {
    if (!notify_ids) {
      return [];
    }
    return JSON.parse(notify_ids);
  });
  ids.forEach(idArray => {
    idArray.forEach((id: any) => {
      PushNotification.cancelLocalNotification(id);
    });
  });
};

export const reopenAllExpiredReminder = async () => {
  const allStockedFood = await getAllFoodStocked();
  allStockedFood.forEach(async ({end_time, name, id}) => {
    const _id = subscribeExpiredNotification(new Date(end_time), name);
    await updateDataById(db, 'food_stocks', id, {
      expired_notify_id: _id,
    });
  });
};

export const closeAllExpiredReminder = async () => {
  const allStockedFood = await getAllFoodStocked();
  const ids = allStockedFood.map(({expired_notify_id}) => {
    return expired_notify_id;
  });
  ids.forEach(id => {
    PushNotification.cancelLocalNotification(id);
  });
};

export const closeAllNotifications = () => {
  PushNotification.cancelAllLocalNotifications();
};

export const reopenAllNotifications = async () => {
  // await reopenAdventReminder();
  await reopenAllExpiredReminder();
};
