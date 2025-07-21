import axios, { AxiosInstance } from 'axios';
import {
  User as UserType,
  Role as RoleType,
  Permission,
  Kiosk as KioskType,
  Log,
  Config,
  Notification,
  DirectoryUser,
  Integration,
  Asset,
  ApiResponse,
  LoginCredentials,
  AuthToken,
  DashboardStats,
  ActivityLog
} from '@/types';

// Check if we should use mock mode (when API is not available or VITE_USE_MOCK_API is true)
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

class ApiClient {
  private client: AxiosInstance;
  private useMockMode: boolean = USE_MOCK_API;

  constructor() {
    this.client = axios.create({
      baseURL: this.getServerUrl(),
      timeout: 10000,
    });

    // Request interceptor to add auth token and update base URL
    this.client.interceptors.request.use((config) => {
      // Update base URL in case it changed
      config.baseURL = this.getServerUrl();
      
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Log API errors for debugging
        console.error('API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message,
          code: error.code
        });
        
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          // Only redirect if we're not already on the login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Get the current server URL from localStorage or environment
  private getServerUrl(): string {
    const storedUrl = localStorage.getItem('api_server_url');
    const envUrl = import.meta.env.VITE_NOVA_API_URL;
    const defaultUrl = 'http://localhost:3000';
    
    // Use stored URL if available, otherwise environment URL, otherwise default
    return storedUrl || envUrl || defaultUrl;
  }

  // Auth
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    if (this.useMockMode) {
      return { token: 'mock_token_12345' } as AuthToken;
    }

    const response = await this.client.post<AuthToken>('/api/v1/login', credentials);
    return response.data;
  }

  async me(token?: string): Promise<UserType> {
    if (this.useMockMode) {
      return { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'admin' };
    }

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await this.client.get<UserType>('/api/v1/me', { headers });
    return response.data;
  }

  // Users
  async getUsers(): Promise<UserType[]> {
    if (this.useMockMode) {
      return [
        { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'admin' },
        { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'user' }
      ];
    }

    const response = await this.client.get<UserType[]>('/api/v1/users');
    return response.data;
  }

  async createUser(user: Omit<UserType, 'id'>): Promise<UserType> {
    if (this.useMockMode) {
      const newUser = { ...user, id: Date.now() };
      return newUser;
    }

    const response = await this.client.post<UserType>('/api/v1/users', user);
    return response.data;
  }

  async updateUser(id: number, user: Partial<UserType>): Promise<UserType> {
    if (this.useMockMode) {
      const existingUser = { id, name: 'John Doe', email: 'john.doe@example.com', role: 'admin' };
      const updatedUser = { ...existingUser, ...user };
      return updatedUser;
    }

    const response = await this.client.put<UserType>(`/api/v1/users/${id}`, user);
    return response.data;
  }

  async deleteUser(id: number): Promise<ApiResponse> {
    if (this.useMockMode) {
      return { message: 'User deleted successfully' };
    }

    const response = await this.client.delete<ApiResponse>(`/api/v1/users/${id}`);
    return response.data;
  }

  // Roles and Permissions
  async getRoles(): Promise<RoleType[]> {
    if (this.useMockMode) {
      return [
        { id: 1, name: 'Admin', permissions: ['*'] },
        { id: 2, name: 'User', permissions: ['read'] }
      ];
    }

    const response = await this.client.get<RoleType[]>('/api/v1/roles');
    return response.data;
  }

  async getPermissions(): Promise<Permission[]> {
    if (this.useMockMode) {
      return [
        { id: 1, name: 'Read', description: 'Read access' },
        { id: 2, name: 'Write', description: 'Write access' },
        { id: 3, name: 'Execute', description: 'Execute access' }
      ];
    }

    const response = await this.client.get<Permission[]>('/api/v1/roles/permissions');
    return response.data;
  }

  async createRole(role: Omit<RoleType, 'id'>): Promise<RoleType> {
    if (this.useMockMode) {
      const newRole = { ...role, id: Date.now() };
      return newRole;
    }

    const response = await this.client.post<RoleType>('/api/v1/roles', role);
    return response.data;
  }

  async updateRole(id: number, role: Partial<RoleType>): Promise<ApiResponse> {
    if (this.useMockMode) {
      return { message: 'Role updated successfully' };
    }

    const response = await this.client.put<ApiResponse>(`/api/v1/roles/${id}`, role);
    return response.data;
  }

  async deleteRole(id: number): Promise<ApiResponse> {
    if (this.useMockMode) {
      return { message: 'Role deleted successfully' };
    }

    const response = await this.client.delete<ApiResponse>(`/api/v1/roles/${id}`);
    return response.data;
  }

  // Kiosks
  async getKiosks(): Promise<KioskType[]> {
    if (this.useMockMode) {
      return [
        { id: '1', name: 'Kiosk 1', location: 'Lobby', active: true },
        { id: '2', name: 'Kiosk 2', location: 'Break Room', active: false }
      ];
    }

    const response = await this.client.get<KioskType[]>('/api/v1/kiosks');
    return response.data;
  }

  async updateKiosk(id: string, kiosk: Partial<KioskType>): Promise<KioskType> {
    if (this.useMockMode) {
      const existingKiosk = { id, name: 'Kiosk 1', location: 'Lobby', active: true };
      const updatedKiosk = { ...existingKiosk, ...kiosk };
      return updatedKiosk;
    }

    const response = await this.client.put<KioskType>(`/api/v1/kiosks/${id}`, kiosk);
    return response.data;
  }

  async deleteKiosk(id: string): Promise<ApiResponse> {
    if (this.useMockMode) {
      return { message: 'Kiosk deleted successfully' };
    }

    const response = await this.client.delete<ApiResponse>(`/api/v1/kiosks/${id}`);
    return response.data;
  }

  async activateKiosk(id: string): Promise<Partial<KioskType>> {
    if (this.useMockMode) {
      return { id, active: true };
    }

    const response = await this.client.post<Partial<KioskType>>(`/api/v1/kiosks/${id}/activate`);
    return response.data;
  }

  async deactivateKiosk(id: string): Promise<ApiResponse> {
    if (this.useMockMode) {
      return { message: 'Kiosk deactivated successfully' };
    }

    const response = await this.client.post<ApiResponse>(`/api/v1/kiosks/${id}/deactivate`);
    return response.data;
  }

  async generateKioskActivation(): Promise<KioskActivation> {
    try {
      const response = await this.client.post<KioskActivation>('/api/v1/kiosks/activation');
      return response.data;
    } catch (error) {
      console.error('Error generating kiosk activation:', error);
      // Fallback to mock only if API is completely unavailable
      if (this.useMockMode || !navigator.onLine) {
        return {
          id: 'activation_' + Date.now(),
          code: 'ABC' + Math.floor(Math.random() * 1000),
          qrCode: 'data:image/png;base64,mock_qr_code',
          expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
          used: false,
          createdAt: new Date().toISOString()
        };
      }
      throw error;
    }
  }

  // Kiosk Systems Configuration
  async getKioskSystems(): Promise<{ systems: string[] }> {
    if (this.useMockMode) {
      return {
        systems: ['Desktop', 'Laptop', 'Mobile', 'Network', 'Printer', 'Software', 'Account Access']
      };
    }

    const response = await this.client.get<{ systems: string[] }>('/api/v1/kiosks/systems');
    return response.data;
  }

  async updateKioskSystems(systems: string[]): Promise<ApiResponse> {
    if (this.useMockMode) {
      return { message: 'Kiosk systems updated successfully' };
    }

    const response = await this.client.put<ApiResponse>('/api/v1/kiosks/systems', { systems });
    return response.data;
  }

  // Remote Kiosk Management
  async refreshKioskConfig(id: string): Promise<ApiResponse> {
    if (this.useMockMode) {
      return { message: 'Config refresh requested' };
    }

    const response = await this.client.post<ApiResponse>(`/api/v1/kiosks/${id}/refresh-config`);
    return response.data;
  }

  async resetKiosk(id: string): Promise<ApiResponse> {
    if (this.useMockMode) {
      return { message: 'Kiosk reset successfully' };
    }

    const response = await this.client.post<ApiResponse>(`/api/v1/kiosks/${id}/reset`);
    return response.data;
  }

  // Server Management
  async restartServer(): Promise<ApiResponse> {
    if (this.useMockMode) {
      return { message: 'Server restart initiated' };
    }

    const response = await this.client.post<ApiResponse>('/api/v1/server/restart');
    return response.data;
  }

  async getServerStatus(): Promise<any> {
    if (this.useMockMode) {
      return {
        status: 'running',
        uptime: 12345,
        version: '1.0.0',
        nodeVersion: 'v18.0.0'
      };
    }

    const response = await this.client.get('/api/v1/server/status');
    return response.data;
  }

  // Logs/Tickets
  async getLogs(): Promise<Log[]> {
    if (this.useMockMode) {
      return [
        { id: 1, ticketId: 101, name: 'John Doe', email: 'john.doe@example.com', title: 'Issue with kiosk', system: 'Kiosk 1', urgency: 'high', timestamp: '2025-01-01T10:00:00Z' },
        { id: 2, ticketId: 102, name: 'Jane Smith', email: 'jane.smith@example.com', title: 'Network issue', system: 'Network', urgency: 'medium', timestamp: '2025-01-02T11:00:00Z' }
      ];
    }

    const response = await this.client.get<Log[]>('/api/v1/logs');
    return response.data;
  }

  async deleteLog(id: number): Promise<ApiResponse> {
    if (this.useMockMode) {
      return { message: 'Log deleted successfully' };
    }

    const response = await this.client.delete<ApiResponse>(`/api/v1/logs/${id}`);
    return response.data;
  }

  async exportLogs(): Promise<Blob> {
    if (this.useMockMode) {
      // Create a mock CSV blob
      const csvContent = 'ID,Ticket ID,Name,Email,Title,System,Urgency,Timestamp\n' +
        [
          { id: 1, ticketId: 101, name: 'John Doe', email: 'john.doe@example.com', title: 'Issue with kiosk', system: 'Kiosk 1', urgency: 'high', timestamp: '2025-01-01T10:00:00Z' },
          { id: 2, ticketId: 102, name: 'Jane Smith', email: 'jane.smith@example.com', title: 'Network issue', system: 'Network', urgency: 'medium', timestamp: '2025-01-02T11:00:00Z' }
        ].map(log => 
          `${log.id},${log.ticketId},${log.name},${log.email},${log.title},${log.system},${log.urgency},${log.timestamp}`
        ).join('\n');
      return new Blob([csvContent], { type: 'text/csv' });
    }

    const response = await this.client.get('/api/v1/logs/export', { responseType: 'blob' });
    return response.data;
  }

  async clearLogs(): Promise<ApiResponse> {
    if (this.useMockMode) {
      return { message: 'All logs cleared successfully' };
    }

    const response = await this.client.delete<ApiResponse>('/api/v1/logs');
    return response.data;
  }

  // Config
  async getConfig(): Promise<Config> {
    if (this.useMockMode) {
      return {
        id: 1,
        setting1: 'Value 1',
        setting2: 'Value 2',
        setting3: 'Value 3'
      };
    }

    const response = await this.client.get<Config>('/api/v1/config');
    return response.data;
  }

  async updateConfig(config: Partial<Config>): Promise<Config> {
    if (this.useMockMode) {
      const updatedConfig = { ...Config, ...config };
      return updatedConfig;
    }

    const response = await this.client.put<Config>('/api/v1/config', config);
    return response.data;
  }

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    if (this.useMockMode) {
      return [
        { id: 1, message: 'Kiosk 1 is offline', type: 'alert', level: 'high', createdAt: '2025-01-01T10:00:00Z' },
        { id: 2, message: 'New software update available', type: 'info', level: 'medium', createdAt: '2025-01-02T11:00:00Z' }
      ];
    }

    const response = await this.client.get<Notification[]>('/api/v1/notifications');
    return response.data;
  }

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    if (this.useMockMode) {
      const newNotification: Notification = {
        ...notification,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      return newNotification;
    }

    // Map frontend notification to backend format
    const payload = {
      message: notification.message,
      type: notification.type,
      level: notification.level || 'info'
    };

    const response = await this.client.post<Notification>('/api/v1/notifications', payload);
    return response.data;
  }

