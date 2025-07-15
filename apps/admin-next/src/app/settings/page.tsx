'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Mail,
  Palette,
  Shield,
  Server,
  Users,
  Bell,
  Key,
  Database,
  Save,
  TestTube,
  CheckCircle,
  XCircle,
  Settings as SettingsIcon,
  Globe,
  Lock,
  Zap
} from 'lucide-react';

interface SystemSettings {
  general: {
    siteName: string;
    siteUrl: string;
    timezone: string;
    defaultLanguage: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
  };
  email: {
    enabled: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    smtpSecure: boolean;
    fromName: string;
    fromEmail: string;
  };
  security: {
    passwordMinLength: number;
    passwordRequireUppercase: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireSymbols: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    twoFactorEnabled: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    slackNotifications: boolean;
    webhookNotifications: boolean;
    ticketCreated: boolean;
    ticketUpdated: boolean;
    ticketClosed: boolean;
    escalationAlerts: boolean;
  };
  branding: {
    logo: string;
    darkLogo: string;
    primaryColor: string;
    secondaryColor: string;
    favicon: string;
    customCSS: string;
  };
  integrations: {
    sso: {
      enabled: boolean;
      provider: string;
      clientId: string;
      clientSecret: string;
      redirectUri: string;
    };
    ldap: {
      enabled: boolean;
      server: string;
      port: number;
      bindDn: string;
      bindPassword: string;
      searchBase: string;
    };
    slack: {
      enabled: boolean;
      botToken: string;
      signingSecret: string;
      channelId: string;
    };
  };
}

