import {createContext} from 'react';
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