  async deleteNotification(id: number): Promise<ApiResponse> {
    if (this.useMockMode) {
      return { message: 'Notification deleted successfully' };
    }

    const response = await this.client.delete<ApiResponse>(`/api/v1/notifications/${id}`);
    return response.data;
  }

  // Directory
  async searchDirectory(query: string): Promise<DirectoryUser[]> {
    if (this.useMockMode) {
      const mockDirectoryUsers: DirectoryUser[] = [
        { id: '1', name: 'John Doe', email: 'john.doe@example.com', department: 'Engineering' },
        { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', department: 'Marketing' }
      ].filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) || 
        user.email.toLowerCase().includes(query.toLowerCase())
      );
      return mockDirectoryUsers;
    }

    const response = await this.client.get<DirectoryUser[]>(`/api/v1/directory/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  // Integrations
  async getIntegrations(): Promise<Integration[]> {
    if (this.useMockMode) {
      return [
        { id: 1, name: 'Slack', type: 'incoming-webhook', enabled: true },
        { id: 2, name: 'Email', type: 'smtp', enabled: false }
      ];
    }

    const response = await this.client.get<Integration[]>('/api/v1/integrations');
    return response.data;
  }

  async createIntegration(integration: Omit<Integration, 'id'>): Promise<Integration> {
    if (this.useMockMode) {
      const newIntegration = { ...integration, id: Date.now() };
      return newIntegration;
    }

    const response = await this.client.post<Integration>('/api/v1/integrations', integration);
    return response.data;
  }

  async updateIntegration(id: number, integration: Partial<Integration>): Promise<Integration> {
    if (this.useMockMode) {
      const existingIntegration = { id, name: 'Slack', type: 'incoming-webhook', enabled: true };
      const updatedIntegration = { ...existingIntegration, ...integration };
      return updatedIntegration;
    }

    const response = await this.client.put<Integration>(`/api/v1/integrations/${id}`, integration);
    return response.data;
  }

  async deleteIntegration(id: number): Promise<ApiResponse> {
    if (this.useMockMode) {
      return { message: 'Integration deleted successfully' };
    }

    const response = await this.client.delete<ApiResponse>(`/api/v1/integrations/${id}`);
    return response.data;
  }

  async testIntegration(id: number): Promise<ApiResponse> {
    if (this.useMockMode) {
      const integration = { id, name: 'Slack', type: 'incoming-webhook', enabled: true };
      const success = integration.enabled !== false;
      return { 
        message: success ? 'Integration test successful' : 'Integration test failed'
      };
    }

    const response = await this.client.post<ApiResponse>(`/api/v1/integrations/${id}/test`);
    return response.data;
  }

  // Assets
  async getAssets(): Promise<Asset[]> {
    if (this.useMockMode) {
      const mockAssets: Asset[] = [
        {
          id: 1,
          name: 'Company Logo',
          type: 'logo',
          url: 'https://via.placeholder.com/200x60/3B82F6/FFFFFF?text=CueIT',
          uploadedAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Favicon',
          type: 'favicon',
          url: 'https://via.placeholder.com/32x32/3B82F6/FFFFFF?text=C',
          uploadedAt: new Date().toISOString()
        }
      ];
      return mockAssets;
    }

    const response = await this.client.get<Asset[]>('/api/v1/assets');
    return response.data;
  }

  async uploadAsset(file: File, type: Asset['type']): Promise<Asset> {
    if (this.useMockMode) {
      const mockAsset: Asset = {
        id: Date.now(),
        name: file.name,
        type,
        url: `http://localhost:3000/assets/${file.name}`,
        uploadedAt: new Date().toISOString()
      };
      return mockAsset;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await this.client.post<Asset>('/api/v1/assets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async deleteAsset(id: number): Promise<ApiResponse> {
    if (this.useMockMode) {
      return { message: 'Asset deleted successfully' };
    }

    const response = await this.client.delete<ApiResponse>(`/api/v1/assets/${id}`);
    return response.data;
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    if (this.useMockMode) {
      return {
        totalUsers: 100,
        totalKiosks: 50,
        totalAssets: 200,
        totalIntegrations: 10,
        recentActivity: [
          { id: 1, type: 'login', description: 'User John Doe logged in', timestamp: '2025-01-01T10:00:00Z' },
          { id: 2, type: 'error', description: 'Kiosk 1 went offline', timestamp: '2025-01-02T11:00:00Z' }
        ]
      };
    }

    const response = await this.client.get<DashboardStats>('/api/v1/dashboard/stats');
    return response.data;
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    if (this.useMockMode) {
      return [
        { id: 1, action: 'login', user: 'John Doe', timestamp: '2025-01-01T10:00:00Z', details: 'User logged in' },
        { id: 2, action: 'logout', user: 'Jane Smith', timestamp: '2025-01-02T11:00:00Z', details: 'User logged out' }
      ];
    }

    const response = await this.client.get<ActivityLog[]>('/api/v1/dashboard/activity');
    return response.data;
  }

