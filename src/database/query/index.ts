import PushNotification from 'react-native-push-notification';
import {Layer, StockFood} from '../../types';
import {db} from '../index';
import {
  Order,
  deleteDataById,
  getAllDataFromTableParsed,
  insertDataToTable,
  queryByCondition,
  queryByKeyword,
  readAndSortData,
  sumFieldById,
  updateDataById,
} from '../utils';

export const getFoodTotalAmount = async (foodId: number) => {
  const data = await sumFieldById(
    db,
    'food_stocks',
    'food_id',
    foodId,
    'amount',
  );
  const {sum_field} = (data as any)[0];
  return sum_field;
};

// 获取所有种类
export const getAllCategories = async () => {
  return await getAllDataFromTableParsed(db, 'food_categories');
};

// 获取所有购物清单食物
export const getAllShoppingListFood = async (order?: Order) => {
  if (!order) {
    return await getAllDataFromTableParsed(db, 'shopping_list_foods');
  }
  return await readAndSortData(db, 'shopping_list_foods', 'checked', order);
};

// 更新购物清单食物check
export const checkShoppingListFood = async (id: number, checked: 0 | 1) => {
  console.log('id checked', id, checked);
  return await updateDataById(db, 'shopping_list_foods', id, {
    checked,
  });
};

// 获取种类对应的所有食物
export const getAllItemsByCategoryId = async (categoryId: number) => {
  const data = await queryByCondition(db, 'food_items', {
    category_id: categoryId,
  });
  console.log(categoryId, data);
  return data;
};

// 获取种类对应的所有食物
export const getAllItemsByKeyword = async (search: string) => {
  return await queryByKeyword(db, 'food_items', 'name', search);
};

// 获取id对应的种类
export const getCategoryNameById = async (categoryId: number) => {
  const data = await queryByCondition(db, 'food_categories', {
    id: categoryId,
  });
  return data[0].name;
};

// 获取id对应的食物
export const getFoodItemById = async (id: number) => {
  const data = await queryByCondition(db, 'food_items', {
    id: id,
  });
  return data[0];
};

// 获取id对应的库存食物
export const getStockFoodItemById = async (id: number) => {
  const data = await queryByCondition(db, 'food_stocks', {
    id: id,
  });
  return data[0];
};

// 获取foodId对应的自动计划列表
export const getAutoShoppingListFoodById = async (id: number) => {
  const data = await queryByCondition(db, 'shopping_list_foods', {
    food_id: id,
    auto: 1,
  });
  return data[0];
};

// 获取layer对应的食物
export const getFoodInStockByLayer = async (layer: Layer) => {
  const data = await queryByCondition(db, 'food_stocks', {
    layer,
  });
  return data;
};

export enum UseType {
  USED,
  WASTE,
}

// const getField = (type: UseType, haveExpired: boolean) => {
//   if (haveExpired && type === UseType.USED) {
//     return 'used_amount_after_expiry';
//   }
//   if (haveExpired && type === UseType.WASTE) {
//     return 'waste_amount_after_expiry';
//   }
//   if (!haveExpired && type === UseType.USED) {
//     return 'used_amount_before_expiry';
//   }
//   if (!haveExpired && type === UseType.WASTE) {
//     return 'waste_amount_before_expiry';
//   }
// };

export enum TerminateType {
  USED,
  WASTED,
}

export const handleTerminateSingleFood = async (
  id: number,
  type: TerminateType,
) => {
  const food = await getStockFoodItemById(id);
  console.log(id, food);
  const {amount} = food;
  if (type === TerminateType.USED) {
    return handleCostSingleFood(id, amount, 0);
  } else {
    return handleCostSingleFood(id, 0, amount);
  }
};

// 更新单个食物
export const handleCostSingleFood = async (
  id: number,
  cost: number,
  waste: number,
) => {
  const food = await getStockFoodItemById(id);
  const {
    amount,
    end_time,
    notify_ids,
    id: stockFoodId,
    used_amount_after_expiry,
    used_amount_before_expiry,
    waste_amount_after_expiry,
    waste_amount_before_expiry,
  } = food as StockFood;
  const haveExpired = +new Date() > end_time;
  const retAmount = amount - cost - waste;
  console.log('food', food);
  const ret: any = {
    amount: retAmount, // 剩余结果
  };
  if (haveExpired) {
    ret.used_amount_after_expiry = used_amount_after_expiry + cost;
    ret.waste_amount_after_expiry = waste_amount_after_expiry + waste;
  } else {
    ret.used_amount_before_expiry = used_amount_before_expiry + cost;
    ret.waste_amount_before_expiry = waste_amount_before_expiry + waste;
  }
  if (retAmount === 0) {
    const ids = JSON.parse(notify_ids); // 通知ID列表
    ids.forEach((ni: string) => PushNotification.cancelLocalNotification(ni)); // 取消所有通知
    await deleteDataById(db, 'food_stocks', stockFoodId);
    await insertDataToTable(db, 'exhausted_foods', {
      ...food,
      ...ret,
      exhausted_time: +new Date(),
    } as any);
  } else {
    await updateDataById(db, 'food_stocks', stockFoodId, ret);
  }
};

export const handleAddSingleFood = async (id: number, num: number) => {
  const food = await getStockFoodItemById(id);
  const {amount, id: stockFoodId} = food as StockFood;
  let ret = {
    ...food,
    amount: amount + num,
  };
  await updateDataById(db, 'food_stocks', stockFoodId, ret);
};
