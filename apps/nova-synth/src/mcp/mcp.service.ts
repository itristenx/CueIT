import { Injectable, Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { MemoryService } from './memory.service';
import { ToolRegistryService } from './tool-registry.service';
import { EventRouterService } from './event-router.service';
import jwt from 'jsonwebtoken';

interface McpRequest {
  message: string;
  module: string;
  user: {
    id: string;
    role: string;
  };
  context?: {
    location?: string;
    department?: string;
    [key: string]: any;
  };
}

interface McpResponse {
  reply: string;
  actions?: Array<{
    type: string;
    label: string;
    [key: string]: any;
  }>;
  context?: any;
}

@Injectable()
export class McpService {
  private readonly logger = new Logger(McpService.name);

  constructor(
    private readonly aiService: AiService,
    private readonly memoryService: MemoryService,
    private readonly toolRegistry: ToolRegistryService,
    private readonly eventRouter: EventRouterService,
  ) {}

  async processMessage(
    request: McpRequest,
    token: string,
  ): Promise<McpResponse> {
    this.logger.debug(
      `Processing message from user ${request.user.id} in module ${request.module}`,
    );

    try {
      // 1. Validate user and token
      const user = await this.validateUser(token, request.user);

      // 2. Get conversation context and memory
      const conversationContext =
        await this.memoryService.getConversationContext(
          request.user.id,
          request.module,
        );

      // 3. Build AI context with user role, history, and available tools
      const aiContext = await this.buildAiContext(
        request,
        user,
        conversationContext,
      );

      // 4. Get available tools based on user role and module
      const availableTools = await this.toolRegistry.getToolsForUser(
        user.role,
        request.module,
      );

      // 5. Process through AI service
      const aiResponse = await this.aiService.processMessage(
        request.message,
        aiContext,
        availableTools,
      );

      // 6. Store conversation in memory
      await this.memoryService.storeConversation(
        request.user.id,
        request.module,
        request.message,
        aiResponse.reply,
        aiResponse.actions,
      );

      // 7. Trigger any events
      await this.eventRouter.routeEvent('message_processed', {
        userId: request.user.id,
        module: request.module,
        message: request.message,
        response: aiResponse.reply,
      });

      return {
        reply: aiResponse.reply,
        actions: aiResponse.actions,
        context: aiResponse.context,
      };
    } catch (error) {
      this.logger.error(
        `Error processing message: ${error.message}`,
        error.stack,
      );

      return {
        reply:
          "I'm sorry, I encountered an error processing your request. Please try again or contact support if the problem persists.",
        actions: [],
        context: { error: true },
      };
    }
  }

  async getCapabilities(): Promise<any> {
    return {
      service: 'Nova MCP Server',
      version: '1.0.0',
      capabilities: [
        'message_processing',
        'tool_execution',
        'conversation_memory',
        'event_routing',
        'role_based_access',
      ],
      modules: ['nova-orbit', 'nova-core', 'nova-beacon', 'nova-comms'],
      ai: {
        model: 'cosmo',
        personality: 'friendly, helpful, occasionally playful',
        capabilities: [
          'ticket_creation',
          'knowledge_base_search',
          'user_assistance',
          'system_information',
        ],
      },
    };
  }

  async getAvailableTools(): Promise<any> {
    return await this.toolRegistry.getAllTools();
  }

  async executeTool(
    toolName: string,
    args: any,
    user: any,
    token: string,
  ): Promise<any> {
    this.logger.debug(`Executing tool ${toolName} for user ${user.id}`);

    try {
      const validatedUser = await this.validateUser(token, {
        id: user.id as string,
        role: user.role as string,
      });
      return await this.toolRegistry.executeTool(toolName, args, validatedUser);
    } catch (error) {
      this.logger.error(
        `Error executing tool ${toolName}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  protected async validateUser(
    token: string,
    user: { id: string; role: string },
  ): Promise<{ id: string; role: string }> {
    try {
      const publicKey = process.env.NOVA_PUBLIC_KEY; // Ensure this is securely stored and loaded
      if (!publicKey) {
        this.logger.error('Public key for JWT verification is not configured.');
        throw new Error('Public key for JWT verification is not configured.');
      }

      this.logger.debug(`Public key used for verification: ${publicKey}`);
      this.logger.debug(`Token being verified: ${token}`);

      // Verify the token
      const decoded = jwt.verify(token, publicKey, {
        audience: process.env.NOVA_AUDIENCE || 'nova-audience',
        issuer: process.env.NOVA_ISSUER || 'nova-issuer',
      });

      const { sub, iss, aud } = decoded as {
        sub: string;
        iss: string;
        aud: string;
      };

      this.logger.debug(
        `Token subject: ${sub}, Issuer: ${iss}, Audience: ${aud}`,
      );

      if (!sub || !iss || !aud) {
        this.logger.error('Token payload is missing required fields.');
        throw new Error('Invalid token payload.');
      }

      this.logger.debug(
        `JWT payload: { sub: ${sub}, iss: ${iss}, aud: ${aud} }`,
      );

      return { id: sub, role: user.role };
    } catch (error) {
      this.logger.error('JWT validation failed:', error);
      throw new Error('Invalid or expired token.');
    }
  }

  public async testValidateUser(user: any, token: string): Promise<any> {
    const typedUser = user as { id: string; role: string };
    return this.validateUser(token, typedUser);
  }

  private async buildAiContext(
    request: McpRequest,
    user: { id: string; role: string },
    conversationContext: { history: any[] },
  ): Promise<{
    user: {
      id: string;
      role: string;
      department?: string;
      location?: string;
    };
    module: string;
    conversationHistory: any[];
    systemContext: any;
  }> {
    return Promise.resolve({
      user: {
        id: user.id,
        role: user.role,
        department: request.context?.department,
        location: request.context?.location,
      },
      module: request.module,
      conversationHistory: conversationContext.history || [],
      systemContext: {
        currentTime: new Date().toISOString(),
        platform: 'Nova Universe',
        assistant: 'Cosmo',
      },
      ...request.context,
    });
  }
}
