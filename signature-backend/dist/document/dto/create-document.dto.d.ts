declare class CreateSignatoryDto {
    userId: number;
    order: number;
}
export declare class CreateDocumentDto {
    title?: string;
    description?: string;
    signatories: CreateSignatoryDto[];
}
export declare class UploadDocumentDto extends CreateDocumentDto {
}
export {};
