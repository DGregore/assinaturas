import { StreamableFile } from '@nestjs/common';
import { DocumentService } from './document.service';
import { Document } from './document.entity';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Response } from 'express';
export declare class DocumentController {
    private documentService;
    private readonly logger;
    constructor(documentService: DocumentService);
    uploadDocument(body: any, file: Express.Multer.File, req: any): Promise<Document>;
    validateDocument(file: Express.Multer.File): Promise<{
        isValid: boolean;
    }>;
    findAll(req: any): Promise<Document[]>;
    findOne(id: number, req: any): Promise<Document>;
    downloadDocument(id: number, req: any, res: Response): Promise<StreamableFile>;
    update(id: number, updateDto: UpdateDocumentDto, req: any): Promise<Document>;
    delete(id: number, req: any): Promise<void>;
}
