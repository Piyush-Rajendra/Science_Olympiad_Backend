
  export interface IEventSupervisor {
    eventSupervisor_id: number;
    school_group_id: number | null;
    firstName: string,
    lastName: string,
    email: string;
    username: string;
    password: string;
  }

  export interface IUser {
    user_id: number;
    name: string;
    email: string;
    password: string;
    isAttendance: boolean;
    passwordChanged: boolean;
    school_id: number | null;
  }

  export interface IAdmin {
    admin_id: number;
    school_group_id: number | null;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    isTournamentDirector: boolean;
  }
  
  export interface ISuperadmin {
    _superadmin_id: number;
    name: string;
    username: string;
    password: string;
    lastUpdated: Date;
    createdOn: Date;
  }
  