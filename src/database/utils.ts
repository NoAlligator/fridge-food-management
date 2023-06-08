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

// 删除数据表
export const deleteTable = (
  db: SQLiteDatabase,
  tableName: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DROP TABLE IF EXISTS ${tableName};`,
        [],
        () => {
          console.log(`删除 ${tableName} 成功`);
          resolve();
        },
        error => {
          console.log(
            `Error while deleting table ${tableName}: ${error.message}`,
          );
          reject(error);
        },
      );
    });
  });
};

// 创建数据表
export const initTable = async (
  db: SQLiteDatabase,
  tableName: string,
  sql: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 在事务中执行表的初始化操作
    db.transaction(tx => {
      // 执行创建表的 SQL 语句
      tx.executeSql(
        sql,
        [],
        () => {
          // 初始化成功，调用 resolve() 方法
          console.log(`初始化数据表${tableName}成功`);
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

// 清空数据表
export function clearTable(db: SQLiteDatabase, tableName: string) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM ${tableName};`,
        [],
        (_, result) => {
          console.log(
            `Table ${tableName} cleared successfully.`,
            'Result',
            result,
          );
          resolve(true);
        },
        (_, error) => {
          console.log(`Error clearing table ${tableName}:`, error);
          reject(error);
        },
      );
    });
  });
}

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

// 基于条件的查询
export const queryByCondition = async (
  db: SQLiteDatabase,
  tableName: string,
  filterObj: Record<string, any>,
) => {
  // 构建SQL查询语句
  let query = `SELECT * FROM ${tableName}`;
  const filters = Object.keys(filterObj);
  if (filters.length > 0) {
    query += ' WHERE ';
    filters.forEach((filter, index) => {
      query += `${filter} = "${filterObj[filter]}"`;
      if (index < filters.length - 1) {
        query += ' AND ';
      }
    });
  }
  // 执行查询语句
  const data = await new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        query,
        [],
        (_, results) => {
          resolve(results);
        },
        error => {
          console.log('ERROR: ', error);
          reject(error);
        },
      );
    });
  });
  return convertResultToArray(data as ResultSet);
};

export const queryByKeyword = async (
  db: SQLiteDatabase,
  tableName: string,
  fieldName: string,
  fieldValue: string,
) => {
  // 构建SQL查询语句
  const query = `SELECT * FROM ${tableName} WHERE ${fieldName} LIKE '%${fieldValue}%'`;

  // 执行查询语句
  const data = await new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        query,
        [],
        (_, results) => {
          resolve(results);
        },
        error => {
          console.log('ERROR: ', error);
          reject(error);
        },
      );
    });
  });
  return convertResultToArray(data as ResultSet);
};

// 删除数据
export const deleteDataByIds = (
  db: SQLiteDatabase,
  tableName: string,
  ids: number[],
): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // 构建 SQL 语句
      const sql = `DELETE FROM ${tableName} WHERE id IN (${ids.join(',')})`;
      // 执行 SQL 语句
      tx.executeSql(
        sql,
        [],
        (_, result) => {
          console.log(`删除 ${tableName} 表中的数据成功！`, result);
          resolve();
        },
        error => {
          console.log(`删除 ${tableName} 表中的数据失败！`, error);
          reject(error);
        },
      );
    });
  });
};

// 删除购物清单里对应的食物
export function deleteShoppingListItem(db: SQLiteDatabase, food_id: number) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM shopping_list_foods WHERE food_id = ?;',
        [food_id],
        (tx, resultSet) => {
          resolve(resultSet);
        },
        (tx, error) => {
          reject(error);
        },
      );
    });
  });
}

// 删除库存中对应的食物
export function deleteStockedFood(db: SQLiteDatabase, food_id: number) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM food_stocks WHERE food_id = ?;',
        [food_id],
        (tx, resultSet) => {
          resolve(resultSet);
        },
        (tx, error) => {
          reject(error);
        },
      );
    });
  });
}

// 根据ID删除数据
export function deleteDataById(
  db: SQLiteDatabase,
  tableName: string,
  id: number,
) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM ${tableName} WHERE id = ?;`,
        [id],
        (tx, resultSet) => {
          resolve(resultSet);
        },
        (tx, error) => {
          reject(error);
        },
      );
    });
  });
}

// 根据ID更新数据
interface DataToUpdate {
  [key: string]: any; // 定义对象任意属性类型
}

export const updateDataById = async (
  db: SQLiteDatabase,
  tableName: string,
  id: number,
  dataToUpdate: DataToUpdate,
): Promise<boolean> => {
  try {
    const fieldsToUpdate = Object.keys(dataToUpdate);
    const valuesToUpdate = Object.values(dataToUpdate);

    const query = `
      UPDATE ${tableName}
      SET ${fieldsToUpdate.map(field => `${field}=?`).join(', ')}
      WHERE id=?
    `;

    await db.executeSql(query, [...valuesToUpdate, id]);

    return true;
  } catch (error) {
    console.error('Failed to update data:', error);
    return false;
  }
};

export async function sumFieldById(
  db: SQLiteDatabase,
  tableName: string,
  idField: string,
  id: number,
  aggregationfield: string,
  retField = 'sum_field',
) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT SUM(${aggregationfield}) AS ${retField} FROM ${tableName} WHERE ${idField} = ?`,
        [id],
        (_, result) => {
          resolve(convertResultToArray(result));
        },
        (_, error) => {
          reject(error);
        },
      );
    });
  });
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

// 读取并排序数据
export async function readAndSortData(
  db: SQLiteDatabase,
  tableName: string,
  sortField: string,
  order: Order,
) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM ${tableName} ORDER BY ${sortField} ${order}`,
        [],
        (_, results) => {
          resolve(convertResultToArray(results));
        },
        error => {
          reject(error);
        },
      );
    });
  });
}
