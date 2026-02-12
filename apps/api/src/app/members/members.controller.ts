import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { MembersService } from './members.service';
import { CreateMemberDto, FileUpload } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @UseInterceptors(FileInterceptor('documentImage'))
  async create(
    @Body() createMemberDto: CreateMemberDto,
    @UploadedFile() file?: FileUpload,
  ) {
    return await this.membersService.create(createMemberDto, file);
  }

  @Get()
  async findAll() {
    return await this.membersService.findAll();
  }

  @Get('image/:fileId')
  async getDocumentImage(
    @Param('fileId') fileId: string,
    @Res() res: Response,
  ) {
    const stream = await this.membersService.getDocumentImage(fileId);
    stream.pipe(res);
  }

  @Get('document/:documentNumber')
  async findByDocumentNumber(@Param('documentNumber') documentNumber: string) {
    return await this.membersService.findByDocumentNumber(documentNumber);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.membersService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('documentImage'))
  async update(
    @Param('id') id: string,
    @Body() updateMemberDto: UpdateMemberDto,
    @UploadedFile() file?: FileUpload,
  ) {
    return await this.membersService.update(id, updateMemberDto, file);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.membersService.remove(id);
  }
}

