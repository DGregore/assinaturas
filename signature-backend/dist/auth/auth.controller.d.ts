import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserPublicProfile } from '../user/user.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: {
        user: UserPublicProfile;
    }, loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: UserPublicProfile;
    }>;
    refresh(refreshTokenDto: RefreshTokenDto): Promise<{
        access_token: string;
    }>;
    getProfile(req: {
        user: UserPublicProfile;
    }): UserPublicProfile;
}
