import { Repository, FindManyOptions } from 'typeorm';
import { Document } from './document.entity';
import { DocumentSignatory, SignatoryStatus } from './document-signatory.entity';
import { User, UserRole } from '../user/user.entity';
import { MinioService } from './minio.service';
import { PdfValidationService } from './pdf-validation.service';
import { UploadDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { NotificationService } from '../notification/notification.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { Readable } from 'stream';
export declare class DocumentService {
    private documentRepository;
    private signatoryRepository;
    private userRepository;
    private minioService;
    private notificationService;
    private auditLogService;
    private pdfValidationService;
    private readonly logger;
    constructor(documentRepository: Repository<Document>, signatoryRepository: Repository<DocumentSignatory>, userRepository: Repository<User>, minioService: MinioService, notificationService: NotificationService, auditLogService: AuditLogService, pdfValidationService: PdfValidationService);
    validateDocument(file: Express.Multer.File): Promise<boolean>;
    create(uploadDto: UploadDocumentDto, file: Express.Multer.File, ownerId: number): Promise<Document>;
    findAll(options?: FindManyOptions<Document>): Promise<Document[]>;
    findOne(id: number, userId: number, userRole: UserRole): Promise<Document>;
    findPendingForUser(userId: number): Promise<Document[]>;
    getDownloadStream(id: number, userId: number, userRole: UserRole): Promise<{
        stream: Readable;
        filename: string;
        mimetype: string;
    }>;
    update(id: number, updateDto: UpdateDocumentDto, userId: number, userRole: UserRole): Promise<Document>;
    delete(id: number, userId: number, userRole: UserRole): Promise<void>;
    isDocumentReadyForUser(documentId: number, userId: number): Promise<boolean>;
    findNextSignatories(documentId: number): Promise<DocumentSignatory[]>;
    updateSignatoryStatus(documentId: number, userId: number, newStatus: SignatoryStatus, rejectionReason?: string | null): Promise<void>;
    checkDocumentCompletion(documentId: number): Promise<boolean>;
    notifyNextSignatories(documentId: number): Promise<void>;
}
