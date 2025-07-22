import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface McpServer {
  name: string;
  url: string;
  capabilities: string[];
  status: 'online' | 'offline' | 'error';
  lastPing?: Date;
}

interface McpAiRequest {
  prompt: string;
  context?: McpContext;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

// Refining the `McpAiResponse` interface to include `text` and ensuring safe access.
interface McpAiResponse {
  content: string;
  model: string;
  tokenUsage?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  text?: string;
}

interface McpContext {
  user?: {
    id: string;
    role: string;
    department: string;
  };
  module?: string;
}

@Injectable()
export class McpAiConnector {
  private readonly logger = new Logger(McpAiConnector.name);
  private servers: Map<string, McpServer> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.initializeServers();
  }

  private initializeServers(): void {
    // Register OpenAI MCP Server
    const openaiUrl = this.configService.get<string>('OPENAI_MCP_SERVER_URL');
    if (openaiUrl) {
      this.registerServer({
        name: 'openai-mcp',
        url: openaiUrl,
        capabilities: ['text-generation', 'conversation', 'analysis'],
        status: 'offline',
      });
    }

    // Register Claude MCP Server
    const claudeUrl = this.configService.get<string>('CLAUDE_MCP_SERVER_URL');
    if (claudeUrl) {
      this.registerServer({
        name: 'claude-mcp',
        url: claudeUrl,
        capabilities: ['text-generation', 'analysis', 'reasoning'],
        status: 'offline',
      });
    }

    // Register Custom AI MCP Server
    const customUrl = this.configService.get<string>(
      'CUSTOM_AI_MCP_SERVER_URL',
    );
    if (customUrl) {
      this.registerServer({
        name: 'custom-ai-mcp',
        url: customUrl,
        capabilities: ['domain-specific', 'specialized'],
        status: 'offline',
      });
    }

    void this.startHealthChecks();
  }

  registerServer(server: McpServer): void {
    this.servers.set(server.name, server);
    this.logger.debug(
      `Registered MCP AI server: ${server.name} at ${server.url}`,
    );
  }

  private async startHealthChecks(): Promise<void> {
    // Ping all servers every 60 seconds to check availability
    setInterval(() => {
      void (async () => {
        for (const server of this.servers.values()) {
          try {
            await this.pingServer(server);
          } catch (error) {
            this.logger.warn(`Error pinging server: ${error}`);
          }
        }
      })();
    }, 60000);

    // Initial health check
    for (const server of this.servers.values()) {
      await this.pingServer(server);
    }
  }

  private async pingServer(server: McpServer): Promise<void> {
    try {
      // TODO: Implement actual MCP server ping
      // This would send a health check request to the MCP server

      const response = await fetch(`${server.url}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        server.status = 'online';
        server.lastPing = new Date();
        this.logger.debug(`MCP server ${server.name} is online`);
      } else {
        server.status = 'error';
        this.logger.warn(
          `MCP server ${server.name} returned error status: ${response.status}`,
        );
      }
    } catch (error) {
      server.status = 'offline';
      this.logger.warn(
        `Cannot reach MCP server ${server.name}: ${
          error instanceof Error ? error.message : error
        }`,
      );
    }
  }

  async sendRequest(
    serverName: string,
    request: McpAiRequest,
  ): Promise<McpAiResponse> {
    const server = this.servers.get(serverName);
    if (!server) {
      throw new Error(`MCP server ${serverName} not found`);
    }

    if (server.status !== 'online') {
      throw new Error(
        `MCP server ${serverName} is not available (status: ${server.status})`,
      );
    }

    try {
      this.logger.debug(`Sending request to MCP server ${serverName}`);

      // TODO: Implement actual MCP protocol communication
      // This would follow the Model Context Protocol specification

      const response = await fetch(`${server.url}/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getServerToken(serverName)}`,
        },
        body: JSON.stringify({
          prompt: request.prompt,
          context: request.context,
          maxTokens: request.maxTokens ?? 1000,
          temperature: request.temperature ?? 0.7,
          model: request.model,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(
          `MCP server returned ${response.status}: ${response.statusText}`,
        );
      }

      // Casting `responseJson` to a stricter type and ensuring safe access.
      const responseJson = (await response.json()) as Partial<McpAiResponse>;

      const result: McpAiResponse = {
        content: responseJson.content ?? responseJson.text ?? '',
        model: responseJson.model ?? 'unknown',
        tokenUsage: responseJson.tokenUsage ?? {},
        metadata: responseJson.metadata ?? {},
      };

      return result;
    } catch (error) {
      this.logger.error(
        `Error communicating with MCP server ${serverName}: ${
          error instanceof Error ? error.message : error
        }`,
      );
      throw error;
    }
  }

  private getServerToken(serverName: string): string {
    // Get authentication token for the specific MCP server
    switch (serverName) {
      case 'openai-mcp':
        return this.configService.get('OPENAI_API_KEY') ?? '';
      case 'claude-mcp':
        return this.configService.get('ANTHROPIC_API_KEY') ?? '';
      case 'custom-ai-mcp':
        return this.configService.get('CUSTOM_AI_API_KEY') ?? '';
      default:
        return '';
    }
  }

  getAvailableServers(): McpServer[] {
    return Array.from(this.servers.values());
  }

  getServerByCapability(capability: string): McpServer[] {
    return Array.from(this.servers.values()).filter(
      (server) =>
        server.status === 'online' && server.capabilities.includes(capability),
    );
  }

  async isServerAvailable(serverName: string): Promise<boolean> {
    return await Promise.resolve(this.servers.has(serverName));
  }

  // Method to handle complex AI requests that require MCP servers
  async processComplexQuery(
    query: string,
    context: McpContext,
    preferredServer?: string,
  ): Promise<McpAiResponse> {
    let targetServer: McpServer | null = null;

    if (preferredServer) {
      targetServer = this.servers.get(preferredServer) || null;
      if (targetServer?.status !== 'online') {
        this.logger.warn(
          `Preferred server ${preferredServer} is not available, falling back`,
        );
        targetServer = null;
      }
    }

    if (!targetServer) {
      // Find the best available server for complex queries
      const availableServers = this.getServerByCapability(
        'text-generation',
      ).filter((s) => s.status === 'online');

      if (availableServers.length === 0) {
        throw new Error(
          'No MCP AI servers available for complex query processing',
        );
      }

      // Prefer OpenAI for complex queries, fallback to others
      targetServer =
        availableServers.find((s) => s.name === 'openai-mcp') ||
        availableServers[0];
    }

    // Build enhanced prompt with context
    const enhancedPrompt = this.buildEnhancedPrompt(query, context);

    return this.sendRequest(targetServer.name, {
      prompt: enhancedPrompt,
      context,
      maxTokens: 1500,
      temperature: 0.7,
    });
  }

  private buildEnhancedPrompt(query: string, context: McpContext): string {
    return `You are Cosmo, the AI assistant for Nova Universe ITSM platform.

Context:
- User: ${context.user?.id ?? 'unknown'} (${context.user?.role ?? 'unknown'})
- Department: ${context.user?.department ?? 'unknown'}
- Module: ${context.module ?? 'unknown'}

User Query: ${query}

Please provide a helpful, friendly response that maintains Nova's space-themed personality. If you suggest actions, make sure they are appropriate for the user's role and context.
Keep responses concise but informative.`;
  }
}
