export interface IBase {
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export type Create<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
  