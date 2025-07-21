'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Ticket, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  ticketStats: {
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    averageResolutionTime: number;
    slaBreaches: number;
  };
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
  };
  trends: {
    ticketTrend: number;
    resolutionTrend: number;
    userTrend: number;
  };
  departmentStats: {
    department: string;
    tickets: number;
    resolved: number;
    averageTime: number;
  }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [department, setDepartment] = useState('all');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, department]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // This would call the actual API
      const response = await fetch(`/api/v2/analytics?timeRange=${timeRange}&department=${department}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics data');
      
      // Mock data for development
      setData({
        ticketStats: {
          totalTickets: 2847,
          openTickets: 142,
          resolvedTickets: 2705,
          averageResolutionTime: 4.2,
          slaBreaches: 23
        },
        userStats: {
          totalUsers: 1247,
          activeUsers: 892,
          newUsers: 47
        },
        trends: {
          ticketTrend: 12.5,
          resolutionTrend: -8.3,
          userTrend: 5.7
        },
        departmentStats: [
          { department: 'IT', tickets: 1203, resolved: 1087, averageTime: 3.8 },
          { department: 'HR', tickets: 456, resolved: 421, averageTime: 2.1 },
          { department: 'Operations', tickets: 678, resolved: 634, averageTime: 5.2 },
          { department: 'Facilities', tickets: 234, resolved: 198, averageTime: 6.7 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTrend = (value: number) => {
    const isPositive = value > 0;
    const icon = isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center ${color}`}>
        {icon}
        <span className="ml-1 text-sm font-medium">
          {isPositive ? '+' : ''}{value}%
        </span>
      </div>
    );
  };

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
            <Button onClick={fetchAnalyticsData} className="mt-4">
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
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">
              Performance metrics and insights
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="it">IT</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="facilities">Facilities</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchAnalyticsData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Separator />

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.ticketStats.totalTickets}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {data?.ticketStats.openTickets} open
                </p>
                {formatTrend(data?.trends.ticketTrend || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.ticketStats.resolvedTickets && data?.ticketStats.totalTickets 
                  ? Math.round((data.ticketStats.resolvedTickets / data.ticketStats.totalTickets) * 100)
                  : 0}%
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {data?.ticketStats.resolvedTickets} resolved
                </p>
                {formatTrend(data?.trends.resolutionTrend || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.ticketStats.averageResolutionTime}h
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Per ticket
                </p>
                {formatTrend(-2.1)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SLA Breaches</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {data?.ticketStats.slaBreaches}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  This period
                </p>
                {formatTrend(-15.2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Department Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.departmentStats.map((dept) => (
                <div key={dept.department} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="font-medium">{dept.department}</div>
                    <Badge variant="outline">{dept.tickets} tickets</Badge>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                      {dept.resolved} resolved
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-blue-500" />
                      {dept.averageTime}h avg
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1 text-purple-500" />
                      {Math.round((dept.resolved / dept.tickets) * 100)}% rate
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              User Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {data?.userStats.totalUsers}
                </div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {data?.userStats.activeUsers}
                </div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {data?.userStats.newUsers}
                </div>
                <div className="text-sm text-muted-foreground">New Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
