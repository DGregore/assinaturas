import { UserService, UserPublicProfile } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
export declare class AuthService {
    private userService;
    private jwtService;
    private refreshTokenRepository;
    constructor(userService: UserService, jwtService: JwtService, refreshTokenRepository: Repository<RefreshToken>);
    validateUser(email: string, pass: string): Promise<UserPublicProfile | null>;
    private generateTokens;
    private storeRefreshToken;
    login(user: UserPublicProfile): Promise<{
        access_token: string;
        refresh_token: string;
        user: UserPublicProfile;
    }>;
    refreshToken(refreshTokenValue: string): Promise<{
        access_token: string;
    }>;
    revokeRefreshTokenForUser(userId: number): Promise<void>;
}
