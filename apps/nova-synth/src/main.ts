require('module-alias/register');
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
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

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Nova Universe API')
    .setDescription('Comprehensive API for Nova Universe platform - ticketing, identity, AI, and workflow management')
    .setVersion('2.0.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication and session management')
    .addTag('Tickets', 'Ticket management and workflows')
    .addTag('Users', 'User management and profiles')
    .addTag('Knowledge Base', 'Knowledge base articles and search')
    .addTag('Notifications', 'Email and real-time notifications')
    .addTag('Gamification', 'XP, badges, and leaderboards')
    .addTag('SCIM', 'Identity provisioning and management')
    .addTag('Workflows', 'Automated workflows and approvals')
    .addTag('SLA', 'Service level agreements and escalations')
    .addTag('Configuration', 'System configuration and settings')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'Nova Universe API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Nova Synth API server running on port ${port}`);
  console.log(`📡 API v2 (default): http://localhost:${port}/api/v2`);
  console.log(`📡 API v1 (legacy): http://localhost:${port}/api/v1`);
  console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
  console.log(`🔄 v1 endpoints are deprecated - use v2 for new development`);
  console.log('✅ Startup completed Synth API Running');
}
void bootstrap();
