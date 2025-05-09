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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const notification_gateway_1 = require("./notification.gateway");
let NotificationService = NotificationService_1 = class NotificationService {
    notificationsGateway;
    logger = new common_1.Logger(NotificationService_1.name);
    constructor(notificationsGateway) {
        this.notificationsGateway = notificationsGateway;
    }
    notifyUser(userId, event, data) {
        this.logger.log(`Queueing notification event '${event}' for user ID ${userId}`);
        const sent = this.notificationsGateway.sendNotificationToUser(userId, event, data);
        if (!sent) {
            this.logger.warn(`User ID ${userId} not connected, notification '${event}' not sent in real-time.`);
        }
    }
    notifySignatoriesDocumentReady(signatories) {
        if (!signatories || signatories.length === 0) {
            return;
        }
        this.logger.log(`Notifying ${signatories.length} signatories that document ${signatories[0].document?.id} is ready.`);
        signatories.forEach(sig => {
            const userId = sig.user?.id || sig.user;
            if (userId) {
                this.notifyUser(userId, 'documentReadyForSigning', {
                    documentId: sig.document?.id,
                    documentTitle: sig.document?.title || sig.document?.originalFilename,
                    message: `O documento "${sig.document?.title || sig.document?.originalFilename}" está pronto para sua assinatura.`,
                });
            }
        });
    }
    notifyDocumentCompleted(document) {
        this.logger.log(`Notifying parties about completion of document ID ${document.id}`);
        const notificationData = {
            documentId: document.id,
            documentTitle: document.title || document.originalFilename,
            message: `O documento "${document.title || document.originalFilename}" foi assinado por todos.`,
        };
        if (document.owner?.id) {
            this.notifyUser(document.owner.id, 'documentCompleted', notificationData);
        }
    }
    notifyDocumentRejected(document, rejectedBy, reason) {
        this.logger.log(`Notifying parties about rejection of document ID ${document.id} by user ID ${rejectedBy.id}`);
        const notificationData = {
            documentId: document.id,
            documentTitle: document.title || document.originalFilename,
            rejectedBy: rejectedBy.name,
            reason: reason,
            message: `O documento "${document.title || document.originalFilename}" foi rejeitado por ${rejectedBy.name}. Motivo: ${reason || 'Não especificado'}`,
        };
        if (document.owner?.id) {
            this.notifyUser(document.owner.id, 'documentRejected', notificationData);
        }
    }
    notifyDocumentCancelled(document) {
        this.logger.log(`Notifying owner about cancellation of document ID ${document.id}`);
        const notificationData = {
            documentId: document.id,
            documentTitle: document.title || document.originalFilename,
            message: `O fluxo de assinatura do documento "${document.title || document.originalFilename}" foi cancelado.`,
        };
        if (document.owner?.id) {
            this.notifyUser(document.owner.id, 'documentCancelled', notificationData);
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notification_gateway_1.NotificationsGateway])
], NotificationService);
//# sourceMappingURL=notification.service.js.map