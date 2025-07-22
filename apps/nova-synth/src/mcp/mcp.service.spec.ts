import * as jwt from 'jsonwebtoken';
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mocked-token'),
  verify: jest.fn(() => ({
    sub: '123',
    iss: 'nova-issuer',
    aud: 'nova-audience',
  })),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { McpService } from './mcp.service';
import { AiService } from './ai.service';
import { MemoryService } from './memory.service';
import { ToolRegistryService } from './tool-registry.service';
import { EventRouterService } from './event-router.service';

const mockAiService = {};
const mockMemoryService = {};
const mockToolRegistryService = {};
const mockEventRouterService = {};

describe('McpService', () => {
  let service: McpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        McpService,
        { provide: AiService, useValue: mockAiService },
        { provide: MemoryService, useValue: mockMemoryService },
        { provide: ToolRegistryService, useValue: mockToolRegistryService },
        { provide: EventRouterService, useValue: mockEventRouterService },
      ],
    }).compile();

    service = module.get<McpService>(McpService);
  });

  describe('validateUser', () => {
    it('should validate a valid JWT and return the user', async () => {
      const mockUser = { id: '123' };
      const mockToken = jwt.sign(
        { sub: '123', iss: 'nova-issuer', aud: 'nova-audience' },
        process.env.NOVA_PUBLIC_KEY || 'test-key',
        { algorithm: 'HS256' },
      );

      console.log('Mocked jwt.sign:', jwt.sign);
      console.log('Generated token:', mockToken);
      console.log('Mocked jwt.verify implementation:', jwt.verify);

      jest.spyOn(jwt, 'verify').mockImplementation((token, key, options) => {
        console.log('Mocked jwt.verify called with:', { token, key, options });
        const payload = {
          sub: '123',
          iss: 'nova-issuer',
          aud: 'nova-audience',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
        };
        console.log('Mocked jwt.verify returning payload:', payload);
        return payload;
      });

      const result = (await service.testValidateUser(mockUser, mockToken)) as {
        id: string;
      };
      expect(result).toEqual(mockUser);

      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(
        service.testValidateUser(mockUser, mockToken),
      ).rejects.toThrow('Invalid or expired token.');
    });
  });
});

process.env.NOVA_PUBLIC_KEY = 'test-key';
