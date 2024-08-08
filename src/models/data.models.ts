

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
  score_id: number;
  name: string;
}


// models/event.model.ts
export interface IEvent {
  event_id: number;
  timeBlock_id: number;
  width: number;
  name: string;
  location: string;
  eventSupervisor_id: number;
  tournament_id: number;
}

// models/eventHistory.model.ts
export interface IEventHistory {
  eventHistory_id: number;
  tournament_id: number;
}

// models/scores.model.ts
export interface IScores {
  score_id: number;
  event_id: number;
  school_id: number;
  ranking_id: number;
  score: number;
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
  TimeBlock_ID: number;
  School_ID: number;
  SchoolName: string;
}
