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
var DocumentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const document_entity_1 = require("./document.entity");
const document_signatory_entity_1 = require("./document-signatory.entity");
const user_entity_1 = require("../user/user.entity");
const minio_service_1 = require("./minio.service");
const pdf_validation_service_1 = require("./pdf-validation.service");
const notification_service_1 = require("../notification/notification.service");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const uuid_1 = require("uuid");
let DocumentService = DocumentService_1 = class DocumentService {
    documentRepository;
    signatoryRepository;
    userRepository;
    minioService;
    notificationService;
    auditLogService;
    pdfValidationService;
    logger = new common_1.Logger(DocumentService_1.name);
    constructor(documentRepository, signatoryRepository, userRepository, minioService, notificationService, auditLogService, pdfValidationService) {
        this.documentRepository = documentRepository;
        this.signatoryRepository = signatoryRepository;
        this.userRepository = userRepository;
        this.minioService = minioService;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
        this.pdfValidationService = pdfValidationService;
    }
    async validateDocument(file) {
        if (!file.mimetype.includes('pdf')) {
            throw new common_1.BadRequestException('O arquivo deve ser um PDF');
        }
        await this.pdfValidationService.validatePdf(file.buffer);
        return true;
    }
    async create(uploadDto, file, ownerId) {
        this.logger.log(`Creating document: ${file.originalname} for owner ID: ${ownerId}`);
        const owner = await this.userRepository.findOne({ where: { id: ownerId } });
        if (!owner) {
            this.logger.error(`Owner with ID ${ownerId} not found.`);
            throw new common_1.NotFoundException(`Usuário proprietário com ID ${ownerId} não encontrado.`);
        }
        if (!file.mimetype.includes('pdf')) {
            this.logger.warn(`Invalid file type: ${file.mimetype}. Only PDF files are allowed.`);
            throw new common_1.BadRequestException('Apenas arquivos PDF são permitidos.');
        }
        try {
            this.logger.log('Validating PDF file...');
            await this.pdfValidationService.validatePdf(file.buffer);
            this.logger.log('PDF validation successful');
        }
        catch (error) {
            this.logger.warn(`PDF validation failed: ${error.message}`);
            throw error;
        }
        const fileExtension = file.originalname.split('.').pop() || 'bin';
        const storagePath = `documents/${(0, uuid_1.v4)()}.${fileExtension}`;
        let savedDocument = null;
        try {
            await this.minioService.uploadFile(storagePath, file.buffer, file.mimetype);
            this.logger.log(`File uploaded to MinIO at path: ${storagePath}`);
            const document = this.documentRepository.create({
                title: uploadDto.title,
                description: uploadDto.description,
                originalFilename: file.originalname,
                storagePath: storagePath,
                mimeType: file.mimetype,
                size: file.buffer.length,
                owner: owner,
                status: (uploadDto.signatories && uploadDto.signatories.length > 0) ? document_entity_1.DocumentStatus.SIGNING : document_entity_1.DocumentStatus.PENDING,
            });
            savedDocument = await this.documentRepository.save(document);
            this.logger.log(`Document metadata saved with ID: ${savedDocument.id}`);
            await this.auditLogService.logAction(ownerId, 'CREATE_DOCUMENT', 'Document', savedDocument.id, { title: savedDocument.title });
            if (uploadDto.signatories && uploadDto.signatories.length > 0) {
                const signatoryUsers = await this.userRepository.find({
                    where: { id: (0, typeorm_2.In)(uploadDto.signatories.map(s => s.userId)) }
                });
                const userMap = new Map(signatoryUsers.map(u => [u.id, u]));
                const signatoryEntities = uploadDto.signatories.map(sigDto => {
                    const user = userMap.get(sigDto.userId);
                    if (!user) {
                        this.logger.warn(`Signatory user with ID ${sigDto.userId} not found during document creation. Skipping.`);
                        return null;
                    }
                    return this.signatoryRepository.create({
                        document: savedDocument,
                        user: user,
                        order: sigDto.order,
                        status: document_signatory_entity_1.SignatoryStatus.PENDING,
                    });
                }).filter(s => s !== null);
                if (signatoryEntities.length > 0) {
                    const savedSignatories = await this.signatoryRepository.save(signatoryEntities);
                    this.logger.log(`Saved ${savedSignatories.length} signatories for document ID: ${savedDocument.id}`);
                    await this.auditLogService.logAction(ownerId, 'ADD_SIGNATORIES', 'Document', savedDocument.id, { signatoryIds: savedSignatories.map(s => s.user.id) });
                    await this.notifyNextSignatories(savedDocument.id);
                }
                else {
                    this.logger.warn(`No valid signatories found or saved for document ID: ${savedDocument.id}. Setting status to PENDING.`);
                    savedDocument.status = document_entity_1.DocumentStatus.PENDING;
                    await this.documentRepository.save(savedDocument);
                }
            }
            else {
                this.logger.log(`No signatories provided for document ID: ${savedDocument.id}. Status is PENDING.`);
            }
            return savedDocument;
        }
        catch (error) {
            this.logger.error(`Failed to create document: ${error.message}`, error.stack);
            if (savedDocument === null && storagePath) {
                try {
                    await this.minioService.deleteFile(storagePath);
                    this.logger.log(`Cleaned up MinIO file due to error: ${storagePath}`);
                }
                catch (cleanupError) {
                    this.logger.error(`Failed to cleanup MinIO file ${storagePath}: ${cleanupError.message}`, cleanupError.stack);
                }
            }
            throw new common_1.InternalServerErrorException(`Falha ao criar documento: ${error.message}`);
        }
    }
    async findAll(options) {
        this.logger.log(`Finding all documents with options: ${JSON.stringify(options)}`);
        return this.documentRepository.find(options);
    }
    async findOne(id, userId, userRole) {
        this.logger.log(`Finding document ID: ${id} for user ID: ${userId}`);
        const options = {
            where: { id },
            relations: ['owner', 'signatories', 'signatories.user'],
        };
        const document = await this.documentRepository.findOne(options);
        if (!document) {
            throw new common_1.NotFoundException(`Documento com ID ${id} não encontrado.`);
        }
        if (userRole === user_entity_1.UserRole.ADMIN || document.owner.id === userId || document.signatories.some(sig => sig.user.id === userId)) {
            await this.auditLogService.logAction(userId, 'VIEW_DOCUMENT', 'Document', document.id);
            return document;
        }
        this.logger.warn(`User ID ${userId} does not have permission to access document ID ${id}.`);
        throw new common_1.ForbiddenException('Você não tem permissão para acessar este documento.');
    }
    async findPendingForUser(userId) {
        this.logger.log(`Finding documents pending signature for user ID: ${userId}`);
        const pendingSignatories = await this.signatoryRepository.find({
            where: { user: { id: userId }, status: document_signatory_entity_1.SignatoryStatus.PENDING },
            relations: ['document', 'document.owner'],
        });
        const pendingDocuments = pendingSignatories
            .map(sig => sig.document)
            .filter(doc => doc && doc.status === document_entity_1.DocumentStatus.SIGNING);
        const documentsReadyForUser = [];
        for (const doc of pendingDocuments) {
            if (doc) {
                const isReady = await this.isDocumentReadyForUser(doc.id, userId);
                if (isReady) {
                    documentsReadyForUser.push(doc);
                }
            }
        }
        this.logger.log(`Found ${documentsReadyForUser.length} documents ready for user ID: ${userId}`);
        return documentsReadyForUser;
    }
    async getDownloadStream(id, userId, userRole) {
        this.logger.log(`Requesting download stream for document ID: ${id} by user ID: ${userId}`);
        const document = await this.findOne(id, userId, userRole);
        try {
            const stream = await this.minioService.downloadFile(document.storagePath);
            this.logger.log(`Retrieved download stream for path: ${document.storagePath}`);
            await this.auditLogService.logAction(userId, 'DOWNLOAD_DOCUMENT', 'Document', document.id);
            return {
                stream: stream,
                filename: document.originalFilename,
                mimetype: document.mimeType,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get download stream for document ID ${id}: ${error.message}`, error.stack);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(`Falha ao baixar o documento: ${error.message}`);
        }
    }
    async update(id, updateDto, userId, userRole) {
        this.logger.log(`Updating document ID: ${id} by user ID: ${userId}`);
        const document = await this.findOne(id, userId, userRole);
        if (document.owner.id !== userId && userRole !== user_entity_1.UserRole.ADMIN) {
            this.logger.warn(`User ID ${userId} is not owner or admin, cannot update document ID ${id}.`);
            throw new common_1.ForbiddenException('Você não tem permissão para atualizar este documento.');
        }
        let statusChanged = false;
        let originalStatus = document.status;
        let changes = {};
        if (updateDto.status && updateDto.status !== document.status) {
            if (updateDto.status === document_entity_1.DocumentStatus.CANCELED) {
                if (document.status === document_entity_1.DocumentStatus.SIGNING || document.status === document_entity_1.DocumentStatus.PENDING) {
                    document.status = document_entity_1.DocumentStatus.CANCELED;
                    statusChanged = true;
                    changes['status'] = { from: originalStatus, to: document_entity_1.DocumentStatus.CANCELED };
                }
                else {
                    throw new common_1.BadRequestException(`Não é possível cancelar um documento com status ${document.status}.`);
                }
            }
            else if (userRole !== user_entity_1.UserRole.ADMIN) {
                this.logger.warn(`User ID ${userId} attempted forbidden status change on doc ID ${id} to ${updateDto.status}.`);
                throw new common_1.ForbiddenException('Não é permitido alterar o status do documento para este valor.');
            }
            else {
                document.status = updateDto.status;
                statusChanged = true;
                changes['status'] = { from: originalStatus, to: updateDto.status };
            }
        }
        if (updateDto.title && updateDto.title !== document.title)
            changes['title'] = { from: document.title, to: updateDto.title };
        if (updateDto.description && updateDto.description !== document.description)
            changes['description'] = { from: document.description, to: updateDto.description };
        this.documentRepository.merge(document, updateDto);
        const updatedDocument = await this.documentRepository.save(document);
        this.logger.log(`Document ID: ${id} updated successfully.`);
        if (Object.keys(changes).length > 0) {
            const action = statusChanged && updatedDocument.status === document_entity_1.DocumentStatus.CANCELED ? 'CANCEL_DOCUMENT' : 'UPDATE_DOCUMENT';
            await this.auditLogService.logAction(userId, action, 'Document', updatedDocument.id, { changes });
        }
        if (statusChanged && updatedDocument.status === document_entity_1.DocumentStatus.CANCELED) {
            this.notificationService.notifyDocumentCancelled(updatedDocument);
        }
        return updatedDocument;
    }
    async delete(id, userId, userRole) {
        this.logger.log(`Deleting document ID: ${id} by user ID: ${userId}`);
        const document = await this.findOne(id, userId, userRole);
        if (document.owner.id !== userId && userRole !== user_entity_1.UserRole.ADMIN) {
            this.logger.warn(`User ID ${userId} is not owner or admin, cannot delete document ID ${id}.`);
            throw new common_1.ForbiddenException('Você não tem permissão para excluir este documento.');
        }
        const storagePath = document.storagePath;
        try {
            await this.documentRepository.delete(id);
            this.logger.log(`Document ID: ${id} deleted successfully from database.`);
            await this.auditLogService.logAction(userId, 'DELETE_DOCUMENT', 'Document', id, { title: document.title });
            try {
                await this.minioService.deleteFile(storagePath);
                this.logger.log(`File deleted from MinIO path: ${storagePath}`);
            }
            catch (minioError) {
                this.logger.error(`Failed to delete file from MinIO path ${storagePath}: ${minioError.message}`, minioError.stack);
            }
        }
        catch (error) {
            this.logger.error(`Failed to delete document ID ${id} from database: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException(`Falha ao excluir documento: ${error.message}`);
        }
    }
    async isDocumentReadyForUser(documentId, userId) {
        const nextSignatories = await this.findNextSignatories(documentId);
        return nextSignatories.some(sig => sig.user.id === userId);
    }
    async findNextSignatories(documentId) {
        const document = await this.documentRepository.findOne({
            where: { id: documentId },
            relations: ['signatories', 'signatories.user']
        });
        if (!document || document.status !== document_entity_1.DocumentStatus.SIGNING) {
            return [];
        }
        const pendingSignatories = document.signatories
            .filter(s => s.status === document_signatory_entity_1.SignatoryStatus.PENDING)
            .sort((a, b) => a.order - b.order);
        if (pendingSignatories.length === 0) {
            return [];
        }
        const lowestOrder = pendingSignatories[0].order;
        if (lowestOrder === 0) {
            return pendingSignatories.filter(s => s.order === 0);
        }
        else {
            return pendingSignatories.filter(s => s.order === lowestOrder);
        }
    }
    async updateSignatoryStatus(documentId, userId, newStatus, rejectionReason) {
        this.logger.log(`Updating signatory status for doc ID ${documentId}, user ID ${userId} to ${newStatus}`);
        const signatory = await this.signatoryRepository.findOne({
            where: { document: { id: documentId }, user: { id: userId } },
            relations: ['document', 'document.owner', 'user']
        });
        if (!signatory) {
            throw new common_1.NotFoundException(`Signatário (usuário ${userId}) não encontrado para o documento ${documentId}.`);
        }
        if (!signatory.document) {
            throw new common_1.InternalServerErrorException(`Document relation missing for signatory ${signatory.id}`);
        }
        if (!signatory.user) {
            throw new common_1.InternalServerErrorException(`User relation missing for signatory ${signatory.id}`);
        }
        if (signatory.status !== document_signatory_entity_1.SignatoryStatus.PENDING) {
            throw new common_1.BadRequestException(`Signatário (usuário ${userId}) não está com status PENDENTE.`);
        }
        const isReady = await this.isDocumentReadyForUser(documentId, userId);
        if (!isReady) {
            throw new common_1.ForbiddenException(`Não é a vez deste usuário (${userId}) assinar o documento ${documentId}.`);
        }
        signatory.status = newStatus;
        if (newStatus === document_signatory_entity_1.SignatoryStatus.SIGNED) {
            signatory.signedAt = new Date();
            signatory.rejectionReason = null;
        }
        else if (newStatus === document_signatory_entity_1.SignatoryStatus.REJECTED) {
            signatory.rejectionReason = rejectionReason || 'Motivo não especificado';
            signatory.signedAt = null;
            signatory.document.status = document_entity_1.DocumentStatus.REJECTED;
            await this.documentRepository.save(signatory.document);
        }
        await this.signatoryRepository.save(signatory);
        this.logger.log(`Signatory status updated for user ${userId}, doc ${documentId}.`);
        const action = newStatus === document_signatory_entity_1.SignatoryStatus.SIGNED ? 'SIGN_DOCUMENT' : 'REJECT_DOCUMENT';
        await this.auditLogService.logAction(userId, action, 'DocumentSignatory', signatory.id, { documentId: documentId, reason: rejectionReason });
        if (newStatus === document_signatory_entity_1.SignatoryStatus.SIGNED) {
            const isComplete = await this.checkDocumentCompletion(documentId);
            if (!isComplete) {
                await this.notifyNextSignatories(documentId);
            }
        }
        else if (newStatus === document_signatory_entity_1.SignatoryStatus.REJECTED) {
            const fullDocument = await this.documentRepository.findOne({ where: { id: documentId }, relations: ['owner'] });
            if (fullDocument && signatory.user) {
                this.notificationService.notifyDocumentRejected(fullDocument, signatory.user, signatory.rejectionReason);
            }
        }
    }
    async checkDocumentCompletion(documentId) {
        this.logger.log(`Checking completion status for document ID: ${documentId}`);
        const document = await this.documentRepository.findOne({
            where: { id: documentId },
            relations: ['signatories', 'owner']
        });
        if (!document || document.status !== document_entity_1.DocumentStatus.SIGNING) {
            this.logger.log(`Document ID ${documentId} not found or not in SIGNING state.`);
            return false;
        }
        const allSigned = document.signatories.every(s => s.status === document_signatory_entity_1.SignatoryStatus.SIGNED);
        if (allSigned) {
            this.logger.log(`Document ID ${documentId} is now complete.`);
            document.status = document_entity_1.DocumentStatus.COMPLETED;
            await this.documentRepository.save(document);
            await this.auditLogService.logAction(null, 'COMPLETE_DOCUMENT', 'Document', document.id);
            this.notificationService.notifyDocumentCompleted(document);
            return true;
        }
        else {
            this.logger.log(`Document ID ${documentId} is not yet complete.`);
            return false;
        }
    }
    async notifyNextSignatories(documentId) {
        this.logger.log(`Determining next signatories to notify for document ID: ${documentId}`);
        const nextSignatories = await this.findNextSignatories(documentId);
        if (nextSignatories.length > 0) {
            this.logger.log(`Found ${nextSignatories.length} next signatories for document ID: ${documentId}. Notifying...`);
            const signatoriesWithDoc = await this.signatoryRepository.find({
                where: { id: (0, typeorm_2.In)(nextSignatories.map(s => s.id)) },
                relations: ['document', 'user']
            });
            this.notificationService.notifySignatoriesDocumentReady(signatoriesWithDoc);
        }
        else {
            this.logger.log(`No pending signatories found to notify for document ID: ${documentId}. Checking completion again just in case.`);
            await this.checkDocumentCompletion(documentId);
        }
    }
};
exports.DocumentService = DocumentService;
exports.DocumentService = DocumentService = DocumentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(document_entity_1.Document)),
    __param(1, (0, typeorm_1.InjectRepository)(document_signatory_entity_1.DocumentSignatory)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => notification_service_1.NotificationService))),
    __param(5, (0, common_1.Inject)((0, common_1.forwardRef)(() => audit_log_service_1.AuditLogService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        minio_service_1.MinioService,
        notification_service_1.NotificationService,
        audit_log_service_1.AuditLogService,
        pdf_validation_service_1.PdfValidationService])
], DocumentService);
//# sourceMappingURL=document.service.js.map