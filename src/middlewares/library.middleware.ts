import pool from '../../config/db.config';

export const createTables = async () => {
  try {
    await pool.execute(`
        CREATE TABLE IF NOT EXISTS ResourceLibrary (
            resourceLibrary_id INT AUTO_INCREMENT PRIMARY KEY,
            schoolGroup_id INT NOT NULL,
            pdf_input VARCHAR(255) NOT NULL,
            FOREIGN KEY (schoolGroup_id) REFERENCES SchoolGroup(school_group_id) ON DELETE CASCADE ON UPDATE CASCADE
        );
    `);

    await pool.execute(`
        CREATE TABLE IF NOT EXISTS QandA (
            QandA_id INT AUTO_INCREMENT PRIMARY KEY,
            schoolGroup_id INT NOT NULL,
            Question TEXT NOT NULL,
            Answer TEXT,
            isAnswered TINYINT(1) NOT NULL,
            lastUpdated DATETIME NOT NULL,
            createdOn DATETIME NOT NULL,
            FOREIGN KEY (schoolGroup_id) REFERENCES SchoolGroup(school_group_id) ON DELETE CASCADE ON UPDATE CASCADE
        );
      `);
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables', error);
  }
};
