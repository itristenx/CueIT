/**
 * KioskConfig.ts
 * Nova Beacon Configuration Schema
 * 
 * TypeScript definitions for kiosk configuration and remote management
 */

// Core kiosk configuration
export interface KioskConfig {
  id: string;
  name: string;
  roomName: string;
  location?: string;
  department?: string;
  mode: KioskMode;
  status: KioskStatus;
  settings: KioskSettings;
  ui: KioskUIConfig;
  integrations: KioskIntegrations;
  security: KioskSecurity;
  maintenance: KioskMaintenance;
  createdAt: Date;
  updatedAt: Date;
}

// Kiosk operational modes
export enum KioskMode {
  IT = 'it',
  OPERATIONS = 'operations',
  FACILITIES = 'facilities',
  BATHROOM = 'bathroom',
  CUSTOM = 'custom'
}

// Kiosk status types
export enum KioskStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  OFFLINE = 'offline',
  ERROR = 'error'
}

// Kiosk settings
export interface KioskSettings {
  autoRefresh: boolean;
  refreshInterval: number; // seconds
  timezone: string;
  language: string;
  accessibility: AccessibilitySettings;
  notifications: NotificationSettings;
  behavior: BehaviorSettings;
}

// Accessibility settings
export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  highContrast: boolean;
  screenReader: boolean;
  reduceMotion: boolean;
  buttonSize: 'small' | 'medium' | 'large';
}

// Notification settings
export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  displayDuration: number; // seconds
  priority: 'low' | 'medium' | 'high';
}

// Behavior settings
export interface BehaviorSettings {
  idleTimeout: number; // seconds
  resetOnIdle: boolean;
  welcomeMessage: string;
  thankYouMessage: string;
  errorMessage: string;
  offlineMessage: string;
}

// UI configuration
export interface KioskUIConfig {
  theme: KioskTheme;
  branding: KioskBranding;
  layout: KioskLayout;
  colors: KioskColors;
  typography: KioskTypography;
  background: KioskBackground;
}

// Theme configuration
export interface KioskTheme {
  name: string;
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  accentColor: string;
  customCSS?: string;
}

// Branding configuration
export interface KioskBranding {
  organizationName: string;
  logo?: string;
  favicon?: string;
  footerText?: string;
  supportContact?: string;
}

// Layout configuration
export interface KioskLayout {
  headerHeight: number;
  footerHeight: number;
  sidebarWidth: number;
  padding: number;
  borderRadius: number;
  showHeader: boolean;
  showFooter: boolean;
  showSidebar: boolean;
}

// Color scheme
export interface KioskColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

// Typography settings
export interface KioskTypography {
  fontFamily: string;
  fontSize: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  fontWeight: {
    normal: number;
    medium: number;
    bold: number;
  };
  lineHeight: number;
  letterSpacing: number;
}

// Background configuration
export interface KioskBackground {
  type: 'color' | 'gradient' | 'image' | 'video';
  value: string;
  opacity: number;
  blur: number;
  overlay?: string;
}

// Integration settings
export interface KioskIntegrations {
  ticketing: TicketingIntegration;
  feedback: FeedbackIntegration;
  analytics: AnalyticsIntegration;
  monitoring: MonitoringIntegration;
}

// Ticketing integration
export interface TicketingIntegration {
  enabled: boolean;
  endpoint: string;
  apiKey?: string;
  defaultPriority: 'low' | 'medium' | 'high' | 'urgent';
  defaultCategory: string;
  requiredFields: string[];
  customFields: CustomField[];
}

// Feedback integration
export interface FeedbackIntegration {
  enabled: boolean;
  endpoint: string;
  types: FeedbackType[];
  autoSubmit: boolean;
  showThankYou: boolean;
  thankYouDuration: number;
}

// Analytics integration
export interface AnalyticsIntegration {
  enabled: boolean;
  provider: 'google' | 'custom';
  trackingId?: string;
  endpoint?: string;
  events: AnalyticsEvent[];
}

// Monitoring integration
export interface MonitoringIntegration {
  enabled: boolean;
  endpoint: string;
  interval: number; // seconds
  metrics: MonitoringMetric[];
}

// Security settings
export interface KioskSecurity {
  adminPIN: string;
  sessionTimeout: number; // minutes
  maxFailedAttempts: number;
  lockoutDuration: number; // minutes
  allowedIPs?: string[];
  encryption: boolean;
  auditLog: boolean;
}

// Maintenance settings
export interface KioskMaintenance {
  enabled: boolean;
  schedule: MaintenanceSchedule;
  notifications: MaintenanceNotifications;
  autoRestart: boolean;
  updateCheck: boolean;
}

// Supporting types
export interface CustomField {
  name: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'textarea';
  label: string;
  required: boolean;
  options?: string[];
  validation?: FieldValidation;
}

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
}

export interface FeedbackType {
  id: string;
  name: string;
  emoji?: string;
  color?: string;
  enabled: boolean;
}

export interface AnalyticsEvent {
  name: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
}

export interface MonitoringMetric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram';
  unit: string;
  description: string;
}

export interface MaintenanceSchedule {
  type: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM format
  dayOfWeek?: number; // 0-6 (Sunday-Saturday)
  dayOfMonth?: number; // 1-31
  duration: number; // minutes
}

export interface MaintenanceNotifications {
  enabled: boolean;
  advanceNotice: number; // minutes
  message: string;
  countdown: boolean;
}

// API Response types
export interface KioskConfigResponse {
  success: boolean;
  config: KioskConfig;
  message?: string;
}

export interface KioskStatusResponse {
  success: boolean;
  status: KioskStatus;
  lastUpdated: Date;
  message?: string;
}

export interface KioskListResponse {
  success: boolean;
  kiosks: KioskConfig[];
  total: number;
  page: number;
  limit: number;
}

