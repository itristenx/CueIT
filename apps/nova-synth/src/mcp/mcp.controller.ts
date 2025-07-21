import { Controller, Post, Get, Body, Headers, UnauthorizedException, Version } from '@nestjs/common';
import { McpService } from './mcp.service';
import { AiService } from './ai.service';
import { MemoryService } from './memory.service';

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

@Controller('mcp')
export class McpController {
  constructor(
    private readonly mcpService: McpService,
    private readonly aiService: AiService,
    private readonly memoryService: MemoryService,
  ) {}

  @Post('agent/message')
  @Version('2')
  async handleAgentMessage(
    @Body() request: McpRequest,
    @Headers('authorization') authorization: string,
  ): Promise<McpResponse> {
    // Validate authorization
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Valid Nova ID token required');
    }

    const token = authorization.slice(7);
    
    // Process the message through the MCP pipeline
    const response = await this.mcpService.processMessage(request, token);
    
    return response;
  }

  @Get('agent/capabilities')
  @Version('2')
  async getCapabilities(): Promise<any> {
    return await this.mcpService.getCapabilities();
  }

  @Get('agent/tools')
  @Version('2')
  async getAvailableTools(): Promise<any> {
    return await this.mcpService.getAvailableTools();
  }

  @Post('agent/tool/execute')
  @Version('2')
  async executeTool(
    @Body() request: { tool: string; args: any; user: any },
    @Headers('authorization') authorization: string,
  ): Promise<any> {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Valid Nova ID token required');
    }

    const token = authorization.slice(7);
    
    return await this.mcpService.executeTool(request.tool, request.args, request.user, token);
  }

  @Get('health')
  @Version('2')
  async healthCheck(): Promise<{ status: string; timestamp: string; service: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Nova MCP Server',
    };
  }
}
