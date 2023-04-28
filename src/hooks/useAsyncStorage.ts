import {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AsyncStorageValue<T> = [T, (value: T) => void, () => void];

const useAsyncStorage = <T>(
  key: string,
  defaultValue: T,
): AsyncStorageValue<T> => {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await AsyncStorage.getItem(key);
        if (data !== null) {
          setValue(JSON.parse(data));
        }
      } catch (error) {
        console.log(error);
      }
    };

    getData();
  }, [key]);

  const setStoredValue = async (newValue: T) => {
    try {
      setValue(newValue);
      await AsyncStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.log(error);
    }
  };

  const clearStoredValue = async () => {
    try {
      setValue(defaultValue);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.log(error);
    }
  };

  return [value, setStoredValue, clearStoredValue];
};

export default useAsyncStorage;
