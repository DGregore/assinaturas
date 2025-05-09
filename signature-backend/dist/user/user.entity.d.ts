import { Sector } from '../sector/sector.entity';
export declare enum UserRole {
    ADMIN = "admin",
    USER = "user"
}
export declare class User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    sector: Sector | null;
    hashPasswordBeforeInsert(): Promise<void>;
    hashPasswordBeforeUpdate(): Promise<void>;
    comparePassword(attempt: string): Promise<boolean>;
}