  // Security Settings
  async getSecuritySettings(): Promise<any> {
    if (this.useMockMode) {
      return {
        passwordMinLength: '8',
        passwordRequireSymbols: true,
        passwordRequireNumbers: true,
        passwordRequireUppercase: true,
        sessionTimeout: '24',
        maxLoginAttempts: '5',
        lockoutDuration: '15',
        twoFactorRequired: false,
        auditLogging: true
      };
    }

    const response = await this.client.get('/api/v1/security-settings');
    return response.data;
  }

  async updateSecuritySettings(settings: any): Promise<ApiResponse> {
    if (this.useMockMode) {
      return { message: 'Security settings updated successfully' };
    }

    const response = await this.client.put<ApiResponse>('/api/v1/security-settings', settings);
    return response.data;
  }

  // Notification Settings
  async getNotificationSettings(): Promise<any> {
    if (this.useMockMode) {
      return {
        emailNotifications: true,
        slackNotifications: false,
        ticketCreatedNotify: true,
        kioskOfflineNotify: true,
        systemErrorNotify: true,
        dailyReports: false,
        weeklyReports: false,
        notificationRetention: '30'
      };
    }

    const response = await this.client.get('/api/v1/notification-settings');
    return response.data;
  }

  async updateNotificationSettings(settings: any): Promise<ApiResponse> {
    if (this.useMockMode) {
      return { message: 'Notification settings updated successfully' };
    }

    const response = await this.client.put<ApiResponse>('/api/v1/notification-settings', settings);
    return response.data;
  }

