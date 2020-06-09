export enum WordType {plane='plane', block='block'}

export interface IWord {
      type: WordType;
      text: string;
}

export interface ILine extends Array<IWord>{ 
}
