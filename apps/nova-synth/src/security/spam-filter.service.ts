import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';

interface RateLimitEntry {
  count: number;
  firstRequest: Date;
  lastRequest: Date;
  blocked: boolean;
  blockUntil?: Date;
}

interface SpamPattern {
  pattern: string;
  type: 'email' | 'subject' | 'body';
  action: 'block' | 'flag' | 'quarantine';
  weight: number;
}

@Injectable()
export class SpamFilterService {
  private readonly logger = new Logger(SpamFilterService.name);
  private readonly rateLimitMap = new Map<string, RateLimitEntry>();
  private readonly spamPatterns: SpamPattern[] = [
    {
      pattern: 'viagra|cialis|casino|lottery|winner',
      type: 'body',
      action: 'block',
      weight: 10,
    },
    {
      pattern: 'congratulations.*won.*money',
      type: 'body',
      action: 'block',
      weight: 8,
    },
    { pattern: '\\$\\d+.*free.*now', type: 'body', action: 'flag', weight: 5 },
    {
      pattern: 'click.*here.*immediately',
      type: 'body',
      action: 'flag',
      weight: 4,
    },
    {
      pattern: 'urgent.*action.*required',
      type: 'subject',
      action: 'flag',
      weight: 3,
    },
    {
      pattern: 'limited.*time.*offer',
      type: 'subject',
      action: 'flag',
      weight: 3,
    },
    { pattern: '^test(ing)?$', type: 'subject', action: 'flag', weight: 2 },
    {
      pattern: 'aaaaaa|bbbbbb|cccccc',
      type: 'body',
      action: 'flag',
      weight: 4,
    },
    { pattern: '^.{500,}$', type: 'body', action: 'flag', weight: 2 }, // Very long messages
  ];

  constructor(private configService: ConfigService) {}

  /**
   * Check if a request should be blocked due to rate limiting
   */
  checkRateLimit(
    identifier: string,
    maxRequests: number = 10,
    windowMinutes: number = 60,
  ): {
    allowed: boolean;
    remaining: number;
    resetTime: Date;
  } {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);

    let entry = this.rateLimitMap.get(identifier);

