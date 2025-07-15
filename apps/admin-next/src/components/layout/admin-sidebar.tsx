'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart3, 
  Users, 
  Ticket, 
  Settings, 
  Shield,
  Database,
  Bell,
  Zap,
  MonitorSpeaker,
  Key,
  FileText,
  BookOpen,
  Activity,
  HelpCircle,
  Building,
  UserCheck,
  Globe,
  Smartphone
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Overview and analytics'
  },
  {
    title: 'Tickets',
    href: '/tickets',
    icon: Ticket,
    description: 'Manage support tickets'
  },
  {
    title: 'Users',
    href: '/users',
    icon: Users,
    description: 'User management'
  },
  {
    title: 'Knowledge Base',
    href: '/knowledge-base',
    icon: BookOpen,
    description: 'Articles and documentation'
  },
  {
    title: 'Kiosks',
    href: '/kiosks',
    icon: MonitorSpeaker,
    description: 'Kiosk management'
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: Activity,
    description: 'Reports and metrics'
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
    description: 'Notification settings'
  },
  {
    title: 'Integrations',
    href: '/integrations',
    icon: Zap,
    description: 'Third-party integrations'
  },
  {
    title: 'Configuration',
    href: '/configuration',
    icon: Settings,
    description: 'System configuration'
  },
  {
    title: 'Security',
    href: '/security',
    icon: Shield,
    description: 'Security settings'
  },
  {
    title: 'Server',
    href: '/server',
    icon: Database,
    description: 'Server management'
  }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              QueueIT Admin
            </h1>
            <p className="text-xs text-gray-500">IT Service Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start text-left h-auto p-3",
                    isActive && "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  )}
                >
                  <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {item.title}
                    </div>
                    {item.description && (
                      <div className={cn(
                        "text-xs truncate mt-1",
                        isActive ? "text-blue-100" : "text-gray-500"
                      )}>
                        {item.description}
                      </div>
                    )}
                  </div>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          QueueIT Admin v2.0
        </div>
      </div>
    </div>
  );
}