  // Kiosk Activations
  async getKioskActivations(): Promise<KioskActivation[]> {
    try {
      const response = await this.client.get<KioskActivation[]>('/api/v1/kiosks/activations');
      // Ensure we always return an array
      if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('API returned non-array data for kiosk activations:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error getting kiosk activations:', error);
      // Fallback to mock only if API is completely unavailable
      if (this.useMockMode || !navigator.onLine) {
        return [
          {
            id: 'activation_123',
            code: 'ABC123',
            qrCode: 'data:image/png;base64,mock_qr_code',
            expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
            used: false,
            createdAt: new Date().toISOString()
          }
        ];
      }
      // Return empty array if API fails but we're not in mock mode
      return [];
    }
  }

  async getKioskConfig(id: string): Promise<KioskConfig> {
    if (this.useMockMode) {
      return {
        kiosk: { 
          id, 
          active: true, 
          lastSeen: new Date().toISOString(),
          version: '1.0.0',
          configScope: 'global' as ConfigScope,
          hasOverrides: false,
          overrideCount: 0,
          effectiveConfig: {
            statusEnabled: true, 
            currentStatus: 'open' as const,
            openMsg: 'Open', 
            closedMsg: 'Closed', 
            errorMsg: 'Error'
          }
        },
        config: {
          logoUrl: '/logo.png',
          faviconUrl: '/vite.svg',
          welcomeMessage: 'Welcome to the Help Desk',
          helpMessage: 'Need to report an issue?',
          statusOpenMsg: 'Open',
          statusClosedMsg: 'Closed',
          statusErrorMsg: 'Error',
          systems: ['Desktop', 'Laptop', 'Mobile', 'Network', 'Printer', 'Software', 'Account Access']
        }
      };
    }

    const response = await this.client.get<KioskConfig>(`/api/v1/kiosk-config/${id}`);
    return response.data;
  }

