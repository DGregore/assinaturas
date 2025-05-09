import { Repository, FindManyOptions } from 'typeorm';
import { AuditLog } from './audit-log.entity';
export declare class AuditLogService {
    private auditLogRepository;
    private readonly logger;
    constructor(auditLogRepository: Repository<AuditLog>);
    logAction(userId: number | null, action: string, entityType: string, entityId: number, details?: Record<string, any>): Promise<void>;
    findLogs(options?: FindManyOptions<AuditLog>): Promise<AuditLog[]>;
    findLogsForEntity(entityType: string, entityId: number): Promise<AuditLog[]>;
}
