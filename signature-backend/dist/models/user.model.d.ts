import { Sector } from "./sector.model";
export interface User {
    id: number;
    name: string;
    email: string;
    password?: string;
    sector?: Sector;
    sectorId?: number;
}
