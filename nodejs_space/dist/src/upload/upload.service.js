"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UploadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const config_1 = require("@nestjs/config");
let UploadService = UploadService_1 = class UploadService {
    configService;
    logger = new common_1.Logger(UploadService_1.name);
    uploadDir = (0, path_1.join)(process.cwd(), 'uploads');
    constructor(configService) {
        this.configService = configService;
        this.ensureUploadDir();
    }
    async ensureUploadDir() {
        try {
            await fs_1.promises.access(this.uploadDir);
        }
        catch {
            await fs_1.promises.mkdir(this.uploadDir, { recursive: true });
            this.logger.log('Upload directory created');
        }
    }
    async uploadReceipt(file) {
        try {
            const filename = `${Date.now()}-${file.originalname}`;
            const filepath = (0, path_1.join)(this.uploadDir, filename);
            await fs_1.promises.writeFile(filepath, file.buffer);
            const appOrigin = this.configService.get('APP_ORIGIN') || 'http://localhost:3000/';
            const url = `${appOrigin}uploads/${filename}`;
            this.logger.log(`Receipt uploaded: ${filename}`);
            return { url };
        }
        catch (error) {
            this.logger.error('Failed to upload receipt', error);
            throw error;
        }
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = UploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadService);
//# sourceMappingURL=upload.service.js.map