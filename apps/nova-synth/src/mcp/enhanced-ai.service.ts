import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiProviderManager,
  AiRequest,
  AiResponse,
} from './ai-provider-manager.service';

interface NativeAiCapabilities {
  intentClassification: boolean;
  semanticSearch: boolean;
  quickResponses: boolean;
  contextAwareness: boolean;
}

interface McpAiCapabilities {
  openaiIntegration: boolean;
  claudeIntegration: boolean;
  customModels: boolean;
  advancedReasoning: boolean;
}

@Injectable()
export class EnhancedAiService {
  private readonly logger = new Logger(EnhancedAiService.name);
  private nativeCapabilities: NativeAiCapabilities;
  private mcpCapabilities: McpAiCapabilities;

  constructor(
    private readonly configService: ConfigService,
    private readonly providerManager: AiProviderManager,
  ) {
    this.initializeCapabilities();
  }

  private initializeCapabilities(): void {
    // Initialize native AI capabilities
    this.nativeCapabilities = {
      intentClassification: true,
      semanticSearch: true,
      quickResponses: true,
      contextAwareness: true,
    };

    // Initialize MCP capabilities (will be enabled when MCP servers are available)
    this.mcpCapabilities = {
      openaiIntegration: !!this.configService.get('OPENAI_API_KEY'),
      claudeIntegration: !!this.configService.get('ANTHROPIC_API_KEY'),
      customModels: false,
      advancedReasoning: false,
    };

    this.updateProviderAvailability();
  }

  private updateProviderAvailability(): void {
    // Enable MCP providers based on available configurations
    if (this.mcpCapabilities.openaiIntegration) {
      this.providerManager.enableProvider('openai-gpt');
    }
    if (this.mcpCapabilities.claudeIntegration) {
      this.providerManager.enableProvider('claude-anthropic');
    }
  }

  async processMessage(
    message: string,
    context: any,
    availableTools: any[],
    options?: {
      requireCapabilities?: string[];
      preferProvider?: string;
      maxResponseTime?: number;
    },
  ): Promise<AiResponse> {
    const startTime = Date.now();
    this.logger.debug(`Processing AI message: "${message}"`);

    try {
      // Create AI request
      const aiRequest: AiRequest = {
        message,
        context,
        requiredCapabilities: options?.requireCapabilities || ['chat'],
        preferredProvider: options?.preferProvider,
        fallbackEnabled: true,
      };

      // Select appropriate provider
      const provider = await this.providerManager.selectProvider(aiRequest);
      if (!provider) {
        return this.getFallbackResponse(message, context, availableTools);
      }

      // Route to appropriate AI handler
      let response: AiResponse;
      switch (provider.type) {
        case 'native':
          response = await this.processWithNativeAi(
            message,
            context,
            availableTools,
            provider.name,
          );
          break;
        case 'mcp':
          response = await this.processWithMcpAi(
            message,
            context,
            availableTools,
            provider.name,
          );
          break;
        case 'hybrid':
          response = await this.processWithHybridAi(
            message,
            context,
            availableTools,
            provider.name,
          );
          break;
        default:
          response = await this.processWithNativeAi(
            message,
            context,
            availableTools,
            'cosmo-native',
          );
      }

      response.processingTime = Date.now() - startTime;
      response.provider = provider.name;

      this.logger.debug(
        `AI response generated in ${response.processingTime}ms by ${response.provider}`,
      );
      return response;
    } catch (error) {
      this.logger.error(
        `Error in AI processing: ${error.message}`,
        error.stack,
      );
      return this.getErrorResponse(message, context, availableTools, error);
    }
  }

  private async processWithNativeAi(
    message: string,
    context: any,
    availableTools: any[],
    providerName: string,
  ): Promise<AiResponse> {
    const lowerMessage = message.toLowerCase();

    // Intent classification (native AI)
    const intent = this.classifyIntent(message);

    // Quick response generation based on intent
    switch (intent) {
      case 'greeting':
        return {
          reply:
            "Hey there! I'm Cosmo, your Nova assistant. How can I help you today?",
          confidence: 0.95,
          provider: providerName,
          processingTime: 0,
          actions: [
            { type: 'create_ticket', label: 'Create a Ticket' },
            { type: 'search_kb', label: 'Search Knowledge Base' },
          ],
          reasoning:
            'Detected greeting intent, providing welcome message with action options',
        };

      case 'ticket_request':
        return {
          reply:
            'I can help you create a ticket for that issue. What seems to be the problem?',
          confidence: 0.9,
          provider: providerName,
          processingTime: 0,
          actions: [
            { type: 'create_ticket', label: 'Create New Ticket' },
            { type: 'view_tickets', label: 'View My Tickets' },
          ],
          reasoning:
            'Detected ticket creation intent, offering ticket management options',
        };

      case 'knowledge_search':
        return {
          reply:
            'Let me search our knowledge base for information that might help you.',
          confidence: 0.85,
          provider: providerName,
          processingTime: 0,
          actions: [
            { type: 'search_kb', label: 'Search Knowledge Base' },
            { type: 'browse_articles', label: 'Browse Articles' },
          ],
          reasoning:
            'Detected knowledge search intent, providing search options',
        };

      case 'status_inquiry':
        return {
          reply:
            "I can show you your account status and recent activity. Here's what I found:",
          confidence: 0.8,
          provider: providerName,
          processingTime: 0,
          actions: [
            { type: 'show_user_status', label: 'View Status' },
            { type: 'view_activity', label: 'Recent Activity' },
          ],
          reasoning:
            'Detected status inquiry intent, offering status and activity views',
        };

      default:
        return {
          reply:
            "I'm here to help! I can assist you with creating tickets, searching our knowledge base, or checking your account status. What would you like to do?",
          confidence: 0.7,
          provider: providerName,
          processingTime: 0,
          actions: [
            { type: 'create_ticket', label: 'Create a Ticket' },
            { type: 'search_kb', label: 'Search Knowledge Base' },
            { type: 'show_user_status', label: 'Check Status' },
          ],
          reasoning:
            'Could not classify intent clearly, providing general assistance options',
        };
    }
  }

