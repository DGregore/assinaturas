import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { Sector } from '../sector/sector.entity';
import { SectorService } from '../sector/sector.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export type UserPublicProfile = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    sector: Sector | null;
};
export declare class UserService {
    private userRepository;
    private sectorService;
    constructor(userRepository: Repository<User>, sectorService: SectorService);
    private userToPublicProfile;
    private usersToPublicProfile;
    create(createUserDto: CreateUserDto): Promise<UserPublicProfile>;
    findAll(): Promise<UserPublicProfile[]>;
    findOne(id: number): Promise<UserPublicProfile>;
    searchUsers(query: string): Promise<UserPublicProfile[]>;
    findByEmailWithPassword(email: string): Promise<User | null>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<UserPublicProfile>;
    remove(id: number): Promise<void>;
}
