import dotenv from "dotenv";
import mariadb from "mariadb";

dotenv.config({
  path: "../.env"
});

const pool = mariadb.createPool({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  connectionLimit: 5
});


export const runQuery = async (query: string, parameters: { [key: string]: any } = {}) => {
  const conn = await pool.getConnection()

  return conn.query({bigIntAsNumber: true, namedPlaceholders: true, sql: query.trim()}, parameters)
    .then((rows) => {
      return rows;
    })
    .catch(err => {
      //handle error
      console.log(err);
    })
    .finally(() => {
      conn.end();
    })
}