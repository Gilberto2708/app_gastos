import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { SetupDto } from './dto/setup.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly saltRounds = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async setup(setupDto: SetupDto) {
    try {
      const existingAuth = await this.prisma.auth.findFirst();
      
      if (existingAuth) {
        throw new ConflictException('Authentication already set up');
      }

      const hashedPin = await bcrypt.hash(setupDto.pin, this.saltRounds);
      
      await this.prisma.auth.create({
        data: {
          pinhash: hashedPin,
        },
      });

      this.logger.log('Authentication setup completed successfully');
      return { success: true };
    } catch (error) {
      this.logger.error('Setup failed', error);
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const auth = await this.prisma.auth.findFirst();
      
      if (!auth) {
        throw new UnauthorizedException('Authentication not set up');
      }

      const isValidPin = await bcrypt.compare(loginDto.pin, auth.pinhash);
      
      if (!isValidPin) {
        this.logger.warn('Invalid PIN attempt');
        throw new UnauthorizedException('Invalid PIN');
      }

      const token = this.jwtService.sign({ sub: auth.id });
      
      this.logger.log('Login successful');
      return { token, success: true };
    } catch (error) {
      this.logger.error('Login failed', error);
      throw error;
    }
  }

  async validateUser(userId: string) {
    const auth = await this.prisma.auth.findUnique({ where: { id: userId } });
    return auth;
  }
}
