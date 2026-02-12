import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from './members.service';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Member } from './entities/member.entity';
import { GoogleAppsScriptService } from './google-apps-script.service';

describe('MembersService', () => {
  let service: MembersService;

  const mockMemberModel = {
    find: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    }),
    findById: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
    create: jest.fn(),
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

  const mockGoogleAppsScriptService = {
    addMemberToSheet: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
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
});
