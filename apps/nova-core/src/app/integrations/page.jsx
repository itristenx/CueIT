'use client';
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Settings, CheckCircle, XCircle, AlertTriangle, RefreshCw, TestTube, Mail, MessageSquare, Globe, Database, Cloud, Shield, Key, Link, Eye, EyeOff } from 'lucide-react';
const integrationTypes = [
    {
        id: 'slack',
        name: 'Slack',
        icon: MessageSquare,
        description: 'Send notifications and create tickets from Slack',
        color: 'bg-purple-100 text-purple-800'
    },
    {
        id: 'teams',
        name: 'Microsoft Teams',
        icon: MessageSquare,
        description: 'Teams integration for notifications',
        color: 'bg-blue-100 text-blue-800'
    },
    {
        id: 'smtp',
        name: 'Email (SMTP)',
        icon: Mail,
        description: 'Email notifications and ticket creation',
        color: 'bg-green-100 text-green-800'
    },
    {
        id: 'helpscout',
        name: 'HelpScout',
        icon: Globe,
        description: 'Import data from HelpScout',
        color: 'bg-orange-100 text-orange-800'
    },
    {
        id: 'servicenow',
        name: 'ServiceNow',
        icon: Database,
        description: 'ServiceNow integration for enterprise',
        color: 'bg-red-100 text-red-800'
    },
    {
        id: 'ldap',
        name: 'LDAP/Active Directory',
        icon: Shield,
        description: 'Directory integration for user management',
        color: 'bg-indigo-100 text-indigo-800'
    },
    {
        id: 'saml',
        name: 'SAML SSO',
        icon: Key,
        description: 'Single Sign-On with SAML',
        color: 'bg-yellow-100 text-yellow-800'
    },
    {
        id: 'oauth',
        name: 'OAuth 2.0',
        icon: Link,
        description: 'OAuth authentication provider',
        color: 'bg-gray-100 text-gray-800'
    }
];
export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeIntegration, setActiveIntegration] = useState(null);
    const [showPasswords, setShowPasswords] = useState(false);
    const [testingIntegration, setTestingIntegration] = useState(null);
    useEffect(() => {
        fetchIntegrations();
    }, []);
    const fetchIntegrations = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/v2/integrations');
            if (!response.ok) {
                throw new Error('Failed to fetch integrations');
            }
            const result = await response.json();
            setIntegrations(result);
        }
        catch (err) {
            console.error('Integrations fetch error:', err);
            setError('Failed to load integrations');
            // Mock data for development
            setIntegrations([
                {
                    id: '1',
                    name: 'Slack Workspace',
                    type: 'slack',
                    status: 'connected',
                    description: 'Send notifications and create tickets from Slack',
                    icon: MessageSquare,
                    config: {
                        botToken: 'xoxb-****',
                        signingSecret: '****',
                        channel: '#support'
                    },
                    lastSync: '2024-01-15T10:30:00Z',
                    createdAt: '2024-01-01T09:00:00Z',
                    updatedAt: '2024-01-15T10:30:00Z'
                },
                {
                    id: '2',
                    name: 'Company SMTP',
                    type: 'smtp',
                    status: 'connected',
                    description: 'Email notifications and ticket creation',
                    icon: Mail,
                    config: {
                        host: 'smtp.company.com',
                        port: 587,
                        secure: true,
                        user: 'support@company.com',
                        password: '****'
                    },
                    lastSync: '2024-01-15T11:00:00Z',
                    createdAt: '2024-01-01T09:00:00Z',
                    updatedAt: '2024-01-15T11:00:00Z'
                },
                {
                    id: '3',
                    name: 'Active Directory',
                    type: 'ldap',
                    status: 'error',
                    description: 'Directory integration for user management',
                    icon: Shield,
                    config: {
                        host: 'ldap.company.com',
                        port: 389,
                        baseDN: 'DC=company,DC=com',
                        bindDN: 'CN=service,DC=company,DC=com',
                        bindPassword: '****'
                    },
                    createdAt: '2024-01-01T09:00:00Z',
                    updatedAt: '2024-01-14T16:00:00Z'
                }
            ]);
        }
        finally {
            setLoading(false);
        }
    };
    const handleTestIntegration = async (integrationId) => {
        setTestingIntegration(integrationId);
        try {
            const response = await fetch(`/api/v2/integrations/${integrationId}/test`, {
                method: 'POST'
            });
            if (!response.ok) {
                throw new Error('Integration test failed');
            }
            // Update integration status
            setIntegrations(prev => prev.map(integration => integration.id === integrationId
                ? Object.assign(Object.assign({}, integration), { status: 'connected' }) : integration));
            alert('Integration test successful!');
        }
        catch (err) {
            console.error('Integration test error:', err);
            alert('Integration test failed');
        }
        finally {
            setTestingIntegration(null);
        }
    };
    const handleSaveIntegration = async (integration) => {
        try {
            const response = await fetch(`/api/v2/integrations/${integration.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(integration),
            });
            if (!response.ok) {
                throw new Error('Failed to save integration');
            }
            setActiveIntegration(null);
            fetchIntegrations();
            alert('Integration saved successfully!');
        }
        catch (err) {
            console.error('Save integration error:', err);
            alert('Failed to save integration');
        }
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case 'connected':
                return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
            case 'disconnected':
                return <Badge variant="outline">Disconnected</Badge>;
            case 'error':
                return <Badge variant="destructive">Error</Badge>;
            case 'testing':
                return <Badge variant="secondary">Testing</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'connected':
                return <CheckCircle className="h-4 w-4 text-green-500"/>;
            case 'disconnected':
                return <XCircle className="h-4 w-4 text-gray-500"/>;
            case 'error':
                return <AlertTriangle className="h-4 w-4 text-red-500"/>;
            case 'testing':
                return <TestTube className="h-4 w-4 text-blue-500"/>;
            default:
                return <AlertTriangle className="h-4 w-4 text-gray-500"/>;
        }
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };
    if (loading) {
        return (<AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>);
    }
    if (error) {
        return (<AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2"/>
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchIntegrations} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </AdminLayout>);
    }
    return (<AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Integrations</h1>
            <p className="text-muted-foreground">
              Connect with third-party services and tools
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={fetchIntegrations}>
              <RefreshCw className="h-4 w-4 mr-2"/>
              Refresh
            </Button>
          </div>
        </div>

        <Separator />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{integrations.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connected</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {integrations.filter(i => i.status === 'connected').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Errors</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {integrations.filter(i => i.status === 'error').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Cloud className="h-4 w-4 text-muted-foreground"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {integrationTypes.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Integrations */}
        <Card>
          <CardHeader>
            <CardTitle>Available Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {integrationTypes.map((type) => {
            const Icon = type.icon;
            const existing = integrations.find(i => i.type === type.id);
            return (<Card key={type.id} className="border-2 border-gray-200 hover:border-gray-300 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Icon className="h-5 w-5"/>
                          <CardTitle className="text-sm">{type.name}</CardTitle>
                        </div>
                        {existing && getStatusIcon(existing.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {type.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge className={type.color}>{type.id}</Badge>
                        {existing ? (<Button variant="outline" size="sm" onClick={() => setActiveIntegration(existing)}>
                            <Settings className="h-4 w-4 mr-1"/>
                            Configure
                          </Button>) : (<Button size="sm">
                            <Link className="h-4 w-4 mr-1"/>
                            Connect
                          </Button>)}
                      </div>
                    </CardContent>
                  </Card>);
        })}
            </div>
          </CardContent>
        </Card>

        {/* Active Integrations */}
        <Card>
          <CardHeader>
            <CardTitle>Active Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrations.map((integration) => {
            const Icon = integration.icon;
            return (<div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Icon className="h-8 w-8 text-gray-600"/>
                      <div>
                        <div className="font-medium">{integration.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {integration.description}
                        </div>
                        {integration.lastSync && (<div className="text-xs text-muted-foreground">
                            Last sync: {formatDate(integration.lastSync)}
                          </div>)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(integration.status)}
                      <Button variant="outline" size="sm" onClick={() => handleTestIntegration(integration.id)} disabled={testingIntegration === integration.id}>
                        {testingIntegration === integration.id ? (<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"/>) : (<TestTube className="h-4 w-4 mr-2"/>)}
                        Test
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setActiveIntegration(integration)}>
                        <Settings className="h-4 w-4 mr-2"/>
                        Configure
                      </Button>
                    </div>
                  </div>);
        })}
            </div>
          </CardContent>
        </Card>

        {/* Configuration Modal */}
        {activeIntegration && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2"/>
                  Configure {activeIntegration.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Slack Configuration */}
                {activeIntegration.type === 'slack' && (<div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="botToken">Bot Token</Label>
                      <div className="relative">
                        <Input id="botToken" type={showPasswords ? "text" : "password"} value={activeIntegration.config.botToken || ''} onChange={(e) => setActiveIntegration(Object.assign(Object.assign({}, activeIntegration), { config: Object.assign(Object.assign({}, activeIntegration.config), { botToken: e.target.value }) }))} placeholder="xoxb-your-bot-token"/>
                        <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPasswords(!showPasswords)}>
                          {showPasswords ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signingSecret">Signing Secret</Label>
                      <Input id="signingSecret" type={showPasswords ? "text" : "password"} value={activeIntegration.config.signingSecret || ''} onChange={(e) => setActiveIntegration(Object.assign(Object.assign({}, activeIntegration), { config: Object.assign(Object.assign({}, activeIntegration.config), { signingSecret: e.target.value }) }))} placeholder="your-signing-secret"/>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="channel">Default Channel</Label>
                      <Input id="channel" value={activeIntegration.config.channel || ''} onChange={(e) => setActiveIntegration(Object.assign(Object.assign({}, activeIntegration), { config: Object.assign(Object.assign({}, activeIntegration.config), { channel: e.target.value }) }))} placeholder="#support"/>
                    </div>
                  </div>)}

                {/* SMTP Configuration */}
                {activeIntegration.type === 'smtp' && (<div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="host">SMTP Host</Label>
                        <Input id="host" value={activeIntegration.config.host || ''} onChange={(e) => setActiveIntegration(Object.assign(Object.assign({}, activeIntegration), { config: Object.assign(Object.assign({}, activeIntegration.config), { host: e.target.value }) }))} placeholder="smtp.gmail.com"/>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="port">Port</Label>
                        <Input id="port" type="number" value={activeIntegration.config.port || ''} onChange={(e) => setActiveIntegration(Object.assign(Object.assign({}, activeIntegration), { config: Object.assign(Object.assign({}, activeIntegration.config), { port: parseInt(e.target.value) }) }))} placeholder="587"/>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="user">Username</Label>
                      <Input id="user" value={activeIntegration.config.user || ''} onChange={(e) => setActiveIntegration(Object.assign(Object.assign({}, activeIntegration), { config: Object.assign(Object.assign({}, activeIntegration.config), { user: e.target.value }) }))} placeholder="support@company.com"/>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input id="password" type={showPasswords ? "text" : "password"} value={activeIntegration.config.password || ''} onChange={(e) => setActiveIntegration(Object.assign(Object.assign({}, activeIntegration), { config: Object.assign(Object.assign({}, activeIntegration.config), { password: e.target.value }) }))} placeholder="your-password"/>
                        <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPasswords(!showPasswords)}>
                          {showPasswords ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="secure" checked={activeIntegration.config.secure || false} onChange={(e) => setActiveIntegration(Object.assign(Object.assign({}, activeIntegration), { config: Object.assign(Object.assign({}, activeIntegration.config), { secure: e.target.checked }) }))} className="rounded border-gray-300"/>
                      <Label htmlFor="secure">Use SSL/TLS</Label>
                    </div>
                  </div>)}

                {/* LDAP Configuration */}
                {activeIntegration.type === 'ldap' && (<div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="ldapHost">LDAP Host</Label>
                        <Input id="ldapHost" value={activeIntegration.config.host || ''} onChange={(e) => setActiveIntegration(Object.assign(Object.assign({}, activeIntegration), { config: Object.assign(Object.assign({}, activeIntegration.config), { host: e.target.value }) }))} placeholder="ldap.company.com"/>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ldapPort">Port</Label>
                        <Input id="ldapPort" type="number" value={activeIntegration.config.port || ''} onChange={(e) => setActiveIntegration(Object.assign(Object.assign({}, activeIntegration), { config: Object.assign(Object.assign({}, activeIntegration.config), { port: parseInt(e.target.value) }) }))} placeholder="389"/>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="baseDN">Base DN</Label>
                      <Input id="baseDN" value={activeIntegration.config.baseDN || ''} onChange={(e) => setActiveIntegration(Object.assign(Object.assign({}, activeIntegration), { config: Object.assign(Object.assign({}, activeIntegration.config), { baseDN: e.target.value }) }))} placeholder="DC=company,DC=com"/>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bindDN">Bind DN</Label>
                      <Input id="bindDN" value={activeIntegration.config.bindDN || ''} onChange={(e) => setActiveIntegration(Object.assign(Object.assign({}, activeIntegration), { config: Object.assign(Object.assign({}, activeIntegration.config), { bindDN: e.target.value }) }))} placeholder="CN=service,DC=company,DC=com"/>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bindPassword">Bind Password</Label>
                      <div className="relative">
                        <Input id="bindPassword" type={showPasswords ? "text" : "password"} value={activeIntegration.config.bindPassword || ''} onChange={(e) => setActiveIntegration(Object.assign(Object.assign({}, activeIntegration), { config: Object.assign(Object.assign({}, activeIntegration.config), { bindPassword: e.target.value }) }))} placeholder="service-account-password"/>
                        <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPasswords(!showPasswords)}>
                          {showPasswords ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                        </Button>
                      </div>
                    </div>
                  </div>)}

                <div className="flex items-center justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setActiveIntegration(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleTestIntegration(activeIntegration.id)}>
                    Test Connection
                  </Button>
                  <Button onClick={() => handleSaveIntegration(activeIntegration)}>
                    Save Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>)}
      </div>
    </AdminLayout>);
}
