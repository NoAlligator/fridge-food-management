import {createContext} from 'react';
import {Layer} from '../types';

export const LayerContext = createContext<Layer>('Fresh');

export const RefreshContext = createContext<() => any>(() => {});

export const LayerUpdaterContext = createContext<Record<Layer, () => any>>({
  Fresh: () => {},
  Normal: () => {},
  Frozen: () => {},
});
