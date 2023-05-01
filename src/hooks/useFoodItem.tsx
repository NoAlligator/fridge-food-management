import {useAsyncEffect} from 'ahooks';
import {useState} from 'react';
import {getFoodItemById} from '../database/query';

export const useFoodItem: (id: number, field: string) => any = (id, field) => {
  const [value, setValue] = useState<any>();
  useAsyncEffect(async () => {
    const data = await getFoodItemById(id);
    console.log('data', data);
    setValue(data[field]);
  }, []);
  return [value, setValue];
};
