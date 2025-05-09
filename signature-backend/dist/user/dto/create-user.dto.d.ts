import { UserRole } from '../user.entity';
export declare class CreateUserDto {
    name: string;
    email: string;
    password: string;
    sectorId?: number;
    role?: UserRole;
}
