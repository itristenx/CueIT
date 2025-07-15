'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MonitorSpeaker, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Search,
  Filter,
  MapPin,
  Calendar,
  Activity
} from 'lucide-react';

interface Kiosk {
  id: string;
  name: string;
  location: string;
  ipAddress: string;
  macAddress: string;
  status: 'online' | 'offline' | 'maintenance';
  lastSeen: string;
  version: string;
  activationCode?: string;
  createdAt: string;
  updatedAt: string;
}

export default function KiosksPage() {
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchKiosks();
  }, []);

  const fetchKiosks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/v2/kiosks');
      if (!response.ok) {
        throw new Error('Failed to fetch kiosks');
      }
      const result = await response.json();
      setKiosks(result);
    } catch (err) {
      console.error('Kiosks fetch error:', err);
      setError('Failed to load kiosks');
      
      // Mock data for development
      setKiosks([
        {
          id: '1',
          name: 'Main Lobby Kiosk',
          location: 'Building A - Lobby',
          ipAddress: '192.168.1.100',
          macAddress: '00:11:22:33:44:55',
          status: 'online',
          lastSeen: '2024-01-15T10:30:00Z',
          version: '2.1.0',
          activationCode: 'KIOSK-2024-001',
          createdAt: '2024-01-01T09:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          name: 'IT Support Desk',
          location: 'Building B - Floor 2',
          ipAddress: '192.168.1.101',
          macAddress: '00:11:22:33:44:56',
          status: 'offline',
          lastSeen: '2024-01-14T16:45:00Z',
          version: '2.0.8',
          activationCode: 'KIOSK-2024-002',
          createdAt: '2024-01-01T09:00:00Z',
          updatedAt: '2024-01-14T16:45:00Z'
        },
        {
          id: '3',
          name: 'HR Department',
          location: 'Building C - Floor 3',
          ipAddress: '192.168.1.102',
          macAddress: '00:11:22:33:44:57',
          status: 'maintenance',
          lastSeen: '2024-01-15T08:15:00Z',
          version: '2.1.0',
          activationCode: 'KIOSK-2024-003',
          createdAt: '2024-01-01T09:00:00Z',
          updatedAt: '2024-01-15T08:15:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge variant="default" className="bg-green-100 text-green-800">Online</Badge>;
      case 'offline':
        return <Badge variant="destructive">Offline</Badge>;
      case 'maintenance':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Maintenance</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'maintenance':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredKiosks = kiosks.filter(kiosk => {
    const matchesSearch = kiosk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kiosk.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || kiosk.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const generateActivationCode = () => {
    return `KIOSK-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
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
            <Button onClick={fetchKiosks} className="mt-4">
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
            <h1 className="text-3xl font-bold">Kiosks</h1>
            <p className="text-muted-foreground">
              Manage kiosk devices and activations
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={fetchKiosks}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Kiosk
            </Button>
          </div>
        </div>

        <Separator />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Kiosks</CardTitle>
              <MonitorSpeaker className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kiosks.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {kiosks.filter(k => k.status === 'online').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Offline</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {kiosks.filter(k => k.status === 'offline').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {kiosks.filter(k => k.status === 'maintenance').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search kiosks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Kiosks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Kiosk Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKiosks.map((kiosk) => (
                  <TableRow key={kiosk.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(kiosk.status)}
                        {getStatusBadge(kiosk.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{kiosk.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {kiosk.activationCode}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {kiosk.location}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {kiosk.ipAddress}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{kiosk.version}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(kiosk.lastSeen)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
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

        {/* Activation Codes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Activation Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Generate Activation Code</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a new activation code for kiosk registration
                  </p>
                </div>
                <Button onClick={() => alert(`New activation code: ${generateActivationCode()}`)}>
                  Generate Code
                </Button>
              </div>
              
              <Separator />
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="activationCode">Activation Code</Label>
                  <Input
                    id="activationCode"
                    placeholder="Enter activation code"
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="kioskName">Kiosk Name</Label>
                  <Input
                    id="kioskName"
                    placeholder="Enter kiosk name"
                  />
                </div>
              </div>
              
              <Button className="w-full">
                Register Kiosk
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
