"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDataTables = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
const createDataTables = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Create SchoolGroup table
        yield db_config_1.default.execute(`
        CREATE TABLE IF NOT EXISTS SchoolGroup (
        school_group_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL
        );
    `);
        // Create Admin Table
        yield db_config_1.default.execute(`
      CREATE TABLE IF NOT EXISTS admin (
        admin_id INT AUTO_INCREMENT PRIMARY KEY,
        school_group_id INT,       
        email VARCHAR(255) NOT NULL,
        firstname VARCHAR(255) NOT NULL,
        lastname VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        isTournamentDirector BOOLEAN NOT NULL DEFAULT FALSE,
        FOREIGN KEY (school_group_id) REFERENCES SchoolGroup(school_group_id) ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
        // Create Tournament table
        yield db_config_1.default.execute(`
        CREATE TABLE IF NOT EXISTS tournament (
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
            FOREIGN KEY (group_id) REFERENCES SchoolGroup(school_group_id) ON DELETE CASCADE ON UPDATE CASCADE
        );
    `);
        // Create EventSupervisor table
        yield db_config_1.default.execute(`
      CREATE TABLE IF NOT EXISTS eventsupervisor (
          eventSupervisor_id INT AUTO_INCREMENT PRIMARY KEY,
          school_group_id INT,
          tournament_id INT,
          firstName VARCHAR(255) NOT NULL,
          lastName VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          username VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          FOREIGN KEY (school_group_id) REFERENCES SchoolGroup(school_group_id) ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY (tournament_id) REFERENCES Tournament(tournament_id) ON DELETE CASCADE ON UPDATE CASCADE
        )
    `);
        // Create School table
        yield db_config_1.default.execute(`
        CREATE TABLE IF NOT EXISTS School (
        ID INT AUTO_INCREMENT PRIMARY KEY,
        school_group_id INT,
        tournament_id  INT, 
        name VARCHAR(255) NOT NULL,
        flight VARCHAR(50) NOT NULL,
        FOREIGN KEY (school_group_id) REFERENCES SchoolGroup(school_group_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (tournament_id) REFERENCES Tournament(tournament_id) ON DELETE CASCADE ON UPDATE CASCADE
        );
    `);
        //Create Team Table
        yield db_config_1.default.execute(`
        CREATE TABLE IF NOT EXISTS Team (
        team_id INT AUTO_INCREMENT PRIMARY KEY,
        school_id INT,
        tournament_id  INT, 
        name VARCHAR(255) NOT NULL,
        unique_id VARCHAR(100) NOT NULL,
        FOREIGN KEY (school_id) REFERENCES School(ID) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (tournament_id) REFERENCES Tournament(tournament_id) ON DELETE CASCADE ON UPDATE CASCADE
        );
        `);
        // Create Event table
        yield db_config_1.default.execute(`
        CREATE TABLE IF NOT EXISTS Event (
            event_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            tournament_id INT,
            scoringAlg VARCHAR(255) NOT NULL,
            description TEXT,
            status INT,
            scoreStatus INT DEFAULT 0,
            FOREIGN KEY (tournament_id) REFERENCES Tournament(tournament_id) ON DELETE CASCADE ON UPDATE CASCADE
        );
    `);
        //Create TimeBlock Table
        yield db_config_1.default.execute(`
        CREATE TABLE IF NOT EXISTS TimeBlock (
            TimeBlock_ID INT AUTO_INCREMENT PRIMARY KEY,
            Event_ID INT,
            Tournament_ID INT,
            TimeBegin DATETIME,
            TimeEnd DATETIME,
            Building TEXT,
            RoomNumber INT,
            Status INT,
            FOREIGN KEY (Tournament_ID) REFERENCES Tournament(tournament_id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (Event_ID) REFERENCES Event(event_id) ON DELETE CASCADE ON UPDATE CASCADE
        );
    `);
        //Create Team TimeBlock tables
        yield db_config_1.default.execute(`
        CREATE TABLE IF NOT EXISTS TeamTimeBlock (
            TeamTimeBlock_ID INT AUTO_INCREMENT PRIMARY KEY,
            TimeBlock_ID INT,
            Team_ID INT,
            Event_ID INT, 
            Attend BOOLEAN NOT NULL,
            Comment TEXT,
            Tier INT,
            Score FLOAT,
            FOREIGN KEY (Event_ID) REFERENCES Event(event_id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (Team_ID) REFERENCES Team(team_id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (TimeBlock_ID) REFERENCES TimeBlock(TimeBlock_ID) ON DELETE CASCADE ON UPDATE CASCADE
        );
    `);
        // Create Score Tables
        yield db_config_1.default.execute(`
        CREATE TABLE IF NOT EXISTS Score (
            score_id INT AUTO_INCREMENT PRIMARY KEY,
            score FLOAT,
            event_id INT,
            school_id INT,
            tournament_id INT,
            school_group_id INT,
            team_id INT,
            is_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
            FOREIGN KEY (event_id) REFERENCES Event(event_id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (school_id) REFERENCES School(ID) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (tournament_id) REFERENCES Tournament(tournament_id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (school_group_id) REFERENCES SchoolGroup(school_group_id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (team_id) REFERENCES Team(team_id) ON DELETE CASCADE ON UPDATE CASCADE
        );
    `);
        // Create EventSupervisorEvents
        yield db_config_1.default.execute(`
        CREATE TABLE IF NOT EXISTS EventSuperVisorEvent (
            eventSuperVisorEvent_id INT AUTO_INCREMENT PRIMARY KEY,
            event_id INT,
            eventSupervisor_id INT,
            FOREIGN KEY (event_id) REFERENCES Event(event_id) ON DELETE CASCADE ON UPDATE CASCADE,            
            FOREIGN KEY (eventSupervisor_id) REFERENCES eventsupervisor(eventSupervisor_id) ON DELETE CASCADE ON UPDATE CASCADE
        );
    `);
        // Create Tournament History
        yield db_config_1.default.execute(`
        CREATE TABLE IF NOT EXISTS TournamentHistory (
            tournament_history_id INT AUTO_INCREMENT PRIMARY KEY,
            school_group_id INT NOT NULL,
            excelmasterscore LONGBLOB, 
            date DATETIME,
            name VARCHAR(255),
            division VARCHAR(255),
            FOREIGN KEY (school_group_id) REFERENCES SchoolGroup(school_group_id) ON DELETE CASCADE ON UPDATE CASCADE
        )
    `);
        yield db_config_1.default.execute(`
        CREATE TABLE IF NOT EXISTS ResourceLibrary (
            resourceLibrary_id INT AUTO_INCREMENT PRIMARY KEY,
            schoolGroup_id INT NOT NULL,
            pdf_input LONGBLOB NOT NULL,
            FOREIGN KEY (schoolGroup_id) REFERENCES SchoolGroup(school_group_id) ON DELETE CASCADE ON UPDATE CASCADE
        );
    `);
        yield db_config_1.default.execute(`
        CREATE TABLE IF NOT EXISTS QandA (
            QandA_id INT AUTO_INCREMENT PRIMARY KEY,
            schoolGroup_id INT NOT NULL,
            Question TEXT NOT NULL,
            Answer TEXT,
            isAnswered TINYINT(1) NOT NULL,
            lastUpdated DATETIME NOT NULL,
            createdOn DATETIME NOT NULL,
            tournament_id INT,
            FOREIGN KEY (schoolGroup_id) REFERENCES SchoolGroup(school_group_id) ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (tournament_id) REFERENCES Tournament(tournament_id) ON DELETE CASCADE ON UPDATE CASCADE
        );
      `);
        console.log('Tables created successfully');
    }
    catch (error) {
        console.error('Error creating tables', error);
    }
});
exports.createDataTables = createDataTables;
