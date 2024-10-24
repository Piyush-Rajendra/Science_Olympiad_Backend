export interface eventSupervisorsEvent {
    eventSupervisorsEvent_id: number
    event_id: number
    EventSupervisorId: number
  }
  

  // models/tournaments.model.ts
export interface ITournament {
  tournament_id: number;
  group_id: number;
  isCurrent: boolean;
  division: string;
  NumOfTimeBlocks: number;
  name: string;
  date:  Date;
  location: String;
  description: String; 
}


// models/event.model.ts
export interface IEvent {
  event_id: number;
  name: string;
  tournament_id: number;
  scoringAlg: String;
  description: String; 
  status: number;
  scoreStatus: number; 
}

// models/TournamentHistory.model.ts
export interface ITournamentHistory {
  tournamentHistory_id: number;
  school_group_id: number;
  excelMasterScore: string;
  date: Date;
  name: string;
  division: string;
}

// models/scores.model.ts
export interface IScore {
  score_id: number;
  score: number;
  event_id: number;
  school_id: number;
  tournament_id: number; 
  school_group_id: number;
  team_id: number;
  is_reviewed: boolean; 
}

// models/rankings.model.ts
export interface IRankings {
  ranking_id: number;
  event_id: number;
  school_id: number;
  rank: number;
}

// models/timeBlock.model.ts
export interface ITimeBlock {
  timeBlock_id: number;
  startTime: Date;
  endTime: Date;
  event_id: number;
  tournament_id: number;
  building: String;
  roomNumber: String;
  status: number;
}

// models/school.model.ts
export interface ISchool {
  ID: number;
  school_group_id: number;
  name: String; 
  flight: String; 
  tournament_id: number;
}

// models/team.model.ts
export interface ITeam {
  ID: number;
  school_id: number;
  name: String; 
  unique_id: String; 
  tournament_id: number;
}

// models/teamTimeBlock.model.ts
export interface ITeamTimeBlock {
  teamTimeBlock_id: number;
  timeBlock_id: number;
  team_id: number;
  event_id: number;
  attend: boolean;
  comment: String; 
  tier: number; 
  score: number;

}

// models/eventSuperVisorEvent.model.ts
export interface IEventSuperVisorEvent {
  eventSuperVisorEvent_id: number;
  event_id: number;
  eventSupervisor_id: number;
}

// modes/schoolGroup.mode.ts

export interface ISchoolGroup {
  schoolgroup_id: number;
  name: string;
}

// models/library.model.ts
export interface IResourceLibrary {
  resourceLibrary_id: number;
  schoolGroup_id: number;
  pdf_input: Buffer; 
}

// models/library.model.ts
export interface IQandA {
  QandA_id: number;
  schoolGroup_id: number;
  Question: String; 
  Answer: String; 
  isAnswered: number;
  lastUpdated: Date;
  createdOn: Date;
// models/RankedTeam.model.ts

export interface RankedTeam {
    teamName: string;
    score: number | null;
    tier: number;
    TeamTimeBlock_ID: number;
    unique_id: number; // Added to store the unique team ID
    rank?: number; // Optional property for rank
}