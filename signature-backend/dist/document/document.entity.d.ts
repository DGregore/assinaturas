import { User } from '../user/user.entity';
export declare enum DocumentStatus {
    PENDING = "PENDING",
    SIGNING = "SIGNING",
    COMPLETED = "COMPLETED",
    CANCELED = "CANCELED",
    REJECTED = "REJECTED"
}
export declare class Document {
    id: number;
    title: string;
    description: string;
    originalFilename: string;
    storagePath: string;
    mimeType: string;
    size: number;
    status: DocumentStatus;
    owner: User;
    signatories: DocumentSignatory[];
    signatures: Signature[];
    createdAt: Date;
    updatedAt: Date;
}
import { DocumentSignatory } from './document-signatory.entity';
import { Signature } from '../signature/signature.entity';
