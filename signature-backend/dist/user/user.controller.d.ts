import { UserService, UserPublicProfile } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<UserPublicProfile>;
    findAll(): Promise<UserPublicProfile[]>;
    searchUsers(query: string): Promise<UserPublicProfile[]>;
    findOne(id: number): Promise<UserPublicProfile>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<UserPublicProfile>;
    remove(id: number): Promise<void>;
}
