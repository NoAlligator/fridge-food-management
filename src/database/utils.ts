import {
  ResultSet,
  SQLiteDatabase,
  openDatabase,
} from 'react-native-sqlite-storage';
import {convertResultToArray} from '../utils';

// 定义数据库名称和表名称
const DEFAULT_DATABASE_NAME = 'user.db';

// 打开数据库
export const getDBConnection = (dbName = DEFAULT_DATABASE_NAME) => {
  return openDatabase(
    {name: dbName},
    () => {
      console.log('数据库连接成功');
    },
    error => {
      console.log(error);
    },
  );
};

// 创建数据表
export const initTable = async (
  db: SQLiteDatabase,
  tableName: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 在事务中执行表的初始化操作
    db.transaction(tx => {
      // 执行创建表的 SQL 语句
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS ${tableName} (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)`,
        [],
        () => {
          // 初始化成功，调用 resolve() 方法
          console.log('初始化数据表成功');
          resolve();
        },
        (_, error) => {
          // 初始化失败，调用 reject() 方法，并传递错误对象
          console.log('初始化数据表失败');
          reject(error);
        },
      );
    });
  });
};

// 插入一条或多条数据
export const insertDataToTable = async (
  db: SQLiteDatabase,
  tableName: string,
  data: Record<string, unknown> | Record<string, unknown>[],
): Promise<number> => {
  return new Promise<number>((resolve, reject) => {
    // 在这里执行插入数据的操作
    db.transaction(tx => {
      // 判断是否是单条数据还是多条数据
      const dataArray = Array.isArray(data) ? data : [data];

      // 循环插入数据
      dataArray.forEach(item => {
        const keys = Object.keys(item);
        const values = Object.values(item);
        const placeholders = new Array(keys.length).fill('?').join(', ');
        const query = `INSERT INTO ${tableName} (${keys.join(
          ', ',
        )}) VALUES (${placeholders})`;

        tx.executeSql(
          query,
          values,
          (_, result) => {
            // 插入成功的回调
            console.log('插入成功', result);
            resolve(result.insertId);
          },
          error => {
            // 插入失败的回调
            console.error('插入失败', error);
            reject(error);
          },
        );
      });
    });
  });
};

// 查询所有数据
export const getAllDataFromTable = async (
  db: SQLiteDatabase,
  tableName: string,
): Promise<ResultSet> => {
  return new Promise<ResultSet>((resolve, reject) => {
    // 在这里执行查询数据的操作
    db.transaction(tx => {
      const query = `SELECT * FROM ${tableName}`;

      tx.executeSql(
        query,
        [],
        (_, result) => {
          // 查询成功的回调
          console.log('查询成功', result);
          resolve(result);
        },
        error => {
          // 查询失败的回调
          console.error('查询失败', error);
          reject(error);
        },
      );
    });
  });
};

// 查询所有数据，转换成数组
export const getAllDataFromTableParsed = async (
  db: SQLiteDatabase,
  tableName: string,
) => {
  const ret = await getAllDataFromTable(db, tableName);
  return convertResultToArray(ret);
};

// 定义查询指定数据表所有字段名的方法
export const fetchFieldNamesFromTable = (
  db: SQLiteDatabase,
  tableName: string,
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `PRAGMA table_info(${tableName})`,
        [],
        (_, result) => {
          const fieldNames: string[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            fieldNames.push(row.name);
          }
          resolve(fieldNames);
        },
        error => {
          reject(error);
        },
      );
    });
  });
};
