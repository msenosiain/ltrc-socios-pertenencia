import {Controller, Get} from '@nestjs/common';

@Controller()
export class AppController {

  @Get()
  getData() {
    return { message: 'LTRC Socios Pertenencia API' };
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }
}
