import {useAsyncEffect} from 'ahooks';
import {fetchFieldNamesFromTable, getAllDataFromTable} from '../database/utils';
import {db} from '../database';

export const useDataDev = (name: string) => {
  useAsyncEffect(async () => {
    const ret = await getAllDataFromTable(db, name);
    const fields = await fetchFieldNamesFromTable(db, name);
    console.log('--------当前表格：${name}--------');
    console.log('字段', fields);
    console.log('记录', ret);
    console.log('-------------------------------');
  }, []);
};
