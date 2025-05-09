import { UserRole } from '../user.entity';
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    password?: string;
    sectorId?: number;
    role?: UserRole;
}
