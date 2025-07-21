'use client';

import React from 'react';
import { useAuth, useUser, SignInButton, UserButton } from '@clerk/nextjs';
import { 
  RocketLaunchIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  PlayIcon,
  BoltIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'inactive' | 'beta';
  url: string;
  platform: 'web' | 'mobile' | 'desktop' | 'all';
}

const ModuleCard: React.FC<ModuleCardProps> = ({ title, description, icon, status, url, platform }) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200',
    beta: 'bg-orange-100 text-orange-800 border-orange-200'
  };

  const platformIcons = {
    web: <GlobeAltIcon className="h-4 w-4" />,
    mobile: <DevicePhoneMobileIcon className="h-4 w-4" />,
    desktop: <ComputerDesktopIcon className="h-4 w-4" />,
    all: <BoltIcon className="h-4 w-4" />
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 p-6"
      onClick={() => window.open(url, '_blank')}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {icon}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          {platformIcons[platform]}
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[status]}`}>
            {status}
          </span>
        </div>
      </div>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

const DashboardContent: React.FC = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const modules: ModuleCardProps[] = [
    {
      title: 'Nova Synth',
      description: 'Comprehensive IT service management and helpdesk backend API',
      icon: <RocketLaunchIcon className="h-6 w-6 text-blue-600" />,
      status: 'active',
      url: 'http://localhost:3000/api/docs',
      platform: 'web'
    },
    {
      title: 'Nova Orbit',
      description: 'IT service management dashboard for agents and administrators',
      icon: <UsersIcon className="h-6 w-6 text-green-600" />,
      status: 'active',
      url: 'http://localhost:3001',
      platform: 'web'
    },
    {
      title: 'Nova Core',
      description: 'End-user portal for ticket submission and self-service',
      icon: <ChartBarIcon className="h-6 w-6 text-purple-600" />,
      status: 'active',
      url: 'http://localhost:3002',
      platform: 'web'
    },
    {
      title: 'Nova Pulse',
      description: 'Real-time monitoring and analytics dashboard',
      icon: <PlayIcon className="h-6 w-6 text-red-600" />,
      status: 'active',
      url: 'http://localhost:3003',
      platform: 'web'
    },
    {
      title: 'Nova Lore',
      description: 'Knowledge base and documentation management system',
      icon: <CogIcon className="h-6 w-6 text-yellow-600" />,
      status: 'active',
      url: 'http://localhost:3005',
      platform: 'web'
    },
    {
      title: 'Admin Portal',
      description: 'Administrative configuration and system management',
      icon: <CogIcon className="h-6 w-6 text-gray-600" />,
      status: 'active',
      url: 'http://localhost:3006',
      platform: 'web'
    }
  ];

  const quickActions = [
    { 
      label: 'API Documentation', 
      icon: <RocketLaunchIcon className="h-4 w-4" />, 
      url: 'http://localhost:3000/api/docs',
      description: 'View Nova Synth API documentation'
    },
    { 
      label: 'Service Dashboard', 
      icon: <ChartBarIcon className="h-4 w-4" />, 
      url: 'http://localhost:3001',
      description: 'Access IT service management dashboard'
    },
    { 
      label: 'User Portal', 
      icon: <UsersIcon className="h-4 w-4" />, 
      url: 'http://localhost:3002',
      description: 'Submit tickets and access self-service'
    },
    { 
      label: 'System Monitor', 
      icon: <BoltIcon className="h-4 w-4" />, 
      url: 'http://localhost:3003',
      description: 'Real-time system monitoring'
    }
  ];

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <RocketLaunchIcon className="h-16 w-16 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Nova Deck</h1>
            <p className="text-gray-600 mb-6">
              Universal launcher for the Nova Universe ecosystem
            </p>
            <SignInButton mode="modal">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors">
                Sign In to Continue
              </button>
            </SignInButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <RocketLaunchIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Nova Deck</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.firstName || 'User'}
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Nova Universe Launcher</h2>
          <p className="text-gray-600 text-lg">
            Access all Nova Universe applications and services from one central location.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => window.open(action.url, '_blank')}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center space-x-3 mb-2">
                  {action.icon}
                  <span className="font-medium text-gray-900">{action.label}</span>
                </div>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Module Grid */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Nova Universe Applications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, index) => (
              <ModuleCard key={index} {...module} />
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BoltIcon className="h-6 w-6 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900">System Status</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">6</div>
              <div className="text-sm text-gray-600">Active Services</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">120+</div>
              <div className="text-sm text-gray-600">API Endpoints</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">Online</div>
              <div className="text-sm text-gray-600">Database</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">v2.0</div>
              <div className="text-sm text-gray-600">Version</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default function HomePage() {
  return <DashboardContent />;
}