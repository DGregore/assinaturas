import { User } from '../user/user.entity';
export declare class AuditLog {
    id: number;
    timestamp: Date;
    user: User | null;
    action: string;
    entityType: string | null;
    entityId: number | null;
    details: any | null;
}