  private async processWithMcpAi(
    message: string,
    context: any,
    availableTools: any[],
    providerName: string,
  ): Promise<AiResponse> {
    // This would integrate with MCP servers for external AI providers
    // For now, implement a placeholder that would call MCP endpoints

    this.logger.debug(`Processing with MCP AI provider: ${providerName}`);

    // TODO: Implement actual MCP server communication
    // This would send requests to MCP servers running OpenAI, Claude, etc.

    return {
      reply: `Processing with ${providerName} via MCP... (implementation pending)`,
      confidence: 0.5,
      provider: providerName,
      processingTime: 0,
      reasoning:
        'MCP integration placeholder - would call external AI via MCP server',
    };
  }

  private async processWithHybridAi(
    message: string,
    context: any,
    availableTools: any[],
    providerName: string,
  ): Promise<AiResponse> {
    // Hybrid approach: Use native AI for classification, MCP for complex reasoning
    const intent = this.classifyIntent(message);

    if (intent === 'complex_query' || intent === 'unknown') {
      // Route to MCP for complex processing
      return this.processWithMcpAi(
        message,
        context,
        availableTools,
        'openai-gpt',
      );
    } else {
      // Handle with native AI for known intents
      return this.processWithNativeAi(
        message,
        context,
        availableTools,
        'cosmo-native',
      );
    }
  }

  private classifyIntent(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes('hello') ||
      lowerMessage.includes('hi') ||
      lowerMessage.includes('hey')
    ) {
      return 'greeting';
    }
    if (
      lowerMessage.includes('ticket') ||
      lowerMessage.includes('issue') ||
      lowerMessage.includes('problem')
    ) {
      return 'ticket_request';
    }
    if (
      lowerMessage.includes('knowledge') ||
      lowerMessage.includes('how to') ||
      lowerMessage.includes('help')
    ) {
      return 'knowledge_search';
    }
    if (
      lowerMessage.includes('status') ||
      lowerMessage.includes('account') ||
      lowerMessage.includes('profile')
    ) {
      return 'status_inquiry';
    }
    if (
      message.length > 100 ||
      lowerMessage.includes('complex') ||
      lowerMessage.includes('analyze')
    ) {
      return 'complex_query';
    }

    return 'unknown';
  }

  private getFallbackResponse(
    message: string,
    context: any,
    availableTools: any[],
  ): AiResponse {
    return {
      reply:
        "I'm having trouble processing your request right now, but I'm still here to help! Try asking me about tickets, knowledge base, or your account status.",
      confidence: 0.3,
      provider: 'fallback',
      processingTime: 0,
      actions: [
        { type: 'create_ticket', label: 'Create a Ticket' },
        { type: 'search_kb', label: 'Search Knowledge Base' },
        { type: 'show_user_status', label: 'Check Status' },
      ],
      reasoning: 'No suitable AI provider available, using fallback response',
    };
  }

  private getErrorResponse(
    message: string,
    context: any,
    availableTools: any[],
    error: Error,
  ): AiResponse {
    return {
      reply:
        'I encountered an issue while processing your request. Could you please try rephrasing it?',
      confidence: 0.1,
      provider: 'error-handler',
      processingTime: 0,
      actions: [],
      context: { error: true, errorMessage: error.message },
      reasoning: `Error occurred during processing: ${error.message}`,
    };
  }

  // Utility methods for AI capabilities
  async getCapabilities(): Promise<{
    native: NativeAiCapabilities;
    mcp: McpAiCapabilities;
  }> {
    return {
      native: this.nativeCapabilities,
      mcp: this.mcpCapabilities,
    };
  }

  async getAvailableProviders(): Promise<any[]> {
    return this.providerManager.listProviders();
  }
}
