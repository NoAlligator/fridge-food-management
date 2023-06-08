import preset from '../assets/data/preset-categories.json';
import {
  deleteTable,
  getDBConnection,
  initTable,
  insertDataToTable,
} from './utils';
import {enablePromise} from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FoodCategory} from '../types';

export const db = getDBConnection();
enablePromise(true);

const init = async () => {
  const isFirstTime = await AsyncStorage.getItem('isFirstTime');
  if (isFirstTime === 'YES') {
    return;
  }
  await deleteTable(db, 'exhausted_foods');
  await deleteTable(db, 'food_items');
  await deleteTable(db, 'food_categories');
  await deleteTable(db, 'food_stocks');
  await deleteTable(db, 'shopping_list_foods');

  await initTable(
    db,
    'shopping_list_foods',
    `
    CREATE TABLE IF NOT EXISTS shopping_list_foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      food_name TEXT NOT NULL,
      food_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      category_name TEXT NOT NULL,
      auto INTEGER DEFAULT 0 NOT NULL,
      amount INTEGER NOT NULL,
      auto_exp_amount INTEGER,
      auto_min_amount INTEGER,
      checked INTEGER DEFAULT 0 NOT NULL
    );
    `,
  );

  await initTable(
    db,
    'exhausted_foods',
    `
    CREATE TABLE IF NOT EXISTS exhausted_foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      amount INTEGER NOT NULL,
      food_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      category_name TEXT NOT NULL,
      layer TEXT NOT NULL,
      food_unit TEXT,
      notify_ids TEXT,
      expired_notify_id TEXT,
      outdate_notice_advance_time INTEGER NOT NULL,
      outdate_notice_frequency INTEGER NOT NULL,
      start_time INTEGER NOT NULL,
      end_time INTEGER NOT NULL,
      remarks TEXT,
      img TEXT,
      used_amount_before_expiry INTEGER NOT NULL,
      used_amount_after_expiry INTEGER NOT NULL,
      waste_amount_before_expiry INTEGER NOT NULL,
      waste_amount_after_expiry INTEGER NOT NULL,
      exhausted_time INTEGER NOT NULL
    );
    `,
  );
  await initTable(
    db,
    'food_stocks',
    `
    CREATE TABLE IF NOT EXISTS food_stocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      amount INTEGER NOT NULL,
      food_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      category_name TEXT NOT NULL,
      layer TEXT NOT NULL,
      food_unit TEXT,
      notify_ids TEXT,
      expired_notify_id TEXT,
      outdate_notice_advance_time INTEGER NOT NULL,
      outdate_notice_frequency INTEGER NOT NULL,
      start_time INTEGER NOT NULL,
      end_time INTEGER NOT NULL,
      remarks TEXT,
      img TEXT,
      used_amount_before_expiry INTEGER DEFAULT 0 NOT NULL,
      used_amount_after_expiry INTEGER DEFAULT 0 NOT NULL,
      waste_amount_before_expiry INTEGER DEFAULT 0 NOT NULL,
      waste_amount_after_expiry INTEGER DEFAULT 0 NOT NULL
    );
    `,
  );
  await initTable(
    db,
    'food_items',
    `
    CREATE TABLE IF NOT EXISTS food_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      category_name TEXT NOT NULL,
      fresh_persist_time INTEGER,
      frozen_persist_time INTEGER,
      normal_persist_time INTEGER,
      recommended_layer TEXT,
      food_unit TEXT,
      outdate_notice_advance_time INTEGER,
      outdate_notice_frequency INTEGER,
      remarks TEXT
    );
    `,
  );
  await initTable(
    db,
    'food_categories',
    `
    CREATE TABLE IF NOT EXISTS food_categories (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    );
    `,
  );
  const presetItems: {
    name: string;
    category_id: number;
    category_name: string;
  }[] = [];
  const presetCategories: FoodCategory[] = preset.map(
    ({index, name, foods}: any) => {
      foods.forEach((foodName: string) => {
        presetItems.push({
          name: foodName,
          category_id: index,
          category_name: name,
        });
      });
      return {
        id: index,
        name,
      };
    },
  );
  await insertDataToTable(db, 'food_categories', presetCategories);
  await insertDataToTable(db, 'food_items', presetItems);
  AsyncStorage.setItem('isFirstTime', 'YES');
};
init();
