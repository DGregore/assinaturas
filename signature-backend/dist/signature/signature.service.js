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
var SignatureService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignatureService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const signature_entity_1 = require("./signature.entity");
const document_service_1 = require("../document/document.service");
const document_signatory_entity_1 = require("../document/document-signatory.entity");
const audit_log_service_1 = require("../audit-log/audit-log.service");
let SignatureService = SignatureService_1 = class SignatureService {
    signatureRepository;
    signatoryRepository;
    documentService;
    auditLogService;
    logger = new common_1.Logger(SignatureService_1.name);
    constructor(signatureRepository, signatoryRepository, documentService, auditLogService) {
        this.signatureRepository = signatureRepository;
        this.signatoryRepository = signatoryRepository;
        this.documentService = documentService;
        this.auditLogService = auditLogService;
    }
    async create(createDto, userId) {
        this.logger.log(`Attempting to create signature for document ID: ${createDto.documentId} by user ID: ${userId}`);
        const isReady = await this.documentService.isDocumentReadyForUser(createDto.documentId, userId);
        if (!isReady) {
            this.logger.warn(`User ID ${userId} is not the correct next signatory for document ID ${createDto.documentId}.`);
            throw new common_1.ForbiddenException('Não é a sua vez de assinar este documento ou o documento não está pronto para assinatura.');
        }
        const signatoryRecord = await this.signatoryRepository.findOne({
            where: { document: { id: createDto.documentId }, user: { id: userId }, status: document_signatory_entity_1.SignatoryStatus.PENDING }
        });
        if (!signatoryRecord) {
            this.logger.error(`Could not find PENDING signatory record for user ${userId} and document ${createDto.documentId}.`);
            throw new common_1.NotFoundException('Registro de signatário pendente não encontrado.');
        }
        const signature = this.signatureRepository.create({
            document: { id: createDto.documentId },
            user: { id: userId },
            signatureData: createDto.signatureData,
            positionData: createDto.positionData,
        });
        const savedSignature = await this.signatureRepository.save(signature);
        this.logger.log(`Signature saved with ID: ${savedSignature.id}`);
        this.auditLogService.logAction(userId, 'CREATE_SIGNATURE', 'Signature', savedSignature.id, { documentId: createDto.documentId });
        try {
            await this.documentService.updateSignatoryStatus(createDto.documentId, userId, document_signatory_entity_1.SignatoryStatus.SIGNED);
            this.logger.log(`Document flow updated for document ID: ${createDto.documentId} after signature by user ID: ${userId}`);
        }
        catch (error) {
            this.logger.error(`Failed to update document flow after saving signature ID ${savedSignature.id}: ${error.message}`, error.stack);
            throw error;
        }
        return savedSignature;
    }
};
exports.SignatureService = SignatureService;
exports.SignatureService = SignatureService = SignatureService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(signature_entity_1.Signature)),
    __param(1, (0, typeorm_1.InjectRepository)(document_signatory_entity_1.DocumentSignatory)),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => audit_log_service_1.AuditLogService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        document_service_1.DocumentService,
        audit_log_service_1.AuditLogService])
], SignatureService);
//# sourceMappingURL=signature.service.js.map