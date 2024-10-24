import { createPool, Pool } from 'mysql2/promise';
require('dotenv').config();

const pool: Pool = createPool({
  host: process.env.host,
  user: process.env.user,
  password: process.env.pass,
  database:process.env.database,
  connectionLimit: 10
});

pool.getConnection()
.then(async connection => {
  console.log('Database connection established');

  // Check if the database exists, create it if it doesn't
  await connection.query(`CREATE DATABASE IF NOT EXISTS oro04mqr28yny1ki`);

  connection.release();
})
.then(() => {
  console.log('Database setup complete');
})
.catch(error => {
  console.error('Error connecting to database:', error.message);
  process.exit(1); // Exit the process or handle the error as per your application's needs
});

export default pool;
