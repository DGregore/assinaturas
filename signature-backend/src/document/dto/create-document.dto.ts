
import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

// DTO for individual signatory information during document creation
class CreateSignatoryDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  @Min(0) // 0 for parallel, >0 for sequential
  order: number;
}

export class CreateDocumentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  // Array of signatories with their order
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSignatoryDto)
  // @Transform(({ value }) => {
  //   // If the value is a string (JSON), try to parse it
  //   if (typeof value === 'string') {
  //     try {
  //       return JSON.parse(value);
  //     } catch (e) {
  //       throw new Error('signatories must be a valid array');
  //     }
  //   }
  //   // If it's already an array, return as is
  //   return value;
  // })
  signatories: CreateSignatoryDto[];
}

// DTO for receiving metadata along with the file upload
// The actual file comes via multipart/form-data
export class UploadDocumentDto extends CreateDocumentDto {}
