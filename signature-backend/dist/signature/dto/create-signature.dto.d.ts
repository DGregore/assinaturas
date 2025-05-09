declare class PositionDataDto {
    page: number;
    x: number;
    y: number;
}
export declare class CreateSignatureDto {
    documentId: number;
    signatureData: string;
    positionData: PositionDataDto;
}
export {};
