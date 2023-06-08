import {Dispatch, createContext} from 'react';
import {Layer} from '../types';
import {EventEmitter} from 'events';
export const emitter = new EventEmitter();
export const LayerContext = createContext<Layer>('Fresh');

export const ShoppingModeContext = createContext<boolean>(false);

export const RefreshContext = createContext<() => any>(() => {});

export const LayerUpdaterContext = createContext<Record<Layer, () => any>>({
  Fresh: () => {},
  Normal: () => {},
  Frozen: () => {},
});

export type FilterObj = {
  normal: boolean;
  nearExpired: boolean;
  expired: boolean;
  grouping: boolean;
};

export const FilterContext = createContext<
  [FilterObj, Dispatch<React.SetStateAction<FilterObj>>]
>([
  {
    normal: true,
    nearExpired: true,
    expired: true,
    grouping: true,
  },
  () => {},
]);

export enum SortType {
  START_TIME,
  EXPIRED_TIME,
  NAME,
  REST_TIME,
}

export const SortContext = createContext<
  [SortType, Dispatch<React.SetStateAction<SortType>>]
>([SortType.NAME, () => {}]);

export const SearchContext = createContext<
  [string, Dispatch<React.SetStateAction<string>>]
>(['', () => {}]);
