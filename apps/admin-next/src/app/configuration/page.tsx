'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Mail, 
  Globe, 
  Shield, 
  Database, 
  Bell,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';

interface ConfigurationData {
  general: {
    siteName: string;
    siteUrl: string;
    companyName: string;
    supportEmail: string;
    timeZone: string;
    language: string;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    smtpSecure: boolean;
    fromEmail: string;
    fromName: string;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    enableTwoFactor: boolean;
  };
  features: {
    enableRegistration: boolean;
    enableKiosks: boolean;
    enableSlackIntegration: boolean;
    enableNotifications: boolean;
    enableAnalytics: boolean;
  };
}

export default function ConfigurationPage() {
  const [config, setConfig] = useState<ConfigurationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/v2/configuration');
      if (!response.ok) {
        throw new Error('Failed to fetch configuration');
      }
      const result = await response.json();
      setConfig(result);
    } catch (err) {
      console.error('Configuration fetch error:', err);
      setError('Failed to load configuration');
      
      // Mock data for development
      setConfig({
        general: {
          siteName: 'QueueIT Support',
          siteUrl: 'https://support.company.com',
          companyName: 'Company Inc.',
          supportEmail: 'support@company.com',
          timeZone: 'America/New_York',
          language: 'en'
        },
        email: {
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          smtpUser: 'support@company.com',
          smtpPassword: '••••••••',
          smtpSecure: true,
          fromEmail: 'support@company.com',
          fromName: 'QueueIT Support'
        },
        security: {
          sessionTimeout: 30,
          maxLoginAttempts: 3,
          passwordMinLength: 8,
          requireUppercase: true,
          requireNumbers: true,
          requireSpecialChars: false,
          enableTwoFactor: false
        },
        features: {
          enableRegistration: true,
          enableKiosks: true,
          enableSlackIntegration: false,
          enableNotifications: true,
          enableAnalytics: true
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch('/api/v2/configuration', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }
      
      // Show success message
      alert('Configuration saved successfully!');
    } catch (err) {
      console.error('Configuration save error:', err);
      setError('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section: keyof ConfigurationData, field: string, value: any) => {
    setConfig(prev => prev ? {
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    } : null);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'features', label: 'Features', icon: Database }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchConfiguration} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Configuration</h1>
            <p className="text-muted-foreground">
              Manage system settings and preferences
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={fetchConfiguration}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        <Separator />

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center space-x-2"
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Button>
            );
          })}
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={config?.general.siteName || ''}
                    onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                    placeholder="QueueIT Support"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    value={config?.general.siteUrl || ''}
                    onChange={(e) => handleInputChange('general', 'siteUrl', e.target.value)}
                    placeholder="https://support.company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={config?.general.companyName || ''}
                    onChange={(e) => handleInputChange('general', 'companyName', e.target.value)}
                    placeholder="Company Inc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={config?.general.supportEmail || ''}
                    onChange={(e) => handleInputChange('general', 'supportEmail', e.target.value)}
                    placeholder="support@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeZone">Time Zone</Label>
                  <Select 
                    value={config?.general.timeZone || ''} 
                    onValueChange={(value) => handleInputChange('general', 'timeZone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={config?.general.language || ''} 
                    onValueChange={(value) => handleInputChange('general', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
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
            </CardContent>
          </Card>
        )}

        {/* Email Settings */}
        {activeTab === 'email' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Email Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={config?.email.smtpHost || ''}
                    onChange={(e) => handleInputChange('email', 'smtpHost', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={config?.email.smtpPort || ''}
                    onChange={(e) => handleInputChange('email', 'smtpPort', parseInt(e.target.value))}
                    placeholder="587"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input
                    id="smtpUser"
                    value={config?.email.smtpUser || ''}
                    onChange={(e) => handleInputChange('email', 'smtpUser', e.target.value)}
                    placeholder="support@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <div className="relative">
                    <Input
                      id="smtpPassword"
                      type={showPasswords ? "text" : "password"}
                      value={config?.email.smtpPassword || ''}
                      onChange={(e) => handleInputChange('email', 'smtpPassword', e.target.value)}
                      placeholder="••••••••"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={config?.email.fromEmail || ''}
                    onChange={(e) => handleInputChange('email', 'fromEmail', e.target.value)}
                    placeholder="support@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={config?.email.fromName || ''}
                    onChange={(e) => handleInputChange('email', 'fromName', e.target.value)}
                    placeholder="QueueIT Support"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="smtpSecure"
                  checked={config?.email.smtpSecure || false}
                  onChange={(e) => handleInputChange('email', 'smtpSecure', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="smtpSecure">Use SSL/TLS</Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={config?.security.sessionTimeout || ''}
                    onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    placeholder="30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={config?.security.maxLoginAttempts || ''}
                    onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    placeholder="3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Password Min Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={config?.security.passwordMinLength || ''}
                    onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
                    placeholder="8"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requireUppercase"
                    checked={config?.security.requireUppercase || false}
                    onChange={(e) => handleInputChange('security', 'requireUppercase', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="requireUppercase">Require uppercase letters</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requireNumbers"
                    checked={config?.security.requireNumbers || false}
                    onChange={(e) => handleInputChange('security', 'requireNumbers', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="requireNumbers">Require numbers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requireSpecialChars"
                    checked={config?.security.requireSpecialChars || false}
                    onChange={(e) => handleInputChange('security', 'requireSpecialChars', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="requireSpecialChars">Require special characters</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enableTwoFactor"
                    checked={config?.security.enableTwoFactor || false}
                    onChange={(e) => handleInputChange('security', 'enableTwoFactor', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="enableTwoFactor">Enable two-factor authentication</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        {activeTab === 'features' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Feature Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableRegistration">User Registration</Label>
                    <p className="text-sm text-muted-foreground">Allow users to create accounts</p>
                  </div>
                  <input
                    type="checkbox"
                    id="enableRegistration"
                    checked={config?.features.enableRegistration || false}
                    onChange={(e) => handleInputChange('features', 'enableRegistration', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableKiosks">Kiosk System</Label>
                    <p className="text-sm text-muted-foreground">Enable kiosk management</p>
                  </div>
                  <input
                    type="checkbox"
                    id="enableKiosks"
                    checked={config?.features.enableKiosks || false}
                    onChange={(e) => handleInputChange('features', 'enableKiosks', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableSlackIntegration">Slack Integration</Label>
                    <p className="text-sm text-muted-foreground">Enable Slack notifications</p>
                  </div>
                  <input
                    type="checkbox"
                    id="enableSlackIntegration"
                    checked={config?.features.enableSlackIntegration || false}
                    onChange={(e) => handleInputChange('features', 'enableSlackIntegration', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send email notifications</p>
                  </div>
                  <input
                    type="checkbox"
                    id="enableNotifications"
                    checked={config?.features.enableNotifications || false}
                    onChange={(e) => handleInputChange('features', 'enableNotifications', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableAnalytics">Analytics</Label>
                    <p className="text-sm text-muted-foreground">Enable analytics and reporting</p>
                  </div>
                  <input
                    type="checkbox"
                    id="enableAnalytics"
                    checked={config?.features.enableAnalytics || false}
                    onChange={(e) => handleInputChange('features', 'enableAnalytics', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
