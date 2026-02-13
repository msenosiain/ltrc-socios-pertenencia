import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Member, MemberDocument } from './entities/member.entity';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { GoogleAppsScriptService } from './google-apps-script.service';
import { GridFSBucket, ObjectId } from 'mongodb';

interface FileUpload {
  originalname: string;
  buffer: Buffer;
}

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);
  private gridFSBucket: GridFSBucket;

  constructor(
    @InjectModel(Member.name) private readonly memberModel: Model<MemberDocument>,
    @InjectConnection() private readonly mongoConnection: Connection,
    private readonly googleAppsScriptService: GoogleAppsScriptService,
  ) {
    this.initializeGridFS();
  }

  private initializeGridFS() {
    this.gridFSBucket = new GridFSBucket(this.mongoConnection.getClient().db(), {
      bucketName: 'memberDocuments',
    });
  }

  async create(createMemberDto: CreateMemberDto, file?: FileUpload) {
    try {
      let documentImageFileId = null;
      let documentImageFileName = null;

      // Save document image to GridFS if exists
      if (file) {
        const fileName = `member-doc-${Date.now()}-${file.originalname}`;
        const uploadStream = this.gridFSBucket.openUploadStream(fileName, {
          metadata: {
            documentNumber: createMemberDto.documentNumber,
            uploadedAt: new Date(),
          },
        });

        await new Promise((resolve, reject) => {
          uploadStream.on('finish', () => {
            documentImageFileId = uploadStream.id;
            documentImageFileName = fileName;
            resolve(null);
          });
          uploadStream.on('error', reject);
          uploadStream.write(file.buffer);
          uploadStream.end();
        });
      }

      const member = new this.memberModel({
        ...createMemberDto,
        documentImageFileId,
        documentImageFileName,
      });

      const savedMember = await member.save();

      // Send data to Google Sheets asynchronously (non-blocking)
      this.sendToGoogleSheets(savedMember).catch((error) => {
        this.logger.error(`Failed to update Google Sheet: ${error.message}`);
      });

      return savedMember;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(
          `Document number ${createMemberDto.documentNumber} is already registered`,
        );
      }
      throw error;
    }
  }

  private async sendToGoogleSheets(member: MemberDocument): Promise<void> {
    try {
      const documentImageLink = member.documentImageFileId
        ? `${process.env.API_URL || 'http://localhost:3000'}/api/members/image/${member.documentImageFileId}`
        : 'N/A';

      const memberDataForSheet = {
        // Member data
        firstName: member.firstName,
        lastName: member.lastName,
        documentNumber: member.documentNumber,
        birthDate: new Date(member.birthDate).toLocaleDateString('es-AR'),
        documentImageLink,
        // Card holder data
        cardHolderFirstName: member.cardHolderFirstName,
        cardHolderLastName: member.cardHolderLastName,
        cardHolderDocumentNumber: member.cardHolderDocumentNumber,
        creditCardNumber: member.creditCardNumber,
        creditCardExpirationDate: member.creditCardExpirationDate,
        createdAt: new Date(member.createdAt).toLocaleString('es-AR'),
      };

      this.logger.log(`Sending to Google Sheets: ${JSON.stringify(memberDataForSheet)}`);

      await this.googleAppsScriptService.appendMemberToSheet(memberDataForSheet);
      this.logger.log(`Member ${member.documentNumber} added to Google Sheet`);
    } catch (error) {
      this.logger.error(`Error sending to Google Apps Script: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll() {
    return await this.memberModel.find().exec();
  }

  async findOne(id: string) {
    const member = await this.memberModel.findById(id).exec();
    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }
    return member;
  }

  async findByDocumentNumber(documentNumber: string) {
    const member = await this.memberModel.findOne({ documentNumber }).exec();
    if (!member) {
      throw new NotFoundException(
        `Member with document number ${documentNumber} not found`,
      );
    }
    return member;
  }

  /**
   * Validar que un miembro existe en Google Sheets
   * Útil para auditoría y sincronización de datos
   */
  async validateMemberInSheet(documentNumber: string): Promise<boolean> {
    const memberInSheet =
      await this.googleAppsScriptService.findMemberByDocumentNumber(
        documentNumber,
      );
    return memberInSheet !== null;
  }

  async getDocumentImage(fileId: string) {
    try {
      const objectId = new ObjectId(fileId);
      return this.gridFSBucket.openDownloadStream(objectId);
    } catch {
      throw new NotFoundException(`Document image not found`);
    }
  }

  async update(id: string, updateMemberDto: UpdateMemberDto, file?: FileUpload) {
    const member = await this.memberModel.findById(id).exec();
    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    let documentImageFileId = member.documentImageFileId;
    let documentImageFileName = member.documentImageFileName;

    // Save new document image to GridFS if provided
    if (file) {
      // Delete old file if exists
      if (member.documentImageFileId) {
        try {
          await this.gridFSBucket.delete(member.documentImageFileId);
        } catch (error) {
          console.error(`Error deleting old file: ${error.message}`);
        }
      }

      // Upload new file
      const fileName = `member-doc-${Date.now()}-${file.originalname}`;
      const uploadStream = this.gridFSBucket.openUploadStream(fileName, {
        metadata: {
          documentNumber: updateMemberDto.documentNumber || member.documentNumber,
          uploadedAt: new Date(),
        },
      });

      await new Promise((resolve, reject) => {
        uploadStream.on('finish', () => {
          documentImageFileId = uploadStream.id;
          documentImageFileName = fileName;
          resolve(null);
        });
        uploadStream.on('error', reject);
        uploadStream.write(file.buffer);
        uploadStream.end();
      });
    }

    const updateData = {
      ...updateMemberDto,
      documentImageFileId,
      documentImageFileName,
      updatedAt: new Date(),
    };

    return await this.memberModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    ).exec();
  }

  async remove(id: string) {
    const member = await this.memberModel.findByIdAndDelete(id).exec();
    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    // Delete document image from GridFS if exists
    if (member.documentImageFileId) {
      try {
        await this.gridFSBucket.delete(member.documentImageFileId);
      } catch (error) {
        console.error(`Error deleting file from GridFS: ${error.message}`);
      }
    }

    return member;
  }
}
