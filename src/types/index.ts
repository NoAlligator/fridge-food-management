export type Layer = 'Fresh' | 'Frozen' | 'Normal';
export type FoodCategory = {
  id: number;
  name: string; // 种类名称
};

export type FoodItem = {
  id: number;
  name: string; // 食物名称
  category_id: number; // 归属的食品种类
  category_name: string; // 对应的种类name
  fresh_persist_time?: number; // 在冰箱保鲜层中的保质期，以天数计算
  frozen_persist_time?: number; // 在冰箱冷冻层中的保质期，以天数计算
  normal_persist_time?: number; // 常温储存的保质期，以天数计算
  recommended_layer?: Layer; // 推荐的保鲜层，可以是：'Fresh' | 'Frozen' | 'Normal'
  food_unit?: string; // 食物的单位
  outdate_notice_advance_time?: number; // 过期时间
  outdate_notice_frequency?: number; // 通知频率
  remarks?: string;
};

export type StockFood = {
  id: number;
  name: string; // 食物名称
  food_id: number; // 对应的食物id
  amount: number; // 数量
  category_id: number; // 对应的种类id
  category_name: string; // 对应的种类name
  layer: Layer; // 存放的位置，可以为'Fresh' | 'Frozen' | 'Normal'三者之一
  food_unit?: string; // 食物的单位
  notify_ids: string; // 通知绑定的ids
  outdate_notice_advance_time?: string; // 过期时间
  outdate_notice_frequency?: string; // 通知频率
  start_time: number; // 开始日
  end_time: number; // 结束日
  remarks?: string; // 食物备注
  img?: string; // 食物图片
  used_amount_before_expiry: number;
  used_amount_after_expiry: number;
  waste_amount_before_expiry: number;
  waste_amount_after_expiry: number;
};

export interface ExhaustedFood extends StockFood {
  exhausted_time: number; // 耗尽时间
}