    if (!entry) {
      entry = {
        count: 1,
        firstRequest: now,
        lastRequest: now,
        blocked: false,
      };
      this.rateLimitMap.set(identifier, entry);

      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: new Date(now.getTime() + windowMinutes * 60 * 1000),
      };
    }

    // Check if we're still in the block period
    if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockUntil,
      };
    }

    // Reset if window has passed
    if (entry.firstRequest < windowStart) {
      entry.count = 1;
      entry.firstRequest = now;
      entry.lastRequest = now;
      entry.blocked = false;
      entry.blockUntil = undefined;

      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: new Date(now.getTime() + windowMinutes * 60 * 1000),
      };
    }

    // Increment count
    entry.count++;
    entry.lastRequest = now;

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      entry.blocked = true;
      entry.blockUntil = new Date(now.getTime() + windowMinutes * 60 * 1000);

      this.logger.warn(
        `Rate limit exceeded for ${identifier}. Count: ${entry.count}, Max: ${maxRequests}`,
      );

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockUntil,
      };
    }

    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetTime: new Date(
        entry.firstRequest.getTime() + windowMinutes * 60 * 1000,
      ),
    };
  }

  /**
   * Analyze content for spam patterns
   */
  analyzeContent(content: {
    subject?: string;
    body?: string;
    email?: string;
  }): {
    isSpam: boolean;
    spamScore: number;
    matchedPatterns: string[];
    action: 'allow' | 'flag' | 'quarantine' | 'block';
  } {
    let spamScore = 0;
    const matchedPatterns: string[] = [];
    let highestAction: 'allow' | 'flag' | 'quarantine' | 'block' = 'allow';

    for (const pattern of this.spamPatterns) {
      const regex = new RegExp(pattern.pattern, 'i');
      let textToCheck = '';

      switch (pattern.type) {
        case 'email':
          textToCheck = content.email || '';
          break;
        case 'subject':
          textToCheck = content.subject || '';
          break;
        case 'body':
          textToCheck = content.body || '';
          break;
      }

      if (regex.test(textToCheck)) {
        spamScore += pattern.weight;
        matchedPatterns.push(pattern.pattern);

        // Determine the most severe action
        if (pattern.action === 'block') {
          highestAction = 'block';
        } else if (
          pattern.action === 'quarantine' &&
          highestAction !== 'block'
        ) {
          highestAction = 'quarantine';
        } else if (pattern.action === 'flag' && highestAction === 'allow') {
          highestAction = 'flag';
        }
      }
    }

    // Additional heuristics
    if (content.body) {
      // Check for excessive special characters
      const specialCharRatio =
        (content.body.match(/[!@#$%^&*()]/g) || []).length /
        content.body.length;
      if (specialCharRatio > 0.1) {
        spamScore += 3;
        matchedPatterns.push('excessive_special_chars');
      }

      // Check for excessive uppercase
      const uppercaseRatio =
        (content.body.match(/[A-Z]/g) || []).length / content.body.length;
      if (uppercaseRatio > 0.5 && content.body.length > 20) {
        spamScore += 2;
        matchedPatterns.push('excessive_uppercase');
      }

      // Check for repeated characters
      if (/(.)\1{4,}/.test(content.body)) {
        spamScore += 3;
        matchedPatterns.push('repeated_characters');
      }
    }

    // Determine final action based on score
    let finalAction = highestAction;
    if (spamScore >= 10) {
      finalAction = 'block';
    } else if (spamScore >= 6) {
      finalAction = 'quarantine';
    } else if (spamScore >= 3) {
      finalAction = 'flag';
    }

    if (matchedPatterns.length > 0) {
      this.logger.warn(
        `Spam detected. Score: ${spamScore}, Patterns: ${matchedPatterns.join(', ')}, Action: ${finalAction}`,
      );
    }

    return {
      isSpam: spamScore >= 3,
      spamScore,
      matchedPatterns,
      action: finalAction,
    };
  }

  /**
   * Check if an IP address is in a suspicious range
   */
  checkIPReputation(ip: string): {
    isSuspicious: boolean;
    reason?: string;
  } {
    // Check for common spam IP ranges (this is a simplified version)
    const suspiciousRanges = [
      /^192\.168\./, // Private networks shouldn't be sending external requests
      /^10\./, // Private networks
      /^172\.(1[6-9]|2[0-9]|3[01])\./, // Private networks
      /^127\./, // Loopback
      /^169\.254\./, // Link-local
    ];

    for (const range of suspiciousRanges) {
      if (range.test(ip)) {
        return {
          isSuspicious: true,
          reason: 'private_ip_range',
        };
      }
    }

    // In a real implementation, you would check against:
    // - Known spam IP databases
    // - Geolocation restrictions
    // - VPN/proxy detection services
    // - Tor exit nodes

    return { isSuspicious: false };
  }

  /**
   * Comprehensive spam check for tickets
   */
  checkTicketSpam(ticketData: {
    title: string;
    description: string;
    submitterEmail: string;
    submitterIP?: string;
    submitterIdentifier: string;
  }): {
    allowed: boolean;
    reason?: string;
    action: 'allow' | 'flag' | 'quarantine' | 'block';
    metadata: {
      rateLimit: any;
      contentAnalysis: any;
      ipCheck: any;
    };
  } {
    // Check rate limiting
    const rateLimitResult = this.checkRateLimit(
      ticketData.submitterIdentifier,
      5,
      60,
    );

    if (!rateLimitResult.allowed) {
      return {
        allowed: false,
        reason: 'rate_limit_exceeded',
        action: 'block',
        metadata: {
          rateLimit: rateLimitResult,
          contentAnalysis: null,
          ipCheck: null,
        },
      };
    }

    // Check content for spam
    const contentAnalysis = this.analyzeContent({
      subject: ticketData.title,
      body: ticketData.description,
      email: ticketData.submitterEmail,
    });

    // Check IP reputation if available
    let ipCheck = { isSuspicious: false };
    if (ticketData.submitterIP) {
      ipCheck = this.checkIPReputation(ticketData.submitterIP);
    }

    // Determine final action
    let finalAction = contentAnalysis.action;

    if (ipCheck.isSuspicious) {
      finalAction = finalAction === 'allow' ? 'flag' : finalAction;
    }

    const allowed = finalAction === 'allow' || finalAction === 'flag';

    return {
      allowed,
      reason: !allowed ? 'spam_detected' : undefined,
      action: finalAction,
      metadata: {
        rateLimit: rateLimitResult,
        contentAnalysis,
        ipCheck,
      },
    };
  }

  /**
   * Clean up old rate limit entries
   */
  @Cron(CronExpression.EVERY_HOUR)
  cleanupRateLimits() {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    let cleanedUp = 0;

    for (const [key, entry] of this.rateLimitMap.entries()) {
      if (entry.lastRequest < cutoff) {
        this.rateLimitMap.delete(key);
        cleanedUp++;
      }
    }

    if (cleanedUp > 0) {
      this.logger.log(`Cleaned up ${cleanedUp} old rate limit entries`);
    }
  }

  /**
   * Get current rate limit status for debugging
   */
  getRateLimitStatus(): {
    totalEntries: number;
    blockedEntries: number;
    entries: Array<{
      identifier: string;
      count: number;
      blocked: boolean;
      lastRequest: Date;
    }>;
  } {
    const entries = Array.from(this.rateLimitMap.entries()).map(
      ([key, entry]) => ({
        identifier: key,
        count: entry.count,
        blocked: entry.blocked,
        lastRequest: entry.lastRequest,
      }),
    );

    return {
      totalEntries: this.rateLimitMap.size,
      blockedEntries: entries.filter((e) => e.blocked).length,
      entries,
    };
  }
}
