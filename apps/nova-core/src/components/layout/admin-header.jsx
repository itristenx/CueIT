'use client';
import React from 'react';
import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Settings, RefreshCw } from 'lucide-react';
export function AdminHeader() {
    return (<header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Admin Dashboard
            </h2>
            <p className="text-sm text-gray-500">
              Manage your IT service management system
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4 mr-2"/>
            Notifications
            <Badge variant="destructive" className="ml-2 text-xs">
              3
            </Badge>
          </Button>
          
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4 mr-2"/>
            Settings
          </Button>
          
          <Button variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4 mr-2"/>
            Refresh
          </Button>
          
          <div className="flex items-center space-x-2">
            <UserButton afterSignOutUrl="/" appearance={{
            elements: {
                avatarBox: "h-8 w-8"
            }
        }}/>
          </div>
        </div>
      </div>
    </header>);
}
