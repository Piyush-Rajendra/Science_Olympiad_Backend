import { createPool, Pool } from 'mysql2/promise';
require('dotenv').config();

const pool: Pool = createPool({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
  connectionLimit: 10
});

pool.getConnection()
.then(async connection => {
  console.log('Database connection established');

  await connection.query(`CREATE DATABASE IF NOT EXISTS hsi21joo4cb74ayy`);

  connection.release();
})
.then(() => {
  console.log('Database setup complete');
})
.catch(error => {
  console.error('Error connecting to database:', error.message);
  process.exit(1);
});

export default pool;
