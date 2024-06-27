import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const SERVER_TOKEN_EXPIRETIME = process.env.SERVER_TOKEN_EXPIRETIME || 3600;
const SERVER_TOKEN_ISSUER = process.env.SERVER_TOKEN_EXPIRETIME || "coolIssuer";
const SERVER_TOKEN_SECRET = process.env.SERVER_TOKEN_SECRET || "superencryptedsecret";


const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: '',
  token: {
    expireTime : SERVER_TOKEN_EXPIRETIME,
    issuer: SERVER_TOKEN_ISSUER,
    secret: SERVER_TOKEN_SECRET
  },
  port: 3301,
};

export const Connect = async () =>
  new Promise<mysql.Connection>((resolve, reject) => {
      const connection = mysql.createConnection(dbConfig);

      connection.connect((error) => {
          if (error) {
              reject(error);
              return;
          }

          resolve(connection);
      });
  });

export const Query = async<T> (connection: mysql.Connection, query: string) =>
  new Promise((resolve, reject) => {
      connection.query(query, connection, (error, result) => {
          if (error) {
              reject(error);
              return;
          }

          resolve(result);
          connection.end();
      });
  });


export default {dbConfig};
