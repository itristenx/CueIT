import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SsoService {
  constructor(private prisma: PrismaService) {}

  async getSsoConfig() {
    // Get SSO configuration from database
    const configs = await this.prisma.configuration.findMany({
      where: {
        key: {
          in: [
            'ssoEnabled',
            'ssoProvider',
            'ssoSamlEntryPoint',
            'ssoSamlIssuer',
            'ssoSamlCallbackUrl',
            'ssoSamlCert',
            'ssoOidcDiscoveryUrl',
            'ssoOidcClientId',
            'ssoOidcClientSecret',
            'ssoOidcScope',
          ],
        },
      },
    });

    const configMap = configs.reduce(
      (acc, config) => {
        acc[config.key] = config.value;
        return acc;
      },
      {} as Record<string, string>,
    );

    return {
      enabled: configMap.ssoEnabled === 'true',
      provider: configMap.ssoProvider || 'saml',
      saml: {
        enabled: configMap.ssoProvider === 'saml',
        entryPoint: configMap.ssoSamlEntryPoint || '',
        issuer: configMap.ssoSamlIssuer || '',
        callbackUrl: configMap.ssoSamlCallbackUrl || '',
        cert: configMap.ssoSamlCert ? '***CONFIGURED***' : '',
      },
      oidc: {
        enabled: configMap.ssoProvider === 'oidc',
        discoveryUrl: configMap.ssoOidcDiscoveryUrl || '',
        clientId: configMap.ssoOidcClientId || '',
        clientSecret: configMap.ssoOidcClientSecret ? '***CONFIGURED***' : '',
        scope: configMap.ssoOidcScope || 'openid profile email',
      },
    };
  }

  async updateSsoConfig(updates: any) {
    // Update SSO configuration in database
    const flatUpdates = this.flattenSsoConfig(updates);

    for (const [key, value] of Object.entries(flatUpdates)) {
      await this.prisma.configuration.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    return { message: 'SSO configuration updated successfully' };
  }

  async getSsoAvailability() {
    const config = await this.getSsoConfig();

    if (!config.enabled) {
      return { available: false };
    }

    if (
      config.provider === 'saml' &&
      config.saml.entryPoint &&
      config.saml.issuer &&
      config.saml.callbackUrl
    ) {
      return { available: true, loginUrl: '/auth/saml' };
    }

    if (
      config.provider === 'oidc' &&
      config.oidc.discoveryUrl &&
      config.oidc.clientId
    ) {
      return { available: true, loginUrl: '/auth/oidc' };
    }

    return { available: false };
  }

  private flattenSsoConfig(config: any): Record<string, string> {
    const flattened: Record<string, string> = {};

    if (config.enabled !== undefined) {
      flattened.ssoEnabled = config.enabled ? 'true' : 'false';
    }

    if (config.provider !== undefined) {
      flattened.ssoProvider = config.provider;
    }

    if (config.saml) {
      if (config.saml.entryPoint !== undefined) {
        flattened.ssoSamlEntryPoint = config.saml.entryPoint;
      }
      if (config.saml.issuer !== undefined) {
        flattened.ssoSamlIssuer = config.saml.issuer;
      }
      if (config.saml.callbackUrl !== undefined) {
        flattened.ssoSamlCallbackUrl = config.saml.callbackUrl;
      }
      if (config.saml.cert !== undefined) {
        flattened.ssoSamlCert = config.saml.cert;
      }
    }

    if (config.oidc) {
      if (config.oidc.discoveryUrl !== undefined) {
        flattened.ssoOidcDiscoveryUrl = config.oidc.discoveryUrl;
      }
      if (config.oidc.clientId !== undefined) {
        flattened.ssoOidcClientId = config.oidc.clientId;
      }
      if (config.oidc.clientSecret !== undefined) {
        flattened.ssoOidcClientSecret = config.oidc.clientSecret;
      }
      if (config.oidc.scope !== undefined) {
        flattened.ssoOidcScope = config.oidc.scope;
      }
    }

    return flattened;
  }
}
