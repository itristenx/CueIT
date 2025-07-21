import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface AiResponse {
  reply: string;
  actions?: Array<{
    type: string;
    label: string;
    [key: string]: any;
  }>;
  context?: any;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly configService: ConfigService) {}

  async processMessage(
    message: string,
    context: any,
    availableTools: any[],
  ): Promise<AiResponse> {
    this.logger.debug(`Processing AI message: ${message}`);

    try {
      // For now, implement a simple rule-based response system
      // TODO: Integrate with OpenAI GPT or other LLM providers
      const response = await this.generateResponse(message, context, availableTools);
      
      return response;
    } catch (error) {
      this.logger.error(`Error in AI processing: ${error.message}`, error.stack);
      
      return {
        reply: "I'm having trouble understanding your request. Could you please rephrase it?",
        actions: [],
        context: { error: true },
      };
    }
  }

  private async generateResponse(
    message: string,
    context: any,
    availableTools: any[],
  ): Promise<AiResponse> {
    const lowerMessage = message.toLowerCase();

    // Simple rule-based responses with Cosmo's personality
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return {
        reply: `Hey there! I'm Cosmo, your Nova assistant. How can I help you today?`,
        actions: [
          { type: 'create_ticket', label: 'Create a Ticket' },
          { type: 'search_kb', label: 'Search Knowledge Base' },
        ],
      };
    }

    if (lowerMessage.includes('ticket') || lowerMessage.includes('issue') || lowerMessage.includes('problem')) {
      return {
        reply: `I can help you create a ticket for that issue. What seems to be the problem?`,
        actions: [
          { type: 'create_ticket', label: 'Create New Ticket' },
          { type: 'view_tickets', label: 'View My Tickets' },
        ],
      };
    }

    if (lowerMessage.includes('knowledge') || lowerMessage.includes('how to') || lowerMessage.includes('help')) {
      return {
        reply: `Let me search our knowledge base for information that might help you.`,
        actions: [
          { type: 'search_kb', label: 'Search Knowledge Base' },
          { type: 'browse_articles', label: 'Browse Articles' },
        ],
      };
    }

    if (lowerMessage.includes('status') || lowerMessage.includes('account') || lowerMessage.includes('profile')) {
      return {
        reply: `I can show you your account status and recent activity. Here's what I found:`,
        actions: [
          { type: 'show_user_status', label: 'View Status' },
          { type: 'view_activity', label: 'Recent Activity' },
        ],
      };
    }

    // Default helpful response
    return {
      reply: `I'm here to help! I can assist you with creating tickets, searching our knowledge base, or checking your account status. What would you like to do?`,
      actions: [
        { type: 'create_ticket', label: 'Create a Ticket' },
        { type: 'search_kb', label: 'Search Knowledge Base' },
        { type: 'show_user_status', label: 'Check Status' },
      ],
    };
  }

  async getPersonality(): Promise<any> {
    return {
      name: 'Cosmo',
      personality: 'friendly, helpful, occasionally playful',
      tagline: 'Hey, I\'m Cosmo. Need a hand?',
      tone: 'casual but respectful',
      characteristics: [
        'Helpful and curious',
        'Occasionally witty',
        'Aligned with Nova\'s space-themed voice',
        'Supportive and encouraging',
      ],
    };
  }

  async generateSystemPrompt(context: any): Promise<string> {
    const personality = await this.getPersonality();
    
    return `You are ${personality.name}, the AI assistant for Nova Universe ITSM platform.

Personality: ${personality.personality}
Tone: ${personality.tone}

You help users with:
- Creating and managing tickets
- Searching knowledge base articles
- Checking account status and activity
- Providing helpful guidance and support

Current context:
- User: ${context.user.id} (${context.user.role})
- Module: ${context.module}
- Department: ${context.user.department || 'Unknown'}
- Location: ${context.user.location || 'Unknown'}

Always be helpful, friendly, and maintain Nova Universe's space-themed personality.
If you need to perform actions, suggest appropriate tools available to the user.

${personality.tagline}`;
  }
}
