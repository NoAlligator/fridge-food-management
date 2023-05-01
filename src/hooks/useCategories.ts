import {useAsyncEffect} from 'ahooks';
import {useState} from 'react';
import {getAllCategories} from '../database/query';
import {FoodCategory} from '../types';

export const useCategories: () => FoodCategory[] = () => {
  const [value, setValue] = useState([]);
  useAsyncEffect(async () => {
    const data = await getAllCategories();
    setValue(data as any);
  }, []);
  return value;
};
