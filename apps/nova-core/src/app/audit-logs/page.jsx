'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, } from '@/components/ui/sheet';
import { FileText, Search, Filter, Download, Eye, Clock, User, Shield, Database, Settings, Key, AlertTriangle, CheckCircle, XCircle, Edit, Trash2, Plus, ArrowRight, RefreshCw } from 'lucide-react';
// Mock data for audit logs
const mockAuditLogs = [
    {
        id: '1',
        timestamp: '2024-01-15T14:30:00Z',
        action: 'login',
        category: 'security',
        actor: {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@company.com',
            role: 'admin'
        },
        description: 'User logged in successfully',
        details: {
            loginMethod: 'password',
            twoFactorUsed: false
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'info',
        outcome: 'success'
    },
    {
        id: '2',
        timestamp: '2024-01-15T14:25:00Z',
        action: 'user_created',
        category: 'user',
        actor: {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@company.com',
            role: 'admin'
        },
        target: {
            type: 'user',
            id: '25',
            name: 'Jane Doe'
        },
        description: 'Created new user account',
        details: {
            email: 'jane.doe@company.com',
            department: 'IT',
            role: 'technician'
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'info',
        outcome: 'success'
    },
    {
        id: '3',
        timestamp: '2024-01-15T14:20:00Z',
        action: 'password_changed',
        category: 'security',
        actor: {
            id: '12',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@company.com',
            role: 'manager'
        },
        description: 'User changed their password',
        details: {
            passwordStrength: 'strong',
            previousPasswordAge: '45 days'
        },
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        severity: 'info',
        outcome: 'success'
    },
    {
        id: '4',
        timestamp: '2024-01-15T14:15:00Z',
        action: 'ticket_created',
        category: 'ticket',
        actor: {
            id: '15',
            name: 'Mike Wilson',
            email: 'mike.wilson@company.com',
            role: 'end_user'
        },
        target: {
            type: 'ticket',
            id: '145',
            name: 'Laptop not working'
        },
        description: 'Created new ticket',
        details: {
            priority: 'medium',
            department: 'IT',
            category: 'hardware'
        },
        ipAddress: '192.168.1.110',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'info',
        outcome: 'success'
    },
    {
        id: '5',
        timestamp: '2024-01-15T14:10:00Z',
        action: 'config_changed',
        category: 'config',
        actor: {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@company.com',
            role: 'admin'
        },
        description: 'Updated system configuration',
        details: {
            setting: 'smtp_settings',
            changes: {
                smtp_host: 'smtp.gmail.com',
                smtp_port: 587
            }
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'info',
        outcome: 'success'
    },
    {
        id: '6',
        timestamp: '2024-01-15T14:05:00Z',
        action: 'failed_login',
        category: 'security',
        actor: {
            id: 'unknown',
            name: 'Unknown',
            email: 'hacker@malicious.com',
            role: 'unknown'
        },
        description: 'Failed login attempt',
        details: {
            reason: 'invalid_credentials',
            attemptCount: 3
        },
        ipAddress: '185.220.100.240',
        userAgent: 'curl/7.68.0',
        severity: 'warning',
        outcome: 'failure'
    },
    {
        id: '7',
        timestamp: '2024-01-15T14:00:00Z',
        action: 'data_export',
        category: 'data',
        actor: {
            id: '8',
            name: 'Lisa Chen',
            email: 'lisa.chen@company.com',
            role: 'reporting_analyst'
        },
        description: 'Exported ticket data',
        details: {
            format: 'csv',
            recordCount: 150,
            dateRange: '2024-01-01 to 2024-01-15'
        },
        ipAddress: '192.168.1.120',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        severity: 'info',
        outcome: 'success'
    },
    {
        id: '8',
        timestamp: '2024-01-15T13:55:00Z',
        action: 'role_assigned',
        category: 'user',
        actor: {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@company.com',
            role: 'admin'
        },
        target: {
            type: 'user',
            id: '20',
            name: 'David Brown'
        },
        description: 'Assigned new role to user',
        details: {
            previousRole: 'end_user',
            newRole: 'technician',
            department: 'IT'
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'info',
        outcome: 'success'
    },
    {
        id: '9',
        timestamp: '2024-01-15T13:50:00Z',
        action: 'system_backup',
        category: 'system',
        actor: {
            id: 'system',
            name: 'System',
            email: 'system@company.com',
            role: 'system'
        },
        description: 'Automated system backup completed',
        details: {
            backupType: 'full',
            backupSize: '2.5GB',
            duration: '15 minutes'
        },
        ipAddress: '127.0.0.1',
        userAgent: 'Nova-Universe-System/1.0',
        severity: 'info',
        outcome: 'success'
    },
    {
        id: '10',
        timestamp: '2024-01-15T13:45:00Z',
        action: 'ticket_deleted',
        category: 'ticket',
        actor: {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@company.com',
            role: 'admin'
        },
        target: {
            type: 'ticket',
            id: '142',
            name: 'Test ticket'
        },
        description: 'Deleted ticket',
        details: {
            reason: 'duplicate',
            originalTicketId: '140'
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'warning',
        outcome: 'success'
    }
];
export default function AuditLogPage() {
    const [auditLogs, setAuditLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [outcomeFilter, setOutcomeFilter] = useState('all');
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    // Simulate API call
    useEffect(() => {
        const timer = setTimeout(() => {
            setAuditLogs(mockAuditLogs);
            setFilteredLogs(mockAuditLogs);
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);
    // Filter logs based on search and filters
    useEffect(() => {
        let filtered = auditLogs;
        if (searchTerm) {
            filtered = filtered.filter(log => {
                var _a;
                return log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    log.actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    log.actor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    ((_a = log.target) === null || _a === void 0 ? void 0 : _a.name.toLowerCase().includes(searchTerm.toLowerCase()));
            });
        }
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(log => log.category === categoryFilter);
        }
        if (severityFilter !== 'all') {
            filtered = filtered.filter(log => log.severity === severityFilter);
        }
        if (outcomeFilter !== 'all') {
            filtered = filtered.filter(log => log.outcome === outcomeFilter);
        }
        if (dateRange.start && dateRange.end) {
            filtered = filtered.filter(log => {
                const logDate = new Date(log.timestamp);
                const startDate = new Date(dateRange.start);
                const endDate = new Date(dateRange.end);
                return logDate >= startDate && logDate <= endDate;
            });
        }
        setFilteredLogs(filtered);
        setCurrentPage(1);
    }, [auditLogs, searchTerm, categoryFilter, severityFilter, outcomeFilter, dateRange]);
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'security':
                return <Shield className="h-4 w-4 text-red-600"/>;
            case 'user':
                return <User className="h-4 w-4 text-blue-600"/>;
            case 'ticket':
                return <FileText className="h-4 w-4 text-green-600"/>;
            case 'system':
                return <Database className="h-4 w-4 text-purple-600"/>;
            case 'data':
                return <Database className="h-4 w-4 text-orange-600"/>;
            case 'config':
                return <Settings className="h-4 w-4 text-gray-600"/>;
            default:
                return <FileText className="h-4 w-4 text-gray-600"/>;
        }
    };
    const getActionIcon = (action) => {
        switch (action) {
            case 'login':
            case 'logout':
                return <Key className="h-4 w-4 text-blue-600"/>;
            case 'user_created':
            case 'user_updated':
                return <User className="h-4 w-4 text-green-600"/>;
            case 'user_deleted':
                return <Trash2 className="h-4 w-4 text-red-600"/>;
            case 'ticket_created':
                return <Plus className="h-4 w-4 text-green-600"/>;
            case 'ticket_updated':
                return <Edit className="h-4 w-4 text-blue-600"/>;
            case 'ticket_deleted':
                return <Trash2 className="h-4 w-4 text-red-600"/>;
            case 'config_changed':
                return <Settings className="h-4 w-4 text-orange-600"/>;
            case 'password_changed':
                return <Key className="h-4 w-4 text-purple-600"/>;
            case 'failed_login':
                return <AlertTriangle className="h-4 w-4 text-red-600"/>;
            case 'data_export':
                return <Download className="h-4 w-4 text-blue-600"/>;
            case 'role_assigned':
                return <ArrowRight className="h-4 w-4 text-green-600"/>;
            case 'system_backup':
                return <RefreshCw className="h-4 w-4 text-purple-600"/>;
            default:
                return <FileText className="h-4 w-4 text-gray-600"/>;
        }
    };
    const getSeverityBadge = (severity) => {
        switch (severity) {
            case 'info':
                return <Badge className="bg-blue-100 text-blue-800">Info</Badge>;
            case 'warning':
                return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
            case 'error':
                return <Badge className="bg-red-100 text-red-800">Error</Badge>;
            case 'critical':
                return <Badge className="bg-red-100 text-red-800 font-bold">Critical</Badge>;
            default:
                return <Badge variant="outline">{severity}</Badge>;
        }
    };
    const getOutcomeIcon = (outcome) => {
        switch (outcome) {
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-600"/>;
            case 'failure':
                return <XCircle className="h-4 w-4 text-red-600"/>;
            case 'partial':
                return <AlertTriangle className="h-4 w-4 text-yellow-600"/>;
            default:
                return <FileText className="h-4 w-4 text-gray-600"/>;
        }
    };
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };
    const exportLogs = () => {
        // Simulate export functionality
        const csvContent = [
            ['Timestamp', 'Action', 'Category', 'Actor', 'Target', 'Description', 'Severity', 'Outcome', 'IP Address'].join(','),
            ...filteredLogs.map(log => {
                var _a;
                return [
                    log.timestamp,
                    log.action,
                    log.category,
                    log.actor.name,
                    ((_a = log.target) === null || _a === void 0 ? void 0 : _a.name) || '',
                    log.description,
                    log.severity,
                    log.outcome,
                    log.ipAddress
                ].join(',');
            })
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    const clearFilters = () => {
        setSearchTerm('');
        setCategoryFilter('all');
        setSeverityFilter('all');
        setOutcomeFilter('all');
        setDateRange({ start: '', end: '' });
    };
    // Pagination
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentLogs = filteredLogs.slice(startIndex, endIndex);
    if (loading) {
        return (<div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading audit logs...</div>
      </div>);
    }
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Log</h1>
          <p className="text-gray-600">View and monitor system activities and security events</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
          <Button onClick={exportLogs} className="flex items-center space-x-2">
            <Download className="h-4 w-4"/>
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Audit Log Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600"/>
              <span className="text-sm text-gray-600">Total Entries</span>
            </div>
            <div className="text-2xl font-bold">{auditLogs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600"/>
              <span className="text-sm text-gray-600">Warnings</span>
            </div>
            <div className="text-2xl font-bold">
              {auditLogs.filter(log => log.severity === 'warning').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600"/>
              <span className="text-sm text-gray-600">Failures</span>
            </div>
            <div className="text-2xl font-bold">
              {auditLogs.filter(log => log.outcome === 'failure').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-600"/>
              <span className="text-sm text-gray-600">Security Events</span>
            </div>
            <div className="text-2xl font-bold">
              {auditLogs.filter(log => log.category === 'security').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5"/>
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                <Input id="search" placeholder="Search logs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/>
              </div>
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="ticket">Ticket</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                  <SelectItem value="config">Config</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="severity">Severity</Label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Severities"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="outcome">Outcome</Label>
              <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Outcomes"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Outcomes</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" value={dateRange.start} onChange={(e) => setDateRange(Object.assign(Object.assign({}, dateRange), { start: e.target.value }))}/>
            </div>
            
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" value={dateRange.end} onChange={(e) => setDateRange(Object.assign(Object.assign({}, dateRange), { end: e.target.value }))}/>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Entries ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentLogs.map((log) => (<TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400"/>
                      <span className="text-sm">{formatTimestamp(log.timestamp)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getActionIcon(log.action)}
                      <span className="text-sm font-medium">{log.action}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(log.category)}
                      <Badge variant="outline">{log.category}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium">{log.actor.name}</div>
                      <div className="text-xs text-gray-500">{log.actor.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.target ? (<div>
                        <div className="text-sm font-medium">{log.target.name}</div>
                        <div className="text-xs text-gray-500">{log.target.type}</div>
                      </div>) : (<span className="text-sm text-gray-400">N/A</span>)}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate text-sm">{log.description}</div>
                  </TableCell>
                  <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {getOutcomeIcon(log.outcome)}
                      <span className="text-sm">{log.outcome}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedEntry(log)}>
                          <Eye className="h-4 w-4"/>
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Audit Log Details</SheetTitle>
                          <SheetDescription>
                            Detailed information about this audit event
                          </SheetDescription>
                        </SheetHeader>
                        {selectedEntry && (<div className="mt-6 space-y-4">
                            <div>
                              <Label className="text-sm font-medium">Timestamp</Label>
                              <p className="text-sm text-gray-600">{formatTimestamp(selectedEntry.timestamp)}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Action</Label>
                              <p className="text-sm text-gray-600">{selectedEntry.action}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Category</Label>
                              <p className="text-sm text-gray-600">{selectedEntry.category}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Actor</Label>
                              <div className="text-sm text-gray-600">
                                <div>{selectedEntry.actor.name}</div>
                                <div>{selectedEntry.actor.email}</div>
                                <div>Role: {selectedEntry.actor.role}</div>
                              </div>
                            </div>
                            {selectedEntry.target && (<div>
                                <Label className="text-sm font-medium">Target</Label>
                                <div className="text-sm text-gray-600">
                                  <div>{selectedEntry.target.name}</div>
                                  <div>Type: {selectedEntry.target.type}</div>
                                  <div>ID: {selectedEntry.target.id}</div>
                                </div>
                              </div>)}
                            <div>
                              <Label className="text-sm font-medium">Description</Label>
                              <p className="text-sm text-gray-600">{selectedEntry.description}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">IP Address</Label>
                              <p className="text-sm text-gray-600">{selectedEntry.ipAddress}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">User Agent</Label>
                              <p className="text-sm text-gray-600 break-all">{selectedEntry.userAgent}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Severity</Label>
                              <div className="mt-1">{getSeverityBadge(selectedEntry.severity)}</div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Outcome</Label>
                              <div className="flex items-center space-x-1 mt-1">
                                {getOutcomeIcon(selectedEntry.outcome)}
                                <span className="text-sm">{selectedEntry.outcome}</span>
                              </div>
                            </div>
                            {selectedEntry.details && (<div>
                                <Label className="text-sm font-medium">Details</Label>
                                <pre className="text-xs text-gray-600 mt-1 p-2 bg-gray-50 rounded overflow-x-auto">
                                  {JSON.stringify(selectedEntry.details, null, 2)}
                                </pre>
                              </div>)}
                          </div>)}
                      </SheetContent>
                    </Sheet>
                  </TableCell>
                </TableRow>))}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {totalPages > 1 && (<div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length} entries
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                  Previous
                </Button>
                <span className="flex items-center text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
                  Next
                </Button>
              </div>
            </div>)}
        </CardContent>
      </Card>
    </div>);
}
