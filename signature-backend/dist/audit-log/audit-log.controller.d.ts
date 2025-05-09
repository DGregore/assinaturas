import { AuditLogService } from "./audit-log.service";
import { AuditLog } from "./audit-log.entity";
declare class FindAuditLogsQueryDto {
    userId?: number;
    entityType?: string;
    entityId?: number;
    action?: string;
    take?: number;
    skip?: number;
}
export declare class AuditLogController {
    private readonly auditLogService;
    constructor(auditLogService: AuditLogService);
    findLogs(query: FindAuditLogsQueryDto): Promise<AuditLog[]>;
    findLogsForEntity(entityType: string, entityId: number): Promise<AuditLog[]>;
}
export {};
