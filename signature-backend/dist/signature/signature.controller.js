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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SignatureController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignatureController = void 0;
const common_1 = require("@nestjs/common");
const signature_service_1 = require("./signature.service");
const create_signature_dto_1 = require("./dto/create-signature.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let SignatureController = SignatureController_1 = class SignatureController {
    signatureService;
    logger = new common_1.Logger(SignatureController_1.name);
    constructor(signatureService) {
        this.signatureService = signatureService;
    }
    async create(createSignatureDto, req) {
        const userId = req.user.userId;
        this.logger.log(`User ID ${userId} submitting signature for document ID: ${createSignatureDto.documentId}`);
        return this.signatureService.create(createSignatureDto, userId);
    }
};
exports.SignatureController = SignatureController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_signature_dto_1.CreateSignatureDto, Object]),
    __metadata("design:returntype", Promise)
], SignatureController.prototype, "create", null);
exports.SignatureController = SignatureController = SignatureController_1 = __decorate([
    (0, common_1.Controller)('api/signatures'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [signature_service_1.SignatureService])
], SignatureController);
//# sourceMappingURL=signature.controller.js.map