  async updateKioskConfig(id: string, config: Partial<Kiosk>): Promise<ApiResponse> {
    if (this.useMockMode) {
      return { message: 'Kiosk configuration updated successfully' };
    }

    const response = await this.client.put<ApiResponse>(`/api/v1/kiosk-config/${id}`, config);
    return response.data;
  }

  // Feedback
  async getFeedback(): Promise<any[]> {
    if (this.useMockMode) {
      return [];
    }

    const response = await this.client.get<any[]>('/api/v1/feedback');
    return response.data;
  }

  async createFeedback(feedback: { message: string; rating?: number }): Promise<ApiResponse> {
    if (this.useMockMode) {
      return { message: 'Feedback submitted successfully' };
    }

    const response = await this.client.post<ApiResponse>('/api/v1/feedback', feedback);
    return response.data;
  }

  // Password Management
  async verifyPassword(password: string): Promise<{ valid: boolean }> {
    if (this.useMockMode) {
      return { valid: true };
    }

    const response = await this.client.post<{ valid: boolean }>('/api/v1/verify-password', { password });
    return response.data;
  }

  async updateAdminPassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    if (this.useMockMode) {
      return { message: 'Password updated successfully' };
    }

    const response = await this.client.put<ApiResponse>('/api/v1/admin-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }

  // Status Configuration
  async getStatusConfig(): Promise<any> {
    if (this.useMockMode) {
      return {
        enabled: true,
        currentStatus: 'open', // Current global status
        openMessage: 'Help Desk is Open',
        closedMessage: 'Help Desk is Closed',
        meetingMessage: 'In a Meeting - Back Soon',
        brbMessage: 'Be Right Back',
        lunchMessage: 'Out to Lunch - Back in 1 Hour',
        unavailableMessage: 'Status Unavailable',
        schedule: {
          enabled: false,
          schedule: {
            monday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
            tuesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
            wednesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
            thursday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
            friday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
            saturday: { enabled: false, slots: [] },
            sunday: { enabled: false, slots: [] }
          },
          timezone: 'America/New_York'
        },
        officeHours: {
          enabled: false,
          title: 'IT Support Hours',
          schedule: {
            monday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
            tuesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
            wednesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
            thursday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
            friday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
            saturday: { enabled: false, slots: [] },
            sunday: { enabled: false, slots: [] }
          },
          timezone: 'America/New_York',
          showNextOpen: true
        }
      };
    }

    const response = await this.client.get<any>('/api/v1/status-config');
    return response.data;
  }

  async updateStatusConfig(config: any): Promise<ApiResponse> {
    if (this.useMockMode) {
      return { message: 'Status configuration updated successfully' };
    }

    const response = await this.client.put<ApiResponse>('/api/v1/status-config', config);
    return response.data;
  }

  // Directory Configuration
  async getDirectoryConfig(): Promise<any> {
    if (this.useMockMode) {
      return {
        enabled: false,
        provider: 'ldap',
        url: '',
        baseDN: '',
        bindDN: '',
        bindPassword: ''
      };
    }

    const response = await this.client.get<any>('/api/v1/directory-config');
    return response.data;
  }

  async updateDirectoryConfig(config: any): Promise<ApiResponse> {
    if (this.useMockMode) {
      return { message: 'Directory configuration updated successfully' };
    }

    const response = await this.client.put<ApiResponse>('/api/v1/directory-config', config);
    return response.data;
  }

  // SSO Configuration
  async getSSOConfig(): Promise<any> {
    if (this.useMockMode) {
      return {
        enabled: false,
        provider: 'saml',
        saml: {
          enabled: false,
          entryPoint: '',
          issuer: '',
          callbackUrl: '',
          cert: ''
        }
      };
    }

    const response = await this.client.get<any>('/api/v1/sso-config');
    return response.data;
  }

  async getSSOAvailability(): Promise<{ available: boolean; loginUrl?: string }> {
    if (this.useMockMode) {
      return { available: false };
    }

    const response = await this.client.get<{ available: boolean; loginUrl?: string }>('/api/v1/sso-available');
    return response.data;
  }

  async updateSsoConfig(updates: any): Promise<ApiResponse> {
    if (this.useMockMode) {
      return { message: 'SSO configuration updated successfully' };
    }

    const response = await this.client.put<ApiResponse>('/api/v1/sso/config', updates);
    return response.data;
  }

  // SCIM Configuration
  async getSCIMConfig(): Promise<any> {
    if (this.useMockMode) {
      return {
        enabled: false,
        token: '',
        endpoint: '/scim/v2'
      };
    }

    const response = await this.client.get<any>('/api/v1/scim-config');
    return response.data;
  }

  async updateSCIMConfig(config: any): Promise<ApiResponse> {
    if (this.useMockMode) {
      return { message: 'SCIM configuration updated successfully' };
    }

    const response = await this.client.put<ApiResponse>('/api/v1/scim-config', config);
    return response.data;
  }

  // Passkey Management
  async getPasskeys(): Promise<any[]> {
    if (this.useMockMode) {
      return [
        {
          id: '1',
          name: 'Touch ID',
          created_at: '2025-01-01T00:00:00Z',
          last_used: '2025-01-07T00:00:00Z',
          credential_device_type: 'platform'
        }
      ];
    }

    const response = await this.client.get<any[]>('/api/v1/passkeys');
    return response.data;
  }

  async deletePasskey(id: string): Promise<ApiResponse> {
    if (this.useMockMode) {
      return { message: 'Passkey deleted successfully' };
    }

    const response = await this.client.delete<ApiResponse>(`/api/v1/passkeys/${id}`);
    return response.data;
  }

  async beginPasskeyRegistration(options: any): Promise<any> {
    if (this.useMockMode) {
      return {
        challenge: 'mock-challenge',
        rp: { name: 'CueIT Portal', id: 'localhost' },
        user: { id: 'mock-user-id', name: 'mock@example.com', displayName: 'Mock User' },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        timeout: 60000
      };
    }

    const response = await this.client.post<any>('/api/v1/passkey/register/begin', options);
    return response.data;
  }

  async completePasskeyRegistration(data: any): Promise<ApiResponse> {
    if (this.useMockMode) {
      return { verified: true, message: 'Passkey registered successfully' };
    }

    const response = await this.client.post<ApiResponse>('/api/v1/passkey/register/complete', data);
    return response.data;
  }

  async beginPasskeyAuthentication(): Promise<any> {
    if (this.useMockMode) {
      return {
        challenge: 'mock-auth-challenge',
        timeout: 60000,
        rpId: 'localhost',
        allowCredentials: [],
        challengeKey: 'mock-challenge-key'
      };
    }

    const response = await this.client.post<any>('/api/v1/passkey/authenticate/begin');
    return response.data;
  }

  async completePasskeyAuthentication(data: any): Promise<{ verified: boolean; token?: string; user?: any }> {
    if (this.useMockMode) {
      return {
        verified: true,
        token: 'mock-jwt-token',
        user: { id: 1, name: 'Mock User', email: 'mock@example.com' }
      };
    }

    const response = await this.client.post<{ verified: boolean; token?: string; user?: any }>('/api/v1/passkey/authenticate/complete', data);
    return response.data;
  }
}

export const api = new ApiClient();
