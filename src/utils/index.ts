import {ResultSet} from 'react-native-sqlite-storage';

export const convertResultToArray = (result: ResultSet) => {
  const dataArray = [];
  for (let i = 0; i < result.rows.length; i++) {
    dataArray.push(result.rows.item(i));
  }
  return dataArray;
};

export function getExpirationStatus(days: number): number {
  if (days >= 365) {
    return 45;
  } else if (days >= 180) {
    return 30;
  } else if (days >= 30) {
    return 20;
  } else if (days >= 7) {
    return 7;
  } else {
    return 1;
  }
}
