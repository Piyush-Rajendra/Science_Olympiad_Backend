import pool from '../config/db.config';

export const createTables = async () => {
  try {
    // Create Superadmin Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS superadmin (
        _superadmin_id INT AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        createdOn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (_superadmin_id)
      )
    `);
    
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables', error);
  }
};
