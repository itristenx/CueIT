import { Injectable, Logger } from '@nestjs/common';

interface Tool {
  name: string;
  description: string;
  module: string;
  requiredRole: string[];
  parameters: any;
  handler: (args: any, user: any) => Promise<any>;
}

@Injectable()
export class ToolRegistryService {
  private readonly logger = new Logger(ToolRegistryService.name);
  private tools = new Map<string, Tool>();

  constructor() {
    this.initializeTools();
  }

  async getToolsForUser(userRole: string, module: string): Promise<Tool[]> {
    const availableTools = Array.from(this.tools.values()).filter(tool => {
      const hasRole = tool.requiredRole.includes(userRole) || tool.requiredRole.includes('ALL');
      const hasModule = tool.module === module || tool.module === 'ALL';
      return hasRole && hasModule;
    });

    this.logger.debug(`Found ${availableTools.length} tools for role ${userRole} in module ${module}`);
    return availableTools;
  }

  async getAllTools(): Promise<Tool[]> {
    return Array.from(this.tools.values());
  }

  async executeTool(toolName: string, args: any, user: any): Promise<any> {
    const tool = this.tools.get(toolName);
    
    if (!tool) {
      throw new Error(`Tool "${toolName}" not found`);
    }

    // Check if user has permission to use this tool
    const hasPermission = tool.requiredRole.includes(user.role) || tool.requiredRole.includes('ALL');
    if (!hasPermission) {
      throw new Error(`User role "${user.role}" does not have permission to use tool "${toolName}"`);
    }

    this.logger.debug(`Executing tool ${toolName} with args:`, args);
    
    try {
      return await tool.handler(args, user);
    } catch (error) {
      this.logger.error(`Error executing tool ${toolName}: ${error.message}`, error.stack);
      throw error;
    }
  }

  private initializeTools(): void {
    // Ticket Management Tools
    this.registerTool({
      name: 'create_ticket',
      description: 'Create a new support ticket',
      module: 'ALL',
      requiredRole: ['END_USER', 'MANAGER', 'TECHNICIAN', 'TECH_LEAD', 'ADMIN'],
      parameters: {
        title: 'string',
        description: 'string',
        priority: 'string',
        category: 'string',
      },
      handler: async (args, user) => {
        // TODO: Implement actual ticket creation
        return {
          success: true,
          message: 'Ticket created successfully',
          ticketId: `TKT-${Date.now()}`,
          title: args.title,
          status: 'OPEN',
        };
      },
    });

    this.registerTool({
      name: 'search_tickets',
      description: 'Search for tickets',
      module: 'ALL',
      requiredRole: ['END_USER', 'MANAGER', 'TECHNICIAN', 'TECH_LEAD', 'ADMIN'],
      parameters: {
        query: 'string',
        status: 'string',
        limit: 'number',
      },
      handler: async (args, user) => {
        // TODO: Implement actual ticket search
        return {
          success: true,
          tickets: [
            {
              id: 'TKT-001',
              title: 'Password reset request',
              status: 'OPEN',
              priority: 'MEDIUM',
              createdAt: new Date().toISOString(),
            },
          ],
        };
      },
    });

    // Knowledge Base Tools
    this.registerTool({
      name: 'search_kb',
      description: 'Search knowledge base articles',
      module: 'ALL',
      requiredRole: ['ALL'],
      parameters: {
        query: 'string',
        category: 'string',
        limit: 'number',
      },
      handler: async (args, user) => {
        // TODO: Implement actual KB search
        return {
          success: true,
          articles: [
            {
              id: 'KB-001',
              title: 'How to reset your password',
              summary: 'Step-by-step guide to reset your password',
              category: 'Account',
              rating: 4.5,
            },
          ],
        };
      },
    });

    // User Status Tools
    this.registerTool({
      name: 'show_user_status',
      description: 'Show user status, XP, and badges',
      module: 'ALL',
      requiredRole: ['ALL'],
      parameters: {},
      handler: async (args, user) => {
        // TODO: Implement actual user status retrieval
        return {
          success: true,
          user: {
            id: user.id,
            name: user.name || 'User',
            role: user.role,
            xp: 1250,
            level: 'Commander',
            badges: [
              'First Ticket',
              'Knowledge Seeker',
              'Team Player',
            ],
            recentActivity: [
              {
                action: 'Created ticket',
                timestamp: new Date().toISOString(),
              },
            ],
          },
        };
      },
    });

    // System Information Tools
    this.registerTool({
      name: 'get_system_status',
      description: 'Get Nova Universe system status',
      module: 'ALL',
      requiredRole: ['TECHNICIAN', 'TECH_LEAD', 'ADMIN'],
      parameters: {},
      handler: async (args, user) => {
        return {
          success: true,
          system: {
            status: 'healthy',
            uptime: '99.9%',
            services: {
              'nova-synth': 'online',
              'nova-orbit': 'online',
              'nova-core': 'online',
              'nova-beacon': 'online',
            },
            lastUpdated: new Date().toISOString(),
          },
        };
      },
    });

    // Configuration Tools
    this.registerTool({
      name: 'fetch_config',
      description: 'Fetch module configuration',
      module: 'ALL',
      requiredRole: ['ADMIN'],
      parameters: {
        module: 'string',
      },
      handler: async (args, user) => {
        return {
          success: true,
          config: {
            module: args.module,
            enabled: true,
            version: '1.0.0',
            settings: {},
          },
        };
      },
    });

    this.logger.log(`Initialized ${this.tools.size} tools`);
  }

  private registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
    this.logger.debug(`Registered tool: ${tool.name}`);
  }
}
