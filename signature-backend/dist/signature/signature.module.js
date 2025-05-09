"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignatureModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const signature_entity_1 = require("./signature.entity");
const signature_controller_1 = require("./signature.controller");
const signature_service_1 = require("./signature.service");
const document_module_1 = require("../document/document.module");
const notification_module_1 = require("../notification/notification.module");
const audit_log_module_1 = require("../audit-log/audit-log.module");
const user_module_1 = require("../user/user.module");
const document_signatory_entity_1 = require("../document/document-signatory.entity");
let SignatureModule = class SignatureModule {
};
exports.SignatureModule = SignatureModule;
exports.SignatureModule = SignatureModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([signature_entity_1.Signature, document_signatory_entity_1.DocumentSignatory]),
            document_module_1.DocumentModule,
            notification_module_1.NotificationModule,
            audit_log_module_1.AuditLogModule,
            user_module_1.UserModule
        ],
        controllers: [signature_controller_1.SignatureController],
        providers: [signature_service_1.SignatureService],
        exports: [signature_service_1.SignatureService]
    })
], SignatureModule);
//# sourceMappingURL=signature.module.js.map