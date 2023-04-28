type Layer = 'FRESH' | 'FROZEN' | 'NORMAL';
export type FoodCategory = {
  id: number;
  name: string; // 种类名称
};

export type FoodItem = {
  id: number;
  name: string; // 食物名称
  category_id: number; // 归属的食品种类
  fresh_persist_time?: number;
  frozen_persist_time?: number;
  normal_persist_time?: number;
  recommended_layer: Layer;
  food_unit: string;
  outdate_notice_advance_time: number;
  outdate_notice_frequency: number;
  remarks?: string;
};
