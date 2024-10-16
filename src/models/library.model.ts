 export interface IResourceLibrary {
    resourceLibrary_id: number;
    schoolGroup_id: number;
    pdf_input: Buffer; 
  }

  export interface IQandA {
    QandA_id: number;
    schoolGroup_id: number;
    Question: String; 
    Answer: String; 
    isAnswered: number;
    lastUpdated: Date;
    createdOn: Date;
  }