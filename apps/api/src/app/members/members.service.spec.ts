import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from './members.service';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Member } from './entities/member.entity';
import { GoogleAppsScriptService } from './google-apps-script.service';
import { NotFoundException } from '@nestjs/common';

describe('MembersService', () => {
  let service: MembersService;
  let mockMemberModel: any;
  let mockGoogleAppsScriptService: any;

  const mockMember = {
    _id: '507f1f77bcf86cd799439011',
    firstName: 'John',
    lastName: 'Doe',
    documentNumber: '12345678',
    birthDate: new Date('1990-01-01'),
    documentImageFileId: null,
    documentImageFileName: null,
    cardHolder: {
      firstName: 'Jane',
      lastName: 'Doe',
      documentNumber: '87654321',
      creditCardNumber: '4111111111111111',
      creditCardExpirationDate: '12/25',
    },
    createdAt: new Date(),
  };

  const mockDb = {
    collection: jest.fn().mockReturnValue({
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      }),
      createIndex: jest.fn().mockResolvedValue({}),
    }),
  };

  const mockConnection = {
    getClient: jest.fn().mockReturnValue({
      db: jest.fn().mockReturnValue(mockDb),
    }),
  };

  beforeEach(async () => {
    mockMemberModel = function(data: any) {
      return {
        ...data,
        save: jest.fn().mockResolvedValue({ ...data, _id: '507f1f77bcf86cd799439011', createdAt: new Date() }),
      };
    };
    mockMemberModel.find = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([mockMember]),
    });
    mockMemberModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockMember),
    });
    mockMemberModel.findOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockMember),
    });
    mockMemberModel.findByIdAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockMember),
    });
    mockMemberModel.findByIdAndDelete = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockMember),
    });

    mockGoogleAppsScriptService = {
      appendMemberToSheet: jest.fn().mockResolvedValue(true),
      findMemberByDocumentNumber: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: getModelToken(Member.name),
          useValue: mockMemberModel,
        },
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
        {
          provide: GoogleAppsScriptService,
          useValue: mockGoogleAppsScriptService,
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of members', async () => {
      const result = await service.findAll();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a member by id', async () => {
      const result = await service.findOne('507f1f77bcf86cd799439011');
      expect(result).toBeDefined();
      expect(result.firstName).toBe('John');
    });

    it('should throw NotFoundException if member not found', async () => {
      mockMemberModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByDocumentNumber', () => {
    it('should return a member by document number', async () => {
      const result = await service.findByDocumentNumber('12345678');
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if member not found', async () => {
      mockMemberModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findByDocumentNumber('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a member', async () => {
      const result = await service.remove('507f1f77bcf86cd799439011');
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if member not found', async () => {
      mockMemberModel.findByIdAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getDocumentImage', () => {

    it('should throw NotFoundException for invalid fileId', async () => {
      await expect(service.getDocumentImage('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateMemberInSheet', () => {
    it('should return false when member not in sheet', async () => {
      mockGoogleAppsScriptService.findMemberByDocumentNumber.mockResolvedValue(null);
      const result = await service.validateMemberInSheet('12345678');
      expect(result).toBe(false);
    });

    it('should return true when member is in sheet', async () => {
      mockGoogleAppsScriptService.findMemberByDocumentNumber.mockResolvedValue(mockMember);
      const result = await service.validateMemberInSheet('12345678');
      expect(result).toBe(true);
    });
  });
});
