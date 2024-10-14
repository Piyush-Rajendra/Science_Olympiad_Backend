import pool from '../../config/db.config';

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

    // Create Admin Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS admin (
        admin_id INT AUTO_INCREMENT PRIMARY KEY,
        school_group_id INT,       
        email VARCHAR(255) NOT NULL,
        firstname VARCHAR(255) NOT NULL,
        lastname VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        isTournamentDirector BOOLEAN NOT NULL DEFAULT FALSE,
        FOREIGN KEY (school_group_id) REFERENCES SchoolGroup(school_group_id) 
      )
    `);

    // Create EventSupervisor table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS eventsupervisor (
          eventSupervisor_id INT AUTO_INCREMENT PRIMARY KEY,
          school_group_id INT,
          name VARCHAR(255) NOT NULL,
          schoolGroup_id INT NOT NULL,
          firstname VARCHAR(255) NOT NULL,
          lastname VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          FOREIGN KEY (school_group_id) REFERENCES SchoolGroup(school_group_id) 
        )
    `);
    
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables', error);
  }
};
