import pool from '../../config/db.config';

export const createTables = async () => {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        _id INT AUTO_INCREMENT,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (_id)
      )
    `);
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables', error);
  }
};
