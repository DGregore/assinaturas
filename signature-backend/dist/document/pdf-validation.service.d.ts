import { ConfigService } from '@nestjs/config';
export declare class PdfValidationService {
    private readonly configService;
    private readonly logger;
    private readonly maxPdfSizeMB;
    private readonly maxPdfPages;
    constructor(configService: ConfigService);
    validatePdf(buffer: Buffer): Promise<boolean>;
}
