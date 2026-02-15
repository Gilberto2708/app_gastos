import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { SetupDto } from './dto/setup.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly logger;
    private readonly saltRounds;
    constructor(prisma: PrismaService, jwtService: JwtService);
    setup(setupDto: SetupDto): Promise<{
        success: boolean;
    }>;
    login(loginDto: LoginDto): Promise<{
        token: string;
        success: boolean;
    }>;
    validateUser(userId: string): Promise<{
        id: string;
        pinhash: string;
        createdat: Date;
        updatedat: Date;
    } | null>;
}
