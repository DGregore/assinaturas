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
var MinioService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinioService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const Minio = require("minio");
let MinioService = MinioService_1 = class MinioService {
    configService;
    logger = new common_1.Logger(MinioService_1.name);
    minioClient;
    bucketName;
    constructor(configService) {
        this.configService = configService;
        this.bucketName = this.configService.get('MINIO_BUCKET_NAME', 'signatures');
        const endpoint = this.configService.get('MINIO_ENDPOINT');
        const port = this.configService.get('MINIO_PORT');
        const accessKey = this.configService.get('MINIO_ACCESS_KEY');
        const secretKey = this.configService.get('MINIO_SECRET_KEY');
        const useSSL = this.configService.get('MINIO_USE_SSL', 'false') === 'true';
        if (!endpoint || !port || !accessKey || !secretKey) {
            this.logger.error('MinIO configuration is incomplete. Check .env file.');
            throw new common_1.InternalServerErrorException('MinIO configuration is incomplete.');
        }
        this.minioClient = new Minio.Client({
            endPoint: endpoint,
            port: port,
            useSSL: useSSL,
            accessKey: accessKey,
            secretKey: secretKey,
        });
        this.ensureBucketExists();
    }
    async ensureBucketExists() {
        try {
            this.logger.log(`Checking if bucket "${this.bucketName}" exists...`);
            const bucketExists = await this.minioClient.bucketExists(this.bucketName);
            if (!bucketExists) {
                this.logger.log(`Bucket "${this.bucketName}" does not exist. Creating...`);
                await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
                this.logger.log(`Bucket "${this.bucketName}" created successfully.`);
            }
            else {
                this.logger.log(`Bucket "${this.bucketName}" already exists.`);
            }
        }
        catch (err) {
            this.logger.error(`Error checking or creating bucket "${this.bucketName}":`, err);
            throw new common_1.InternalServerErrorException(`Failed to ensure MinIO bucket exists: ${err.message}`);
        }
    }
    async uploadFile(fileName, fileBuffer, mimetype) {
        const metaData = {
            'Content-Type': mimetype,
        };
        try {
            this.logger.log(`Uploading file "${fileName}" (size: ${fileBuffer.length} bytes) to bucket "${this.bucketName}"...`);
            const result = await this.minioClient.putObject(this.bucketName, fileName, fileBuffer, fileBuffer.length, metaData);
            this.logger.log(`File "${fileName}" uploaded successfully. ETag: ${result.etag}, VersionID: ${result.versionId}`);
            return result;
        }
        catch (err) {
            this.logger.error(`Error uploading file "${fileName}" to bucket "${this.bucketName}":`, err);
            throw new common_1.InternalServerErrorException(`Failed to upload file to MinIO: ${err.message}`);
        }
    }
    async downloadFile(fileName) {
        try {
            this.logger.log(`Attempting to download file "${fileName}" from bucket "${this.bucketName}"...`);
            await this.minioClient.statObject(this.bucketName, fileName);
            const stream = await this.minioClient.getObject(this.bucketName, fileName);
            this.logger.log(`Successfully retrieved stream for file "${fileName}".`);
            return stream;
        }
        catch (err) {
            if (err.code === 'NoSuchKey' || err.code === 'NotFound') {
                this.logger.error(`File "${fileName}" not found in bucket "${this.bucketName}".`);
                throw new common_1.NotFoundException(`Arquivo "${fileName}" não encontrado no armazenamento.`);
            }
            this.logger.error(`Error downloading file "${fileName}" from bucket "${this.bucketName}":`, err);
            throw new common_1.InternalServerErrorException(`Falha ao baixar o arquivo do MinIO: ${err.message}`);
        }
    }
    async deleteFile(fileName) {
        try {
            this.logger.log(`Attempting to delete file "${fileName}" from bucket "${this.bucketName}"...`);
            await this.minioClient.removeObject(this.bucketName, fileName);
            this.logger.log(`File "${fileName}" deleted successfully from bucket "${this.bucketName}".`);
        }
        catch (err) {
            this.logger.error(`Error deleting file "${fileName}" from bucket "${this.bucketName}":`, err);
            throw new common_1.InternalServerErrorException(`Falha ao excluir o arquivo do MinIO: ${err.message}`);
        }
    }
};
exports.MinioService = MinioService;
exports.MinioService = MinioService = MinioService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MinioService);
//# sourceMappingURL=minio.service.js.map