import { createPool, Pool } from 'mysql2/promise';

const pool: Pool = createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'science_olympiad',
  connectionLimit: 10
});

pool.getConnection()
  .then(connection => {
    console.log('Database connection established');
    connection.release();
  })
  .catch(error => {
    console.error('Error connecting to database:', error.message);
    process.exit(1); // Exit the process or handle the error as per your application's needs
  });

  
export default pool;
