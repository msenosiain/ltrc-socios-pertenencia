import {Controller, Get} from '@nestjs/common';

@Controller()
export class AppController {

  @Get()
  getData() {
    return { message: 'LTRC Socios Pertenencia API' };
  }

  @Get('health')
  healthCheck() {
    const uptimeSeconds = process.uptime();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: this.formatUptime(uptimeSeconds)
    };
  }

  private formatUptime(seconds: number): string {
    const years = Math.floor(seconds / (365 * 24 * 60 * 60));
    seconds %= 365 * 24 * 60 * 60;

    const months = Math.floor(seconds / (30 * 24 * 60 * 60));
    seconds %= 30 * 24 * 60 * 60;

    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds %= 24 * 60 * 60;

    const hours = Math.floor(seconds / (60 * 60));
    seconds %= 60 * 60;

    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    const parts: string[] = [];
    if (years > 0) parts.push(`${years}y`);
    if (months > 0) parts.push(`${months}mo`);
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);

    return parts.join(' ');
  }
}
