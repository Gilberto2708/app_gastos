"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const swaggerPath = 'api/docs';
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Shared Expense Tracker API')
        .setDescription('API for managing shared expenses between couples')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    app.use(`/${swaggerPath}`, (req, res, next) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
        next();
    });
    swagger_1.SwaggerModule.setup(swaggerPath, app, document, {
        customSiteTitle: 'Expense Tracker API',
        customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }
      .swagger-ui .info .title { 
        color: #1a202c; 
        font-size: 2rem; 
        font-weight: 700;
      }
      .swagger-ui .info .description { 
        color: #4a5568; 
        line-height: 1.6;
      }
      .swagger-ui .opblock-tag { 
        font-size: 1.25rem; 
        font-weight: 600; 
        color: #2d3748;
      }
      .swagger-ui .opblock { 
        border: 1px solid #e2e8f0; 
        border-radius: 8px; 
        margin-bottom: 1rem;
      }
      .swagger-ui .btn { 
        border-radius: 6px; 
        font-weight: 500;
      }
    `,
    });
    const port = configService.get('PORT', 3000);
    await app.listen(port);
    logger.log(`🚀 Server is running on http://localhost:${port}`);
    logger.log(`📚 API Documentation: http://localhost:${port}/${swaggerPath}`);
    logger.log(`❤️  Health check: http://localhost:${port}/health`);
}
bootstrap();
//# sourceMappingURL=main.js.map