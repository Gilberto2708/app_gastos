import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS for mobile app access
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation setup
  const swaggerPath = 'api/docs';
  const config = new DocumentBuilder()
    .setTitle('Shared Expense Tracker API')
    .setDescription('API for managing shared expenses between couples')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Prevent CDN/browser caching
  app.use(`/${swaggerPath}`, (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
  });

  SwaggerModule.setup(swaggerPath, app, document, {
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

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port, '0.0.0.0');
  
  logger.log(`🚀 Server is running on http://0.0.0.0:${port}`);
  logger.log(`📚 API Documentation: http://0.0.0.0:${port}/${swaggerPath}`);
  logger.log(`❤️  Health check: http://0.0.0.0:${port}/health`);
}

bootstrap();
