import {ResultSet} from 'react-native-sqlite-storage';

export const convertResultToArray = (result: ResultSet) => {
  const dataArray = [];
  for (let i = 0; i < result.rows.length; i++) {
    dataArray.push(result.rows.item(i));
  }
  return dataArray;
};
