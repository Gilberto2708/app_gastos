import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir = join(process.cwd(), 'uploads');

  constructor(private readonly configService: ConfigService) {
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
      this.logger.log('Upload directory created');
    }
  }

  async uploadReceipt(file: Express.Multer.File) {
    try {
      const filename = `${Date.now()}-${file.originalname}`;
      const filepath = join(this.uploadDir, filename);
      
      await fs.writeFile(filepath, file.buffer);
      
      const appOrigin = this.configService.get<string>('APP_ORIGIN') || 'http://localhost:3000/';
      const url = `${appOrigin}uploads/${filename}`;
      
      this.logger.log(`Receipt uploaded: ${filename}`);
      return { url };
    } catch (error) {
      this.logger.error('Failed to upload receipt', error);
      throw error;
    }
  }
}
