import { Test, TestingModule } from '@nestjs/testing';
import { GoogleAppsScriptService } from './google-apps-script.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GoogleAppsScriptService', () => {
  let service: GoogleAppsScriptService;
  const originalEnv = process.env;

  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...originalEnv, GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/test' };

    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleAppsScriptService],
    }).compile();

    service = module.get<GoogleAppsScriptService>(GoogleAppsScriptService);
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('appendMemberToSheet', () => {
    const memberData = {
      firstName: 'John',
      lastName: 'Doe',
      documentNumber: '12345678',
      birthDate: '01/01/1990',
      documentImageLink: 'http://localhost:3000/api/members/image/123',
      cardHolderFirstName: 'Jane',
      cardHolderLastName: 'Doe',
      cardHolderDocumentNumber: '87654321',
      creditCardNumber: '4111111111111111',
      creditCardExpirationDate: '12/25',
      createdAt: '13/02/2026 10:00:00',
    };

    it('should successfully append member to sheet', async () => {
      mockedAxios.post.mockResolvedValue({ data: { success: true } });

      const result = await service.appendMemberToSheet(memberData);
      expect(result).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalled();
    });

    it('should return false when API returns error', async () => {
      mockedAxios.post.mockResolvedValue({ data: { success: false, error: 'Test error' } });

      const result = await service.appendMemberToSheet(memberData);
      expect(result).toBe(false);
    });

    it('should return false when request fails', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      const result = await service.appendMemberToSheet(memberData);
      expect(result).toBe(false);
    });

    it('should return false when URL is not configured', async () => {
      process.env.GOOGLE_APPS_SCRIPT_URL = '';
      const module: TestingModule = await Test.createTestingModule({
        providers: [GoogleAppsScriptService],
      }).compile();
      const serviceWithoutUrl = module.get<GoogleAppsScriptService>(GoogleAppsScriptService);

      const result = await serviceWithoutUrl.appendMemberToSheet(memberData);
      expect(result).toBe(false);
    });
  });

  describe('getAllMembers', () => {
    it('should return array of members', async () => {
      const mockMembers = [{ firstName: 'John', lastName: 'Doe' }];
      mockedAxios.get.mockResolvedValue({ data: { success: true, data: mockMembers } });

      const result = await service.getAllMembers();
      expect(result).toEqual(mockMembers);
    });

    it('should return empty array on error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      const result = await service.getAllMembers();
      expect(result).toEqual([]);
    });

    it('should return empty array when response is invalid', async () => {
      mockedAxios.get.mockResolvedValue({ data: { success: false } });

      const result = await service.getAllMembers();
      expect(result).toEqual([]);
    });

    it('should return empty array when URL is not configured', async () => {
      process.env.GOOGLE_APPS_SCRIPT_URL = '';
      const module: TestingModule = await Test.createTestingModule({
        providers: [GoogleAppsScriptService],
      }).compile();
      const serviceWithoutUrl = module.get<GoogleAppsScriptService>(GoogleAppsScriptService);

      const result = await serviceWithoutUrl.getAllMembers();
      expect(result).toEqual([]);
    });
  });

  describe('findMemberByDocumentNumber', () => {
    it('should find member by document number', async () => {
      const mockMember = { firstName: 'John', lastName: 'Doe', documentNumber: '12345678' };
      mockedAxios.get.mockResolvedValue({ data: { success: true, data: [mockMember] } });

      const result = await service.findMemberByDocumentNumber('12345678');
      expect(result).toEqual(mockMember);
    });

    it('should return null when member not found', async () => {
      mockedAxios.get.mockResolvedValue({ data: { success: true, data: [] } });

      const result = await service.findMemberByDocumentNumber('nonexistent');
      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      const result = await service.findMemberByDocumentNumber('12345678');
      expect(result).toBeNull();
    });

    it('should return null when URL is not configured', async () => {
      process.env.GOOGLE_APPS_SCRIPT_URL = '';
      const module: TestingModule = await Test.createTestingModule({
        providers: [GoogleAppsScriptService],
      }).compile();
      const serviceWithoutUrl = module.get<GoogleAppsScriptService>(GoogleAppsScriptService);

      const result = await serviceWithoutUrl.findMemberByDocumentNumber('12345678');
      expect(result).toBeNull();
    });
  });

  describe('syncMembersFromSheet', () => {
    it('should return all members from sheet', async () => {
      const mockMembers = [{ firstName: 'John' }, { firstName: 'Jane' }];
      mockedAxios.get.mockResolvedValue({ data: { success: true, data: mockMembers } });

      const result = await service.syncMembersFromSheet();
      expect(result).toEqual(mockMembers);
    });
  });

  describe('formatCreditCard', () => {
    it('should format credit card number correctly', async () => {
      const memberData = {
        firstName: 'John',
        lastName: 'Doe',
        documentNumber: '12345678',
        birthDate: '01/01/1990',
        documentImageLink: 'http://localhost:3000/api/members/image/123',
        cardHolderFirstName: 'Jane',
        cardHolderLastName: 'Doe',
        cardHolderDocumentNumber: '87654321',
        creditCardNumber: '4111111111111111',
        creditCardExpirationDate: '12/25',
        createdAt: '13/02/2026 10:00:00',
      };

      mockedAxios.post.mockResolvedValue({ data: { success: true } });
      await service.appendMemberToSheet(memberData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          creditCardNumber: '4111 1111 1111 1111',
        }),
        expect.any(Object),
      );
    });
  });
});

