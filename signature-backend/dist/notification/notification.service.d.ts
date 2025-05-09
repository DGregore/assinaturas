import { NotificationsGateway } from './notification.gateway';
import { DocumentSignatory } from '../document/document-signatory.entity';
import { Document } from '../document/document.entity';
import { User } from '../user/user.entity';
export declare class NotificationService {
    private readonly notificationsGateway;
    private readonly logger;
    constructor(notificationsGateway: NotificationsGateway);
    notifyUser(userId: number, event: string, data: any): void;
    notifySignatoriesDocumentReady(signatories: DocumentSignatory[]): void;
    notifyDocumentCompleted(document: Document): void;
    notifyDocumentRejected(document: Document, rejectedBy: User, reason?: string | null): void;
    notifyDocumentCancelled(document: Document): void;
}
