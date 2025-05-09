"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const document_entity_1 = require("./document.entity");
const document_signatory_entity_1 = require("./document-signatory.entity");
const document_controller_1 = require("./document.controller");
const document_service_1 = require("./document.service");
const minio_service_1 = require("./minio.service");
const pdf_validation_service_1 = require("./pdf-validation.service");
const notification_module_1 = require("../notification/notification.module");
const audit_log_module_1 = require("../audit-log/audit-log.module");
const user_entity_1 = require("../user/user.entity");
let DocumentModule = class DocumentModule {
};
exports.DocumentModule = DocumentModule;
exports.DocumentModule = DocumentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([document_entity_1.Document, document_signatory_entity_1.DocumentSignatory, user_entity_1.User]),
            notification_module_1.NotificationModule,
            audit_log_module_1.AuditLogModule
        ],
        controllers: [document_controller_1.DocumentController],
        providers: [document_service_1.DocumentService, minio_service_1.MinioService, pdf_validation_service_1.PdfValidationService],
        exports: [document_service_1.DocumentService, minio_service_1.MinioService, pdf_validation_service_1.PdfValidationService]
    })
], DocumentModule);
//# sourceMappingURL=document.module.js.map