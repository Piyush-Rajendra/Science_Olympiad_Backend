import { createPool, Pool } from 'mysql2/promise';

const pool: Pool = createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'science_olympiad',
  connectionLimit: 10
});

pool.getConnection()
.then(async connection => {
  console.log('Database connection established');

  // Check if the database exists, create it if it doesn't
  await connection.query(`CREATE DATABASE IF NOT EXISTS science_olympiad`);

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
