import { Repository } from 'typeorm';
import { Signature } from './signature.entity';
import { DocumentService } from '../document/document.service';
import { DocumentSignatory } from '../document/document-signatory.entity';
import { CreateSignatureDto } from './dto/create-signature.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
export declare class SignatureService {
    private signatureRepository;
    private signatoryRepository;
    private documentService;
    private auditLogService;
    private readonly logger;
    constructor(signatureRepository: Repository<Signature>, signatoryRepository: Repository<DocumentSignatory>, documentService: DocumentService, auditLogService: AuditLogService);
    create(createDto: CreateSignatureDto, userId: number): Promise<Signature>;
}
