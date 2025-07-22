import { Injectable, Logger } from '@nestjs/common';

export interface AiProvider {
  name: string;
  type: 'native' | 'mcp' | 'hybrid';
  priority: number;
  capabilities: string[];
  enabled: boolean;
}

export interface AiRequest {
  message: string;
  context: any;
  requiredCapabilities?: string[];
  preferredProvider?: string;
  fallbackEnabled?: boolean;
}

export interface AiResponse {
  reply: string;
  confidence: number;
  provider: string;
  processingTime: number;
  actions?: Array<{
    type: string;
    label: string;
    [key: string]: any;
  }>;
  context?: any;
  reasoning?: string;
  metadata?: any;
}

@Injectable()
export class AiProviderManager {
  private readonly logger = new Logger(AiProviderManager.name);
  private providers: Map<string, AiProvider> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Native AI Providers
    this.registerProvider({
      name: 'cosmo-native',
      type: 'native',
      priority: 1,
      capabilities: [
        'chat',
        'classification',
        'intent-detection',
        'quick-response',
      ],
      enabled: true,
    });

    this.registerProvider({
      name: 'embedding-search',
      type: 'native',
      priority: 2,
      capabilities: ['semantic-search', 'similarity', 'knowledge-retrieval'],
      enabled: true,
    });

    // MCP AI Providers (will be registered dynamically)
    this.registerProvider({
      name: 'openai-gpt',
      type: 'mcp',
      priority: 3,
      capabilities: [
        'advanced-reasoning',
        'complex-queries',
        'creative-writing',
      ],
      enabled: false, // Will be enabled when MCP server is available
    });

    this.registerProvider({
      name: 'claude-anthropic',
      type: 'mcp',
      priority: 4,
      capabilities: ['analysis', 'structured-thinking', 'technical-writing'],
      enabled: false,
    });
  }

  registerProvider(provider: AiProvider): void {
    this.providers.set(provider.name, provider);
    this.logger.debug(
      `Registered AI provider: ${provider.name} (${provider.type})`,
    );
  }

  getProvider(name: string): AiProvider | undefined {
    return this.providers.get(name);
  }

  getProvidersForCapability(capability: string): AiProvider[] {
    return Array.from(this.providers.values())
      .filter((p) => p.enabled && p.capabilities.includes(capability))
      .sort((a, b) => a.priority - b.priority);
  }

  async selectProvider(request: AiRequest): Promise<AiProvider | null> {
    let candidates: AiProvider[] = [];

    // If a specific provider is requested
    if (request.preferredProvider) {
      const preferred = this.getProvider(request.preferredProvider);
      if (preferred && preferred.enabled) {
        return preferred;
      }
    }

    // Find providers that match required capabilities
    if (
      request.requiredCapabilities &&
      request.requiredCapabilities.length > 0
    ) {
      candidates = Array.from(this.providers.values()).filter(
        (p) =>
          p.enabled &&
          request.requiredCapabilities!.every((cap) =>
            p.capabilities.includes(cap),
          ),
      );
    } else {
      // Default to chat-capable providers
      candidates = this.getProvidersForCapability('chat');
    }

    // Return highest priority available provider
    return candidates.length > 0 ? candidates[0] : null;
  }

  listProviders(): AiProvider[] {
    return Array.from(this.providers.values());
  }

  enableProvider(name: string): boolean {
    const provider = this.providers.get(name);
    if (provider) {
      provider.enabled = true;
      this.logger.debug(`Enabled AI provider: ${name}`);
      return true;
    }
    return false;
  }

  disableProvider(name: string): boolean {
    const provider = this.providers.get(name);
    if (provider) {
      provider.enabled = false;
      this.logger.debug(`Disabled AI provider: ${name}`);
      return true;
    }
    return false;
  }
}
