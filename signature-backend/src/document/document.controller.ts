import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Request,
  ParseIntPipe,
  Res,
  StreamableFile,
  HttpStatus,
  HttpCode,
  Logger,
  ParseFilePipe,
  FileTypeValidator,
  BadRequestException,
  // MaxFileSizeValidator, // Optional: Add back if needed
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { Document } from './document.entity';
import { UploadDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Adjust path if needed
import { RolesGuard } from '../auth/guards/roles.guard'; // Adjust path if needed
import { Roles } from '../auth/decorators/roles.decorator'; // Adjust path if needed
import { UserRole } from '../user/user.entity'; // Adjust path if needed
import { Express, Response } from 'express'; // Import Express and Response
// import { Multer } from 'multer'; // Not explicitly needed here

@Controller('api/documents')
@UseGuards(JwtAuthGuard) // Apply JWT guard to all routes in this controller
export class DocumentController {
  private readonly logger = new Logger(DocumentController.name);

  constructor(private documentService: DocumentService) {}

  // --- Upload Document --- //
    @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Body() body: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: 'application/pdf' })],
      }),
    )
    file: Express.Multer.File,
    @Request() req: any,
  ): Promise<Document> {
    const uploadDto: UploadDocumentDto = {
      title: body.title,
      description: body.description,
      signatories: JSON.parse(body.signatories),
    };

    return this.documentService.create(uploadDto, file, req.user.userId);
  }
  @Post('validate')
  @UseInterceptors(FileInterceptor('file'))
  async validateDocument(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }
    
    await this.documentService.validateDocument(file);
    return { isValid: true };
  }
  // --- List Documents --- //
  @Get()
  // @Roles(UserRole.ADMIN, UserRole.USER) // Allow all authenticated users (permissions checked in service)
  async findAll(@Request() req: any): Promise<Document[]> {
    const userId = req.user.userId;
    const userRole = req.user.role;
    this.logger.log(`User ID ${userId} (Role: ${userRole}) listing documents`);
    // TODO: Add query params for filtering/pagination and pass to service
    // For now, service might return all or implement basic filtering
    return this.documentService.findAll(); // Service needs permission logic
  }

  // --- Get Document Details --- //
  @Get(':id')
  // @Roles(UserRole.ADMIN, UserRole.USER) // Permissions checked in service
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<Document> {
    const userId = req.user.userId;
    const userRole = req.user.role;
    this.logger.log(`User ID ${userId} (Role: ${userRole}) getting details for document ID: ${id}`);
    return this.documentService.findOne(id, userId, userRole);
  }

  // --- Download Document --- //
  @Get(':id/download')
  // @Roles(UserRole.ADMIN, UserRole.USER) // Permissions checked in service
  async downloadDocument(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Res({ passthrough: true }) res: Response, // Inject Response, passthrough allows manual header setting
  ): Promise<StreamableFile> {
    const userId = req.user.userId;
    const userRole = req.user.role;
    this.logger.log(`User ID ${userId} (Role: ${userRole}) downloading document ID: ${id}`);

    const { stream, filename, mimetype } = await this.documentService.getDownloadStream(id, userId, userRole);

    // Set headers for download
    res.setHeader('Content-Type', mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return new StreamableFile(stream);
  }

  // --- Update Document --- //
  @Put(':id')
  // @Roles(UserRole.ADMIN) // Example: Only allow Admins or Owner (checked in service)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDocumentDto,
    @Request() req: any,
  ): Promise<Document> {
    const userId = req.user.userId;
    const userRole = req.user.role;
    this.logger.log(`User ID ${userId} (Role: ${userRole}) updating document ID: ${id}`);
    return this.documentService.update(id, updateDto, userId, userRole);
  }

  // --- Delete Document --- //
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  // @Roles(UserRole.ADMIN) // Example: Only allow Admins or Owner (checked in service)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<void> {
    const userId = req.user.userId;
    const userRole = req.user.role;
    this.logger.log(`User ID ${userId} (Role: ${userRole}) deleting document ID: ${id}`);
    return this.documentService.delete(id, userId, userRole);
  }
}

