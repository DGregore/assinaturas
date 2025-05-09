import { Document } from './document.entity';
import { User } from '../user/user.entity';
export declare enum SignatoryStatus {
    PENDING = "PENDING",
    SIGNED = "SIGNED",
    REJECTED = "REJECTED"
}
export declare class DocumentSignatory {
    id: number;
    document: Document;
    user: User;
    order: number;
    status: SignatoryStatus;
    signedAt: Date | null;
    rejectionReason: string | null;
    createdAt: Date;
    updatedAt: Date;
}
