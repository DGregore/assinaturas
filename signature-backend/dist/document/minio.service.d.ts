import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
export declare class MinioService {
    private configService;
    private readonly logger;
    private readonly minioClient;
    private readonly bucketName;
    constructor(configService: ConfigService);
    private ensureBucketExists;
    uploadFile(fileName: string, fileBuffer: Buffer, mimetype: string): Promise<{
        etag: string;
        versionId?: string | null;
    }>;
    downloadFile(fileName: string): Promise<Readable>;
    deleteFile(fileName: string): Promise<void>;
}
