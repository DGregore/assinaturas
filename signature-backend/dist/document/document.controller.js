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
var DocumentController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const document_service_1 = require("./document.service");
const update_document_dto_1 = require("./dto/update-document.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let DocumentController = DocumentController_1 = class DocumentController {
    documentService;
    logger = new common_1.Logger(DocumentController_1.name);
    constructor(documentService) {
        this.documentService = documentService;
    }
    async uploadDocument(body, file, req) {
        const uploadDto = {
            title: body.title,
            description: body.description,
            signatories: JSON.parse(body.signatories),
        };
        return this.documentService.create(uploadDto, file, req.user.userId);
    }
    async validateDocument(file) {
        if (!file) {
            throw new common_1.BadRequestException('Nenhum arquivo enviado');
        }
        await this.documentService.validateDocument(file);
        return { isValid: true };
    }
    async findAll(req) {
        const userId = req.user.userId;
        const userRole = req.user.role;
        this.logger.log(`User ID ${userId} (Role: ${userRole}) listing documents`);
        return this.documentService.findAll();
    }
    async findOne(id, req) {
        const userId = req.user.userId;
        const userRole = req.user.role;
        this.logger.log(`User ID ${userId} (Role: ${userRole}) getting details for document ID: ${id}`);
        return this.documentService.findOne(id, userId, userRole);
    }
    async downloadDocument(id, req, res) {
        const userId = req.user.userId;
        const userRole = req.user.role;
        this.logger.log(`User ID ${userId} (Role: ${userRole}) downloading document ID: ${id}`);
        const { stream, filename, mimetype } = await this.documentService.getDownloadStream(id, userId, userRole);
        res.setHeader('Content-Type', mimetype);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return new common_1.StreamableFile(stream);
    }
    async update(id, updateDto, req) {
        const userId = req.user.userId;
        const userRole = req.user.role;
        this.logger.log(`User ID ${userId} (Role: ${userRole}) updating document ID: ${id}`);
        return this.documentService.update(id, updateDto, userId, userRole);
    }
    async delete(id, req) {
        const userId = req.user.userId;
        const userRole = req.user.role;
        this.logger.log(`User ID ${userId} (Role: ${userRole}) deleting document ID: ${id}`);
        return this.documentService.delete(id, userId, userRole);
    }
};
exports.DocumentController = DocumentController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [new common_1.FileTypeValidator({ fileType: 'application/pdf' })],
    }))),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Post)('validate'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "validateDocument", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "downloadDocument", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_document_dto_1.UpdateDocumentDto, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "delete", null);
exports.DocumentController = DocumentController = DocumentController_1 = __decorate([
    (0, common_1.Controller)('api/documents'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [document_service_1.DocumentService])
], DocumentController);
//# sourceMappingURL=document.controller.js.map