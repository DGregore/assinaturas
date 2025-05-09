import { User } from '../../user/user.entity';
export declare class RefreshToken {
    id: string;
    user: User;
    userId: number;
    hashedToken: string;
    expiresAt: Date;
    isRevoked: boolean;
}
