import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER ,
  password: ''
};

const connection = mysql.createConnection(dbConfig);

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');

  // Create database if it does not exist
  connection.query(`CREATE DATABASE IF NOT EXISTS Science_Olympiad`, (err) => {
    if (err) {
      console.error('Error creating database:', err);
      return;
    }
    console.log('Database Science_Olympiad created or already exists');

    // Use the newly created database
    connection.changeUser({ database: 'Science_Olympiad' }, (err) => {
      if (err) {
        console.error('Error changing database:', err);
        return;
      }
      console.log('Connected to the Science_Olympiad database');
    });
  });
});

export default connection;