// API Request types
export interface KioskConfigUpdateRequest {
  config: Partial<KioskConfig>;
  reason?: string;
  scheduledFor?: Date;
}

export interface KioskStatusUpdateRequest {
  status: KioskStatus;
  message?: string;
  timestamp: Date;
}

export interface KioskRegistrationRequest {
  activationCode: string;
  deviceInfo: DeviceInfo;
  location?: string;
}

export interface DeviceInfo {
  model: string;
  version: string;
  systemVersion: string;
  identifier: string;
  capabilities: string[];
}

// Factory functions for creating default configurations
export function createDefaultKioskConfig(
  id: string,
  name: string,
  roomName: string,
  mode: KioskMode = KioskMode.IT
): KioskConfig {
  return {
    id,
    name,
    roomName,
    mode,
    status: KioskStatus.INACTIVE,
    settings: createDefaultSettings(),
    ui: createDefaultUIConfig(),
    integrations: createDefaultIntegrations(),
    security: createDefaultSecurity(),
    maintenance: createDefaultMaintenance(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export function createDefaultSettings(): KioskSettings {
  return {
    autoRefresh: true,
    refreshInterval: 30,
    timezone: 'UTC',
    language: 'en',
    accessibility: {
      fontSize: 'medium',
      highContrast: false,
      screenReader: false,
      reduceMotion: false,
      buttonSize: 'medium'
    },
    notifications: {
      enabled: true,
      sound: true,
      vibration: false,
      displayDuration: 5,
      priority: 'medium'
    },
    behavior: {
      idleTimeout: 300,
      resetOnIdle: true,
      welcomeMessage: 'Welcome! How can we help you today?',
      thankYouMessage: 'Thank you for your feedback!',
      errorMessage: 'Something went wrong. Please try again.',
      offlineMessage: 'Currently offline. Please try again later.'
    }
  };
}

export function createDefaultUIConfig(): KioskUIConfig {
  return {
    theme: {
      name: 'default',
      mode: 'light',
      primaryColor: '#007AFF',
      accentColor: '#34C759'
    },
    branding: {
      organizationName: 'Nova Universe'
    },
    layout: {
      headerHeight: 80,
      footerHeight: 60,
      sidebarWidth: 300,
      padding: 20,
      borderRadius: 8,
      showHeader: true,
      showFooter: true,
      showSidebar: false
    },
    colors: {
      primary: '#007AFF',
      secondary: '#5856D6',
      accent: '#34C759',
      background: '#F2F2F7',
      surface: '#FFFFFF',
      text: '#000000',
      textSecondary: '#8E8E93',
      border: '#C6C6C8',
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
      info: '#007AFF'
    },
    typography: {
      fontFamily: 'SF Pro Display',
      fontSize: {
        small: 14,
        medium: 16,
        large: 18,
        xlarge: 24
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        bold: 700
      },
      lineHeight: 1.5,
      letterSpacing: 0
    },
    background: {
      type: 'color',
      value: '#F2F2F7',
      opacity: 1,
      blur: 0
    }
  };
}

export function createDefaultIntegrations(): KioskIntegrations {
  return {
    ticketing: {
      enabled: true,
      endpoint: '/api/tickets',
      defaultPriority: 'medium',
      defaultCategory: 'general',
      requiredFields: ['title', 'description'],
      customFields: []
    },
    feedback: {
      enabled: true,
      endpoint: '/api/feedback',
      types: [
        { id: 'rating', name: 'Rating', enabled: true },
        { id: 'emoji', name: 'Emoji', enabled: true }
      ],
      autoSubmit: true,
      showThankYou: true,
      thankYouDuration: 3
    },
    analytics: {
      enabled: false,
      provider: 'custom',
      events: []
    },
    monitoring: {
      enabled: true,
      endpoint: '/api/monitoring',
      interval: 60,
      metrics: [
        { name: 'uptime', type: 'gauge', unit: 'seconds', description: 'System uptime' },
        { name: 'interactions', type: 'counter', unit: 'count', description: 'User interactions' }
      ]
    }
  };
}

export function createDefaultSecurity(): KioskSecurity {
  return {
    adminPIN: '',
    sessionTimeout: 30,
    maxFailedAttempts: 3,
    lockoutDuration: 10,
    encryption: true,
    auditLog: true
  };
}

export function createDefaultMaintenance(): KioskMaintenance {
  return {
    enabled: false,
    schedule: {
      type: 'daily',
      time: '02:00',
      duration: 30
    },
    notifications: {
      enabled: true,
      advanceNotice: 15,
      message: 'System maintenance will begin shortly.',
      countdown: true
    },
    autoRestart: true,
    updateCheck: true
  };
}

// Validation functions
export function validateKioskConfig(config: KioskConfig): string[] {
  const errors: string[] = [];
  
  if (!config.id) errors.push('Kiosk ID is required');
  if (!config.name) errors.push('Kiosk name is required');
  if (!config.roomName) errors.push('Room name is required');
  if (!Object.values(KioskMode).includes(config.mode)) {
    errors.push('Invalid kiosk mode');
  }
  if (!Object.values(KioskStatus).includes(config.status)) {
    errors.push('Invalid kiosk status');
  }
  
  return errors;
}

export function validateKioskSecurity(security: KioskSecurity): string[] {
  const errors: string[] = [];
  
  if (!security.adminPIN) errors.push('Admin PIN is required');
  if (security.adminPIN.length < 4) errors.push('Admin PIN must be at least 4 characters');
  if (security.sessionTimeout < 5) errors.push('Session timeout must be at least 5 minutes');
  if (security.maxFailedAttempts < 1) errors.push('Max failed attempts must be at least 1');
  
  return errors;
}

export default KioskConfig;
