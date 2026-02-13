import { Test, TestingModule } from '@nestjs/testing';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { Readable } from 'stream';

describe('MembersController', () => {
  let controller: MembersController;
  let service: MembersService;

  const mockStream = new Readable({
    read() {
      this.push(null);
    },
  });

  const mockMembersService = {
    create: jest.fn().mockResolvedValue({ id: '1' }),
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({}),
    findByDocumentNumber: jest.fn().mockResolvedValue({}),
    getDocumentImage: jest.fn().mockResolvedValue(mockStream),
    update: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [
        {
          provide: MembersService,
          useValue: mockMembersService,
        },
      ],
    }).compile();

    controller = module.get<MembersController>(MembersController);
    service = module.get<MembersService>(MembersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a member', async () => {
      const createMemberDto = {
        firstName: 'John',
        lastName: 'Doe',
        birthDate: '1990-01-01',
        documentNumber: '12345678',
        cardHolderFirstName: 'Jane',
        cardHolderLastName: 'Doe',
        cardHolderDocumentNumber: '87654321',
        creditCardNumber: '4111111111111111',
        creditCardExpirationDate: '12/25',
      };

      const result = await controller.create(createMemberDto);
      expect(result).toEqual({ id: '1' });
      expect(mockMembersService.create).toHaveBeenCalledWith(
        createMemberDto,
        undefined,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of members', async () => {
      const result = await controller.findAll();
      expect(Array.isArray(result)).toBe(true);
      expect(mockMembersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single member by id', async () => {
      const memberId = '507f1f77bcf86cd799439011';
      await controller.findOne(memberId);
      expect(mockMembersService.findOne).toHaveBeenCalledWith(memberId);
    });
  });

  describe('findByDocumentNumber', () => {
    it('should find a member by document number', async () => {
      const documentNumber = '12345678';
      await controller.findByDocumentNumber(documentNumber);
      expect(mockMembersService.findByDocumentNumber).toHaveBeenCalledWith(
        documentNumber,
      );
    });
  });

  describe('getDocumentImage', () => {
    it('should retrieve document image stream', async () => {
      const fileId = '507f1f77bcf86cd799439011';
      const mockRes = {
        on: jest.fn(),
        pipe: jest.fn(),
        set: jest.fn(),
      };

      // Create a fresh mock stream for this test
      const testStream = new Readable({
        read() {
          this.push(null);
        },
      });
      testStream.pipe = jest.fn();

      mockMembersService.getDocumentImage.mockResolvedValueOnce(testStream);

      await controller.getDocumentImage(fileId, mockRes as any);
      expect(mockMembersService.getDocumentImage).toHaveBeenCalledWith(fileId);
    });
  });

  describe('update', () => {
    it('should update a member', async () => {
      const memberId = '507f1f77bcf86cd799439011';
      const updateMemberDto = { firstName: 'Updated' };

      await controller.update(memberId, updateMemberDto);
      expect(mockMembersService.update).toHaveBeenCalledWith(
        memberId,
        updateMemberDto,
        undefined,
      );
    });

    it('should update a member with file', async () => {
      const memberId = '507f1f77bcf86cd799439011';
      const updateMemberDto = { firstName: 'Updated' };
      const mockFile = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
      };

      await controller.update(memberId, updateMemberDto, mockFile as any);
      expect(mockMembersService.update).toHaveBeenCalledWith(
        memberId,
        updateMemberDto,
        mockFile,
      );
    });
  });

  describe('remove', () => {
    it('should remove a member', async () => {
      const memberId = '507f1f77bcf86cd799439011';

      await controller.remove(memberId);
      expect(mockMembersService.remove).toHaveBeenCalledWith(memberId);
    });
  });

  describe('create with file', () => {
    it('should create a member with document image', async () => {
      const createMemberDto = {
        firstName: 'John',
        lastName: 'Doe',
        birthDate: '1990-01-01',
        documentNumber: '12345678',
        cardHolderFirstName: 'Jane',
        cardHolderLastName: 'Doe',
        cardHolderDocumentNumber: '87654321',
        creditCardNumber: '4111111111111111',
        creditCardExpirationDate: '12/25',
      };
      const mockFile = {
        originalname: 'dni.jpg',
        buffer: Buffer.from('image data'),
      };

      await controller.create(createMemberDto, mockFile as any);
      expect(mockMembersService.create).toHaveBeenCalledWith(
        createMemberDto,
        mockFile,
      );
    });
  });
});
