export interface IUser {
    id?: number;
    name: string;
    lastName?: string | null;
    dateOfBirth: Date | null;
}