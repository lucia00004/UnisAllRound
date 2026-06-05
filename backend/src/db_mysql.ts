import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'mysqluser',
  password: process.env.MYSQL_PASSWORD || 'mysqlpass',
  database: process.env.MYSQL_DATABASE || 'unisallround',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function queryMysql(sql: string, params?: any[]) {
  const [results] = await mysqlPool.execute(sql, params);
  return results;
}