// Mock initial settings
const initialSettings: SystemSettings = {
  general: {
    siteName: 'CueIT Portal',
    siteUrl: 'https://your-company.com',
    timezone: 'America/New_York',
    defaultLanguage: 'en',
    maintenanceMode: false,
    registrationEnabled: true,
  },
  email: {
    enabled: true,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: 'noreply@company.com',
    smtpPassword: '',
    smtpSecure: true,
    fromName: 'CueIT Support',
    fromEmail: 'support@company.com',
  },
  security: {
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    twoFactorEnabled: false,
  },
  notifications: {
    emailNotifications: true,
    slackNotifications: false,
    webhookNotifications: false,
    ticketCreated: true,
    ticketUpdated: true,
    ticketClosed: true,
    escalationAlerts: true,
  },
  branding: {
    logo: '/logo.png',
    darkLogo: '/logo-dark.png',
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    favicon: '/favicon.ico',
    customCSS: '',
  },
  integrations: {
    sso: {
      enabled: false,
      provider: 'saml',
      clientId: '',
      clientSecret: '',
      redirectUri: '',
    },
    ldap: {
      enabled: false,
      server: 'ldap.company.com',
      port: 389,
      bindDn: '',
      bindPassword: '',
      searchBase: 'ou=users,dc=company,dc=com',
    },
    slack: {
      enabled: false,
      botToken: '',
      signingSecret: '',
      channelId: '',
    },
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testResults, setTestResults] = useState<{ [key: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState('general');

  const handleSettingChange = (category: keyof SystemSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleNestedSettingChange = (category: keyof SystemSettings, subcategory: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subcategory]: {
          ...(prev[category] as any)[subcategory],
          [field]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    console.log('Settings saved:', settings);
  };

  const testEmailConfiguration = async () => {
    setTestingEmail(true);
    // Simulate test email
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTestResults(prev => ({ ...prev, email: true }));
    setTestingEmail(false);
  };

  const testSlackIntegration = async () => {
    // Simulate Slack test
    await new Promise(resolve => setTimeout(resolve, 1500));
    setTestResults(prev => ({ ...prev, slack: settings.integrations.slack.enabled }));
  };

  const testLDAPConnection = async () => {
    // Simulate LDAP test
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTestResults(prev => ({ ...prev, ldap: settings.integrations.ldap.enabled }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Settings</h1>
          <p className="text-gray-600">Configure system-wide settings and integrations</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>General Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    value={settings.general.siteUrl}
                    onChange={(e) => handleSettingChange('general', 'siteUrl', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.general.timezone} onValueChange={(value) => handleSettingChange('general', 'timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="defaultLanguage">Default Language</Label>
                  <Select value={settings.general.defaultLanguage} onValueChange={(value) => handleSettingChange('general', 'defaultLanguage', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-gray-600">Enable maintenance mode to restrict access</p>
                  </div>
                  <Switch
                    checked={settings.general.maintenanceMode}
                    onCheckedChange={(checked: boolean) => handleSettingChange('general', 'maintenanceMode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>User Registration</Label>
                    <p className="text-sm text-gray-600">Allow new users to register accounts</p>
                  </div>
                  <Switch
                    checked={settings.general.registrationEnabled}
                    onCheckedChange={(checked: boolean) => handleSettingChange('general', 'registrationEnabled', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Email Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Email</Label>
                  <p className="text-sm text-gray-600">Enable email notifications and SMTP</p>
                </div>
                <Switch
                  checked={settings.email.enabled}
                  onCheckedChange={(checked: boolean) => handleSettingChange('email', 'enabled', checked)}
                />
              </div>
              
              {settings.email.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={settings.email.smtpHost}
                        onChange={(e) => handleSettingChange('email', 'smtpHost', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        value={settings.email.smtpPort}
                        onChange={(e) => handleSettingChange('email', 'smtpPort', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smtpUser">SMTP Username</Label>
                      <Input
                        id="smtpUser"
                        value={settings.email.smtpUser}
                        onChange={(e) => handleSettingChange('email', 'smtpUser', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpPassword">SMTP Password</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={settings.email.smtpPassword}
                        onChange={(e) => handleSettingChange('email', 'smtpPassword', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fromName">From Name</Label>
                      <Input
                        id="fromName"
                        value={settings.email.fromName}
                        onChange={(e) => handleSettingChange('email', 'fromName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fromEmail">From Email</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        value={settings.email.fromEmail}
                        onChange={(e) => handleSettingChange('email', 'fromEmail', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Use SSL/TLS</Label>
                      <p className="text-sm text-gray-600">Enable secure SMTP connection</p>
                    </div>
                    <Switch
                      checked={settings.email.smtpSecure}
                      onCheckedChange={(checked: boolean) => handleSettingChange('email', 'smtpSecure', checked)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={testEmailConfiguration}
                      disabled={testingEmail}
                      className="flex items-center space-x-2"
                    >
                      <TestTube className="h-4 w-4" />
                      <span>{testingEmail ? 'Testing...' : 'Test Email'}</span>
                    </Button>
                    {testResults.email !== undefined && (
                      <div className="flex items-center space-x-1">
                        {testResults.email ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">
                          {testResults.email ? 'Email test successful' : 'Email test failed'}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                  <Input
                    id="lockoutDuration"
                    type="number"
                    value={settings.security.lockoutDuration}
                    onChange={(e) => handleSettingChange('security', 'lockoutDuration', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Uppercase Letters</Label>
                    <p className="text-sm text-gray-600">Passwords must contain uppercase letters</p>
                  </div>
                  <Switch
                    checked={settings.security.passwordRequireUppercase}
                    onCheckedChange={(checked: boolean) => handleSettingChange('security', 'passwordRequireUppercase', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Numbers</Label>
                    <p className="text-sm text-gray-600">Passwords must contain numbers</p>
                  </div>
                  <Switch
                    checked={settings.security.passwordRequireNumbers}
                    onCheckedChange={(checked: boolean) => handleSettingChange('security', 'passwordRequireNumbers', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Symbols</Label>
                    <p className="text-sm text-gray-600">Passwords must contain special characters</p>
                  </div>
                  <Switch
                    checked={settings.security.passwordRequireSymbols}
                    onCheckedChange={(checked: boolean) => handleSettingChange('security', 'passwordRequireSymbols', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">Enable 2FA for enhanced security</p>
                  </div>
                  <Switch
                    checked={settings.security.twoFactorEnabled}
                    onCheckedChange={(checked: boolean) => handleSettingChange('security', 'twoFactorEnabled', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600">Send email notifications for events</p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked: boolean) => handleSettingChange('notifications', 'emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Slack Notifications</Label>
                    <p className="text-sm text-gray-600">Send notifications to Slack</p>
                  </div>
                  <Switch
                    checked={settings.notifications.slackNotifications}
                    onCheckedChange={(checked: boolean) => handleSettingChange('notifications', 'slackNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Webhook Notifications</Label>
                    <p className="text-sm text-gray-600">Send webhook notifications</p>
                  </div>
                  <Switch
                    checked={settings.notifications.webhookNotifications}
                    onCheckedChange={(checked: boolean) => handleSettingChange('notifications', 'webhookNotifications', checked)}
                  />
                </div>
              </div>
              <div className="border-t pt-4">
                <Label className="text-base font-medium">Event Notifications</Label>
                <div className="mt-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Ticket Created</Label>
                      <p className="text-sm text-gray-600">Notify when new tickets are created</p>
                    </div>
                    <Switch
                      checked={settings.notifications.ticketCreated}
                      onCheckedChange={(checked: boolean) => handleSettingChange('notifications', 'ticketCreated', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Ticket Updated</Label>
                      <p className="text-sm text-gray-600">Notify when tickets are updated</p>
                    </div>
                    <Switch
                      checked={settings.notifications.ticketUpdated}
                      onCheckedChange={(checked: boolean) => handleSettingChange('notifications', 'ticketUpdated', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Ticket Closed</Label>
                      <p className="text-sm text-gray-600">Notify when tickets are closed</p>
                    </div>
                    <Switch
                      checked={settings.notifications.ticketClosed}
                      onCheckedChange={(checked: boolean) => handleSettingChange('notifications', 'ticketClosed', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Escalation Alerts</Label>
                      <p className="text-sm text-gray-600">Notify when tickets are escalated</p>
                    </div>
                    <Switch
                      checked={settings.notifications.escalationAlerts}
                      onCheckedChange={(checked: boolean) => handleSettingChange('notifications', 'escalationAlerts', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Branding Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    value={settings.branding.logo}
                    onChange={(e) => handleSettingChange('branding', 'logo', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="darkLogo">Dark Mode Logo URL</Label>
                  <Input
                    id="darkLogo"
                    value={settings.branding.darkLogo}
                    onChange={(e) => handleSettingChange('branding', 'darkLogo', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <Input
                    id="primaryColor"
                    type="color"
                    value={settings.branding.primaryColor}
                    onChange={(e) => handleSettingChange('branding', 'primaryColor', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={settings.branding.secondaryColor}
                    onChange={(e) => handleSettingChange('branding', 'secondaryColor', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="favicon">Favicon URL</Label>
                <Input
                  id="favicon"
                  value={settings.branding.favicon}
                  onChange={(e) => handleSettingChange('branding', 'favicon', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="customCSS">Custom CSS</Label>
                <Textarea
                  id="customCSS"
                  value={settings.branding.customCSS}
                  onChange={(e) => handleSettingChange('branding', 'customCSS', e.target.value)}
                  placeholder="Enter custom CSS styles..."
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>SSO Integration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable SSO</Label>
                  <p className="text-sm text-gray-600">Enable single sign-on authentication</p>
                </div>
                <Switch
                  checked={settings.integrations.sso.enabled}
                  onCheckedChange={(checked: boolean) => handleNestedSettingChange('integrations', 'sso', 'enabled', checked)}
                />
              </div>
              
              {settings.integrations.sso.enabled && (
                <>
                  <div>
                    <Label>SSO Provider</Label>
                    <Select 
                      value={settings.integrations.sso.provider} 
                      onValueChange={(value) => handleNestedSettingChange('integrations', 'sso', 'provider', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="saml">SAML</SelectItem>
                        <SelectItem value="oidc">OpenID Connect</SelectItem>
                        <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clientId">Client ID</Label>
                      <Input
                        id="clientId"
                        value={settings.integrations.sso.clientId}
                        onChange={(e) => handleNestedSettingChange('integrations', 'sso', 'clientId', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientSecret">Client Secret</Label>
                      <Input
                        id="clientSecret"
                        type="password"
                        value={settings.integrations.sso.clientSecret}
                        onChange={(e) => handleNestedSettingChange('integrations', 'sso', 'clientSecret', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="redirectUri">Redirect URI</Label>
                    <Input
                      id="redirectUri"
                      value={settings.integrations.sso.redirectUri}
                      onChange={(e) => handleNestedSettingChange('integrations', 'sso', 'redirectUri', e.target.value)}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>LDAP Integration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable LDAP</Label>
                  <p className="text-sm text-gray-600">Enable LDAP directory integration</p>
                </div>
                <Switch
                  checked={settings.integrations.ldap.enabled}
                  onCheckedChange={(checked: boolean) => handleNestedSettingChange('integrations', 'ldap', 'enabled', checked)}
                />
              </div>
              
              {settings.integrations.ldap.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ldapServer">LDAP Server</Label>
                      <Input
                        id="ldapServer"
                        value={settings.integrations.ldap.server}
                        onChange={(e) => handleNestedSettingChange('integrations', 'ldap', 'server', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ldapPort">Port</Label>
                      <Input
                        id="ldapPort"
                        type="number"
                        value={settings.integrations.ldap.port}
                        onChange={(e) => handleNestedSettingChange('integrations', 'ldap', 'port', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bindDn">Bind DN</Label>
                    <Input
                      id="bindDn"
                      value={settings.integrations.ldap.bindDn}
                      onChange={(e) => handleNestedSettingChange('integrations', 'ldap', 'bindDn', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bindPassword">Bind Password</Label>
                    <Input
                      id="bindPassword"
                      type="password"
                      value={settings.integrations.ldap.bindPassword}
                      onChange={(e) => handleNestedSettingChange('integrations', 'ldap', 'bindPassword', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="searchBase">Search Base</Label>
                    <Input
                      id="searchBase"
                      value={settings.integrations.ldap.searchBase}
                      onChange={(e) => handleNestedSettingChange('integrations', 'ldap', 'searchBase', e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={testLDAPConnection}
                    className="flex items-center space-x-2"
                  >
                    <TestTube className="h-4 w-4" />
                    <span>Test LDAP Connection</span>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-lg">💬</span>
                <span>Slack Integration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Slack</Label>
                  <p className="text-sm text-gray-600">Enable Slack bot integration</p>
                </div>
                <Switch
                  checked={settings.integrations.slack.enabled}
                  onCheckedChange={(checked: boolean) => handleNestedSettingChange('integrations', 'slack', 'enabled', checked)}
                />
              </div>
              
              {settings.integrations.slack.enabled && (
                <>
                  <div>
                    <Label htmlFor="botToken">Bot Token</Label>
                    <Input
                      id="botToken"
                      type="password"
                      value={settings.integrations.slack.botToken}
                      onChange={(e) => handleNestedSettingChange('integrations', 'slack', 'botToken', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="signingSecret">Signing Secret</Label>
                    <Input
                      id="signingSecret"
                      type="password"
                      value={settings.integrations.slack.signingSecret}
                      onChange={(e) => handleNestedSettingChange('integrations', 'slack', 'signingSecret', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="channelId">Default Channel ID</Label>
                    <Input
                      id="channelId"
                      value={settings.integrations.slack.channelId}
                      onChange={(e) => handleNestedSettingChange('integrations', 'slack', 'channelId', e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={testSlackIntegration}
                    className="flex items-center space-x-2"
                  >
                    <TestTube className="h-4 w-4" />
                    <span>Test Slack Integration</span>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
