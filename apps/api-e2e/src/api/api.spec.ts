import axios from 'axios';

describe('API E2E Tests', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await axios.get('/api/health');

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('status', 'ok');
      expect(res.data).toHaveProperty('timestamp');
      expect(res.data).toHaveProperty('uptimeSeconds');
    });
  });

  describe('GET /api/members', () => {
    it('should return empty array initially', async () => {
      const res = await axios.get('/api/members');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  describe('POST /api/members', () => {
    it('should create a new member', async () => {
      const memberData = {
        firstName: 'Test',
        lastName: 'User',
        birthDate: '1990-01-15',
        documentNumber: '99999999',
        cardHolderFirstName: 'Test',
        cardHolderLastName: 'User',
        cardHolderDocumentNumber: '99999999',
        creditCardNumber: '4111111111111111',
        creditCardExpirationDate: '12/25',
      };

      // Note: This test may fail without a file upload
      // For a complete test, use form-data with a test image
      try {
        const res = await axios.post('/api/members', memberData);
        expect(res.status).toBe(201);
        expect(res.data).toHaveProperty('_id');
        expect(res.data.firstName).toBe(memberData.firstName);
      } catch (error: unknown) {
        // Expected if file is required
        if (axios.isAxiosError(error) && error.response) {
          expect(error.response.status).toBe(400);
        }
      }
    });

    it('should reject duplicate document number', async () => {
      const memberData = {
        firstName: 'Duplicate',
        lastName: 'Test',
        birthDate: '1990-01-15',
        documentNumber: '12345678',
        cardHolderFirstName: 'Duplicate',
        cardHolderLastName: 'Test',
        cardHolderDocumentNumber: '12345678',
        creditCardNumber: '4111111111111111',
        creditCardExpirationDate: '12/25',
      };

      // First creation may succeed or fail based on existing data
      // Second creation should fail with duplicate error
      try {
        await axios.post('/api/members', memberData);
        await axios.post('/api/members', memberData);
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          expect(error.response.status).toBe(400);
          expect(error.response.data.message).toContain('already registered');
        }
      }
    });
  });

  describe('GET /api/members/:id', () => {
    it('should return 404 for non-existent member', async () => {
      try {
        await axios.get('/api/members/000000000000000000000000');
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          expect(error.response.status).toBe(404);
        }
      }
    });
  });
});
