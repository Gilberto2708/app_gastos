"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    logger = new common_1.Logger(AuthService_1.name);
    saltRounds = 10;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async setup(setupDto) {
        try {
            const existingAuth = await this.prisma.auth.findFirst();
            if (existingAuth) {
                throw new common_1.ConflictException('Authentication already set up');
            }
            const hashedPin = await bcrypt.hash(setupDto.pin, this.saltRounds);
            await this.prisma.auth.create({
                data: {
                    pinhash: hashedPin,
                },
            });
            this.logger.log('Authentication setup completed successfully');
            return { success: true };
        }
        catch (error) {
            this.logger.error('Setup failed', error);
            throw error;
        }
    }
    async login(loginDto) {
        try {
            const auth = await this.prisma.auth.findFirst();
            if (!auth) {
                throw new common_1.UnauthorizedException('Authentication not set up');
            }
            const isValidPin = await bcrypt.compare(loginDto.pin, auth.pinhash);
            if (!isValidPin) {
                this.logger.warn('Invalid PIN attempt');
                throw new common_1.UnauthorizedException('Invalid PIN');
            }
            const token = this.jwtService.sign({ sub: auth.id });
            this.logger.log('Login successful');
            return { token, success: true };
        }
        catch (error) {
            this.logger.error('Login failed', error);
            throw error;
        }
    }
    async validateUser(userId) {
        const auth = await this.prisma.auth.findUnique({ where: { id: userId } });
        return auth;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map