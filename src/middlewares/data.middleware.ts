import pool from '../../config/db.config';

export const createTables = async () => {
  try {
    await pool.execute(`
        CREATE TABLE IF NOT EXISTS Tournament (
        tournament_id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT NOT NULL,
        isCurrent BOOLEAN NOT NULL DEFAULT FALSE,
        division VARCHAR(255) NOT NULL,
        NumOfTimeBlocks INT NOT NULL,
        score_id INT,
        name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        location VARCHAR(255) NOT NULL,
        description TEXT,
        FOREIGN KEY (score_id) REFERENCES Score(score_id) ON DELETE SET NULL ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Event (
        event_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        eventSupervisor_id INT,
        tournament_id INT,
        scoringAlg VARCHAR(255) NOT NULL,
        description TEXT,
        FOREIGN KEY (eventSupervisor_id) REFERENCES EventSupervisor(eventSupervisor_id) ON DELETE SET NULL ON UPDATE CASCADE,
        FOREIGN KEY (tournament_id) REFERENCES Tournament(tournament_id) ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Scores (
        score_id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT,
        school_id INT,
        tournament_id INT,
        school_group_id INT,
        is_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
        FOREIGN KEY (event_id) REFERENCES Event(event_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (school_id) REFERENCES School(school_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (tournament_id) REFERENCES Tournament(tournament_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (school_group_id) REFERENCES SchoolGroup(school_group_id) ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS School (
        ID INT AUTO_INCREMENT PRIMARY KEY,
        school_group_id INT,
        name VARCHAR(255) NOT NULL,
        flight VARCHAR(50) NOT NULL,
        FOREIGN KEY (school_group_id) REFERENCES SchoolGroup(school_group_id) ON DELETE SET NULL ON UPDATE CASCADE
      );

       CREATE TABLE IF NOT EXISTS Team (
        ID INT AUTO_INCREMENT PRIMARY KEY,
        school_id INT,
        name VARCHAR(255) NOT NULL,
        unique_id VARCHAR(100) NOT NULL,
        FOREIGN KEY (school_id) REFERENCES School(school_id) ON DELETE CASCADE ON UPDATE CASCADE
      );

       CREATE TABLE IF NOT EXISTS SchoolGroup (
        school_group_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
      );
      
    `);
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables', error);
  }
};