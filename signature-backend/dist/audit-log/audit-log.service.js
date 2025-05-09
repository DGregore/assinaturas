"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuditLogService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_entity_1 = require("./audit-log.entity");
let AuditLogService = AuditLogService_1 = class AuditLogService {
    auditLogRepository;
    logger = new common_1.Logger(AuditLogService_1.name);
    constructor(auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }
    async logAction(userId, action, entityType, entityId, details) {
        this.logger.log(`Logging action: User ${userId || 'System'} performed ${action} on ${entityType} ${entityId}`);
        try {
            const logEntry = this.auditLogRepository.create({
                user: userId ? { id: userId } : null,
                action: action,
                entityType: entityType,
                entityId: entityId,
                details: details || {},
            });
            await this.auditLogRepository.save(logEntry);
        }
        catch (error) {
            this.logger.error(`Failed to save audit log for action ${action} on ${entityType} ${entityId}: ${error.message}`, error.stack);
        }
    }
    async findLogs(options) {
        this.logger.log(`Finding audit logs with options: ${JSON.stringify(options)}`);
        return this.auditLogRepository.find({
            ...options,
            relations: ['user'],
            order: { timestamp: 'DESC' },
        });
    }
    async findLogsForEntity(entityType, entityId) {
        return this.findLogs({ where: { entityType, entityId } });
    }
};
exports.AuditLogService = AuditLogService;
exports.AuditLogService = AuditLogService = AuditLogService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditLogService);
//# sourceMappingURL=audit-log.service.js.map