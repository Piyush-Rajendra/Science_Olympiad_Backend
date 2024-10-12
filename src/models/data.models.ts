

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
  location: string;
  eventSupervisor_id: number;
  tournament_id: number;
  scoringAlg: String;
  description: String; 
}

// models/eventHistory.model.ts
export interface IEventHistory {
  eventHistory_id: number;
  tournament_id: number;
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
}

// models/school.model.ts
export interface ISchool {
  ID: number;
  school_group_id: number;
  name: String; 
  flight: String; 
}

export interface ITeam {
  ID: number;
  school_id: number;
  name: String; 
  unique_id: String; 
}
