
export enum WordType {plane='plane', block='block'}

export interface IWord {
      type: WordType;
      text: string;
      ref: React.RefObject<any>;
}

export interface ILine extends Array<IWord>{ 
}
