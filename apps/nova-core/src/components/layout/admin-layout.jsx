'use client';
import React from 'react';
import { AdminSidebar } from './admin-sidebar';
import { AdminHeader } from './admin-header';
export function AdminLayout({ children }) {
    return (<div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>);
}
