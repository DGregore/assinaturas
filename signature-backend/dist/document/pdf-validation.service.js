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
var PdfValidationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfValidationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
const pdfParse = require("pdf-parse");
let PdfValidationService = PdfValidationService_1 = class PdfValidationService {
    configService;
    logger = new common_1.Logger(PdfValidationService_1.name);
    maxPdfSizeMB;
    maxPdfPages;
    constructor(configService) {
        this.configService = configService;
        this.maxPdfSizeMB = this.configService.get('MAX_PDF_SIZE_MB') || 10;
        this.maxPdfPages = this.configService.get('MAX_PDF_PAGES') || 100;
        try {
            const workerPath = require.resolve('pdfjs-dist/legacy/build/pdf.worker.min.js');
            pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
            this.logger.log(`Worker do PDF.js configurado em: ${workerPath}`);
        }
        catch (error) {
            this.logger.error(`Erro ao configurar worker do PDF.js: ${error.message}`, error.stack);
        }
    }
    async validatePdf(buffer) {
        this.logger.log(`Iniciando validação de PDF. Tamanho do buffer: ${buffer.length} bytes`);
        if (!buffer || buffer.length === 0) {
            this.logger.error('Buffer do PDF vazio ou nulo');
            throw new common_1.BadRequestException('O arquivo PDF está vazio ou corrompido');
        }
        const pdfSignature = buffer.slice(0, 4).toString();
        if (pdfSignature !== '%PDF') {
            this.logger.error(`Assinatura de PDF inválida: "${pdfSignature}". Esperado: "%PDF"`);
            throw new common_1.BadRequestException('O arquivo não parece ser um PDF válido (assinatura inválida)');
        }
        const fileSizeMB = buffer.length / (1024 * 1024);
        this.logger.log(`Tamanho do arquivo: ${fileSizeMB.toFixed(2)}MB (limite: ${this.maxPdfSizeMB}MB)`);
        if (fileSizeMB > this.maxPdfSizeMB) {
            this.logger.warn(`Arquivo excede o tamanho máximo permitido: ${fileSizeMB.toFixed(2)}MB > ${this.maxPdfSizeMB}MB`);
            throw new common_1.BadRequestException(`O tamanho do arquivo PDF excede o máximo permitido de ${this.maxPdfSizeMB}MB`);
        }
        try {
            const data = new Uint8Array(buffer);
            this.logger.log('Convertendo buffer para Uint8Array e carregando documento PDF');
            const pdfDocument = await pdfjsLib.getDocument({ data }).promise;
            this.logger.log('Documento PDF carregado com sucesso');
            const numPages = pdfDocument.numPages;
            this.logger.log(`Número de páginas no PDF: ${numPages} (limite: ${this.maxPdfPages})`);
            if (numPages > this.maxPdfPages) {
                this.logger.warn(`PDF excede o número máximo de páginas: ${numPages} > ${this.maxPdfPages}`);
                throw new common_1.BadRequestException(`O PDF tem ${numPages} páginas, excedendo o limite de ${this.maxPdfPages} páginas`);
            }
            this.logger.log('Analisando conteúdo do PDF para extração de texto');
            const dataParsed = await pdfParse(buffer);
            const pdfText = dataParsed.text.toLowerCase();
            this.logger.log(`Texto extraído do PDF: ${pdfText.length} caracteres`);
            this.logger.log('Validação de PDF concluída com sucesso');
            return true;
        }
        catch (error) {
            if (error.name === 'PasswordException' || error.message.includes('password')) {
                this.logger.warn(`PDF protegido por senha: ${error.message}`);
                throw new common_1.BadRequestException('O PDF está protegido por senha');
            }
            if (error.name === 'InvalidPDFException' || error.message.includes('invalid')) {
                this.logger.warn(`PDF inválido ou corrompido: ${error.message}`);
                throw new common_1.BadRequestException('O arquivo não é um PDF válido ou está corrompido');
            }
            this.logger.error(`Erro ao validar PDF: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Erro ao validar o arquivo PDF');
        }
    }
};
exports.PdfValidationService = PdfValidationService;
exports.PdfValidationService = PdfValidationService = PdfValidationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PdfValidationService);
//# sourceMappingURL=pdf-validation.service.js.map