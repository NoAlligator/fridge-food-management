import {getDBConnection, initTable} from './utils';
import {enablePromise} from 'react-native-sqlite-storage';
export const db = getDBConnection();
initTable(db, 'items');
enablePromise(true);
