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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentSignatory = exports.SignatoryStatus = void 0;
const typeorm_1 = require("typeorm");
const document_entity_1 = require("./document.entity");
const user_entity_1 = require("../user/user.entity");
var SignatoryStatus;
(function (SignatoryStatus) {
    SignatoryStatus["PENDING"] = "PENDING";
    SignatoryStatus["SIGNED"] = "SIGNED";
    SignatoryStatus["REJECTED"] = "REJECTED";
})(SignatoryStatus || (exports.SignatoryStatus = SignatoryStatus = {}));
let DocumentSignatory = class DocumentSignatory {
    id;
    document;
    user;
    order;
    status;
    signedAt;
    rejectionReason;
    createdAt;
    updatedAt;
};
exports.DocumentSignatory = DocumentSignatory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DocumentSignatory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => document_entity_1.Document, (document) => document.signatories, { nullable: false, onDelete: 'CASCADE' }),
    __metadata("design:type", document_entity_1.Document)
], DocumentSignatory.prototype, "document", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false, eager: false }),
    __metadata("design:type", user_entity_1.User)
], DocumentSignatory.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], DocumentSignatory.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SignatoryStatus,
        default: SignatoryStatus.PENDING,
    }),
    __metadata("design:type", String)
], DocumentSignatory.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], DocumentSignatory.prototype, "signedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], DocumentSignatory.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DocumentSignatory.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], DocumentSignatory.prototype, "updatedAt", void 0);
exports.DocumentSignatory = DocumentSignatory = __decorate([
    (0, typeorm_1.Entity)('document_signatories'),
    (0, typeorm_1.Index)(["document", "user"], { unique: true }),
    (0, typeorm_1.Index)(["document", "order"])
], DocumentSignatory);
//# sourceMappingURL=document-signatory.entity.js.map