import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServerService } from './server/server.service';
import { ConfigurationService } from './configuration/configuration.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ServerService,
          useValue: {
            getHealthStatus: jest.fn().mockResolvedValue({ status: 'ok' }),
            getServerInfo: jest.fn().mockResolvedValue({ version: '1.0.0' }),
          },
        },
        {
          provide: ConfigurationService,
          useValue: {
            getConfiguration: jest.fn().mockResolvedValue({ configured: true }),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return API status', () => {
      expect(appController.getRoot()).toEqual({ status: 'API Running' });
    });
  });
});
