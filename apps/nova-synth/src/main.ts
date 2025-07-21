import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://orbit.nova.universe', 'https://core.nova.universe']
      : ['http://localhost:3000', 'http://localhost:3002'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // API versioning - v2 is now the default
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '2',
    prefix: 'v',
  });

  // API prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Nova Synth API server running on port ${port}`);
  console.log(`📡 API v2 (default): http://localhost:${port}/api/v2`);
  console.log(`📡 API v1 (legacy): http://localhost:${port}/api/v1`);
  console.log(`🔄 v1 endpoints are deprecated - use v2 for new development`);
}
bootstrap();
