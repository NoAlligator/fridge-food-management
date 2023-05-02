import {useAsyncEffect} from 'ahooks';
import {useState} from 'react';
import {getFoodItemById} from '../database/query';

export const useFoodItem: (id: number | undefined, field: string) => any = (
  id,
  field,
) => {
  const [value, setValue] = useState<any>();
  useAsyncEffect(async () => {
    if (id === undefined) {
      return;
    }
    const data = await getFoodItemById(id);
    setValue(data[field]);
  }, []);
  return [value, setValue];
};

export const useFoodItemWhole: (id: number | undefined) => any = id => {
  const [value, setValue] = useState<any>();
  useAsyncEffect(async () => {
    if (id === undefined) {
      return;
    }
    const data = await getFoodItemById(id);
    setValue(data);
  }, []);
  return [value, setValue];
};
