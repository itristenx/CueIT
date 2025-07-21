'use client';
import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Computer, AlertTriangle, Users, Ticket, Settings, TrendingUp, Activity, Server } from 'lucide-react';
const StatCard = ({ title, value, icon: Icon, color, change, description }) => {
    return (<Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`}/>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {change !== undefined && (<div className="flex items-center space-x-2">
            <Badge variant={change >= 0 ? 'default' : 'destructive'}>
              {change >= 0 ? '+' : ''}{change}%
            </Badge>
            <span className="text-xs text-muted-foreground">from last month</span>
          </div>)}
        {description && (<p className="text-xs text-muted-foreground mt-1">{description}</p>)}
      </CardContent>
    </Card>);
};
export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetchDashboardStats();
    }, []);
    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            // This would call the actual API
            const response = await fetch('/api/v2/dashboard/stats');
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard stats');
            }
            const data = await response.json();
            setStats(data);
        }
        catch (err) {
            setError('Failed to load dashboard data');
            console.error(err);
            // Mock data for development
            setStats({
                totalTickets: 2847,
                openTickets: 142,
                resolvedTickets: 2705,
                totalUsers: 89,
                activeKiosks: 12,
                totalKiosks: 15,
                systemHealth: 'healthy',
                recentActivity: 47,
            });
        }
        finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (<div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>);
    }
    if (error) {
        return (<div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2"/>
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchDashboardStats} className="mt-4">
            Retry
          </Button>
        </div>
      </div>);
    }
    return (<AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center space-x-2">
            <Badge variant={(stats === null || stats === void 0 ? void 0 : stats.systemHealth) === 'healthy' ? 'default' : 'destructive'}>
              <Server className="h-3 w-3 mr-1"/>
              System {stats === null || stats === void 0 ? void 0 : stats.systemHealth}
            </Badge>
            <Button onClick={fetchDashboardStats} size="sm">
              <Activity className="h-4 w-4 mr-2"/>
              Refresh
            </Button>
          </div>
        </div>

        <Separator />

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Tickets" value={(stats === null || stats === void 0 ? void 0 : stats.totalTickets) || 0} icon={Ticket} color="text-blue-600" change={12} description="All time tickets"/>
        <StatCard title="Open Tickets" value={(stats === null || stats === void 0 ? void 0 : stats.openTickets) || 0} icon={AlertTriangle} color="text-red-600" change={-8} description="Awaiting response"/>
        <StatCard title="Total Users" value={(stats === null || stats === void 0 ? void 0 : stats.totalUsers) || 0} icon={Users} color="text-green-600" change={5} description="Active users"/>
        <StatCard title="Active Kiosks" value={(stats === null || stats === void 0 ? void 0 : stats.activeKiosks) || 0} icon={Computer} color="text-purple-600" change={0} description={`${stats === null || stats === void 0 ? void 0 : stats.activeKiosks}/${stats === null || stats === void 0 ? void 0 : stats.totalKiosks} online`}/>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2"/>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New ticket created</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">User logged in</p>
                  <p className="text-xs text-muted-foreground">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">System maintenance</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2"/>
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Server</span>
                <Badge variant="default">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge variant="default">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Service</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Kiosk Network</span>
                <Badge variant="default">12/15 Online</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start">
              <Ticket className="h-4 w-4 mr-2"/>
              Create Ticket
            </Button>
            <Button variant="outline" className="justify-start">
              <Users className="h-4 w-4 mr-2"/>
              Add User
            </Button>
            <Button variant="outline" className="justify-start">
              <Computer className="h-4 w-4 mr-2"/>
              Manage Kiosks
            </Button>
            <Button variant="outline" className="justify-start">
              <Settings className="h-4 w-4 mr-2"/>
              System Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </AdminLayout>);
}
