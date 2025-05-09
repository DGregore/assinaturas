import { Document } from '../document/document.entity';
import { User } from '../user/user.entity';
export declare class Signature {
    id: number;
    document: Document;
    user: User;
    signatureData: string;
    positionData: {
        page: number;
        x: number;
        y: number;
    } | null;
    timestamp: Date;
}
