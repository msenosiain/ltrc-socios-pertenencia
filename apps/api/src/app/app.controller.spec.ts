import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    controller = app.get<AppController>(AppController);
  });

  describe('getData', () => {
    it('should return API message', () => {
      expect(controller.getData()).toEqual({ message: 'LTRC Socios Pertenencia API' });
    });
  });

  describe('healthCheck', () => {
    it('should return health status', () => {
      const result = controller.healthCheck();
      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeDefined();
    });

    it('should format uptime correctly', () => {
      const result = controller.healthCheck();
      expect(typeof result.uptime).toBe('string');
      expect(result.uptime).toMatch(/\d+s$/);
    });

    it('should have valid ISO timestamp', () => {
      const result = controller.healthCheck();
      const date = new Date(result.timestamp);
      expect(date.toISOString()).toBe(result.timestamp);
    });
  });

  describe('formatUptime (private method via healthCheck)', () => {
    it('should show seconds for short uptime', () => {
      const result = controller.healthCheck();
      // The uptime will always have at least seconds
      expect(result.uptime).toContain('s');
    });
  });
});
