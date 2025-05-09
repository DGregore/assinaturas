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
exports.Signature = void 0;
const typeorm_1 = require("typeorm");
const document_entity_1 = require("../document/document.entity");
const user_entity_1 = require("../user/user.entity");
let Signature = class Signature {
    id;
    document;
    user;
    signatureData;
    positionData;
    timestamp;
};
exports.Signature = Signature;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Signature.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => document_entity_1.Document, (document) => document.signatures, { nullable: false, onDelete: 'CASCADE' }),
    __metadata("design:type", document_entity_1.Document)
], Signature.prototype, "document", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false, eager: false }),
    __metadata("design:type", user_entity_1.User)
], Signature.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Signature.prototype, "signatureData", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Signature.prototype, "positionData", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Signature.prototype, "timestamp", void 0);
exports.Signature = Signature = __decorate([
    (0, typeorm_1.Entity)('signatures'),
    (0, typeorm_1.Index)(["document", "user"])
], Signature);
//# sourceMappingURL=signature.entity.js.map