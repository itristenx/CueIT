'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { AdminLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  Plus, 
  Send, 
  Edit, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  MessageSquare,
  Users,
  Calendar,
  Eye,
  Settings
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  recipients: string[];
  channels: string[];
  status: 'draft' | 'sent' | 'scheduled' | 'failed';
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'email' | 'slack' | 'system';
  variables: string[];
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('notifications');
  const [showComposer, setShowComposer] = useState(false);

  const [composer, setComposer] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    recipients: 'all',
    channels: ['email'],
    schedule: false,
    scheduledAt: ''
  });

  useEffect(() => {
    fetchNotifications();
    fetchTemplates();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiRequest('/api/v2/notifications');
      setNotifications(result);
    } catch (err) {
      console.error('Notifications fetch error:', err);
      setError('Failed to load notifications');
      
      // Mock data for development
      setNotifications([
        {
          id: '1',
          title: 'System Maintenance Scheduled',
          message: 'The system will be under maintenance from 2:00 AM to 4:00 AM tomorrow.',
          type: 'warning',
          recipients: ['all'],
          channels: ['email', 'slack'],
          status: 'sent',
          sentAt: '2024-01-15T10:30:00Z',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          title: 'New Feature Released',
          message: 'We have released a new feature for better ticket management.',
          type: 'success',
          recipients: ['admins', 'technicians'],
          channels: ['email'],
          status: 'sent',
          sentAt: '2024-01-14T14:20:00Z',
          createdAt: '2024-01-14T14:00:00Z',
          updatedAt: '2024-01-14T14:20:00Z'
        },
        {
          id: '3',
          title: 'Security Alert',
          message: 'Multiple failed login attempts detected. Please review security logs.',
          type: 'error',
          recipients: ['admins'],
          channels: ['email', 'slack'],
          status: 'scheduled',
          scheduledAt: '2024-01-16T09:00:00Z',
          createdAt: '2024-01-15T16:00:00Z',
          updatedAt: '2024-01-15T16:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/v2/notifications/templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      const result = await response.json();
      setTemplates(result);
    } catch (err) {
      console.error('Templates fetch error:', err);
      
      // Mock data for development
      setTemplates([
        {
          id: '1',
          name: 'Welcome Email',
          subject: 'Welcome to Nova Universe Support',
          body: 'Welcome {{name}}, your account has been created successfully.',
          type: 'email',
          variables: ['name', 'email']
        },
        {
          id: '2',
          name: 'Ticket Created',
          subject: 'Ticket #{{ticketId}} has been created',
          body: 'Your ticket "{{title}}" has been created and assigned to {{assignee}}.',
          type: 'email',
          variables: ['ticketId', 'title', 'assignee']
        },
        {
          id: '3',
          name: 'System Alert',
          subject: 'System Alert: {{alertType}}',
          body: 'Alert: {{message}} at {{timestamp}}',
          type: 'slack',
          variables: ['alertType', 'message', 'timestamp']
        }
      ]);
    }
  };

  const handleSendNotification = async () => {
    try {
      const response = await fetch('/api/v2/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(composer),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send notification');
      }
      
      setShowComposer(false);
      setComposer({
        title: '',
        message: '',
        type: 'info',
        recipients: 'all',
        channels: ['email'],
        schedule: false,
        scheduledAt: ''
      });
      
      fetchNotifications();
      alert('Notification sent successfully!');
    } catch (err) {
      console.error('Send notification error:', err);
      alert('Failed to send notification');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-100 text-green-800">Sent</Badge>;
      case 'scheduled':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'templates', label: 'Templates', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings }
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
            <Button onClick={fetchNotifications} className="mt-4">
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
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              Send and manage system notifications
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={fetchNotifications}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setShowComposer(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Notification
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

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                  <Send className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {notifications.filter(n => n.status === 'sent').length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {notifications.filter(n => n.status === 'scheduled').length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                  <Edit className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-600">
                    {notifications.filter(n => n.status === 'draft').length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Failed</CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {notifications.filter(n => n.status === 'failed').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notifications List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input 
                    type="text" 
                    title="Notification Filter" 
                    placeholder="Filter notifications"
                    className="w-full max-w-sm"
                  />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Channels</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell>
                          {getTypeIcon(notification.type)}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{notification.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {notification.message}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-gray-400" />
                            {notification.recipients.join(', ')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            {notification.channels.map((channel) => (
                              <Badge key={channel} variant="outline" className="text-xs">
                                {channel}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(notification.status)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {notification.sentAt ? formatDate(notification.sentAt) : 
                             notification.scheduledAt ? formatDate(notification.scheduledAt) : 
                             formatDate(notification.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Notification Templates</span>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Template
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {templates.map((template) => (
                    <Card key={template.id} className="border-2 border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{template.name}</CardTitle>
                          <Badge variant="outline">{template.type}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <div className="font-medium">Subject:</div>
                            <div className="text-muted-foreground">{template.subject}</div>
                          </div>
                          <div className="text-sm">
                            <div className="font-medium">Variables:</div>
                            <div className="flex flex-wrap gap-1">
                              {template.variables.map((variable) => (
                                <Badge key={variable} variant="secondary" className="text-xs">
                                  {variable}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            Use Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via email</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300" aria-label="Email Notifications" title="Email Notifications" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Slack Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications to Slack</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300" aria-label="Slack Notifications" title="Slack Notifications" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>System Notifications</Label>
                      <p className="text-sm text-muted-foreground">Show in-app notifications</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300" aria-label="System Notifications" title="System Notifications" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notification Composer Modal */}
        {showComposer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4">
              <CardHeader>
                <CardTitle>Create Notification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={composer.title}
                    onChange={(e) => setComposer({...composer, title: e.target.value})}
                    placeholder="Notification title"
                    title="Notification Title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={composer.message}
                    onChange={(e) => setComposer({...composer, message: e.target.value})}
                    placeholder="Notification message"
                    rows={4}
                    title="Notification Message"
                  />
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={composer.type} onValueChange={(value: any) => setComposer({...composer, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Recipients</Label>
                    <Select value={composer.recipients} onValueChange={(value: string) => setComposer({...composer, recipients: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="admins">Admins Only</SelectItem>
                        <SelectItem value="technicians">Technicians</SelectItem>
                        <SelectItem value="managers">Managers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <label htmlFor="schedule" className="sr-only">Schedule for later</label>
                  <input
                    type="checkbox"
                    id="schedule"
                    checked={composer.schedule}
                    onChange={(e) => setComposer({...composer, schedule: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="schedule">Schedule for later</Label>
                </div>
                
                {composer.schedule && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduledAt">Scheduled Time</Label>
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      value={composer.scheduledAt}
                      onChange={(e) => setComposer({...composer, scheduledAt: e.target.value})}
                      title="Scheduled Time"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowComposer(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendNotification}>
                    {composer.schedule ? 'Schedule' : 'Send'} Notification
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// Adding type declarations for JSX elements.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
      // Add other elements as needed
    }
  }
}
