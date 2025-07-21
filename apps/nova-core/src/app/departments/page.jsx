'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from '@/components/ui/alert-dialog';
import { Building2, Plus, Search, Edit, Trash2, Users, Shield, FileText } from 'lucide-react';
// Mock data for departments
const mockDepartments = [
    {
        id: '1',
        name: 'Information Technology',
        code: 'IT',
        description: 'Technology support and infrastructure management',
        managerEmail: 'it.manager@company.com',
        managerName: 'John Smith',
        userCount: 25,
        ticketCount: 145,
        status: 'active',
        settings: {
            autoAssign: true,
            escalationRules: true,
            restrictedAccess: false,
            slaOverride: '4h'
        },
        createdAt: '2023-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: '2',
        name: 'Human Resources',
        code: 'HR',
        description: 'Employee relations and HR services',
        managerEmail: 'hr.manager@company.com',
        managerName: 'Sarah Johnson',
        userCount: 12,
        ticketCount: 67,
        status: 'active',
        settings: {
            autoAssign: false,
            escalationRules: true,
            restrictedAccess: true,
            slaOverride: '2h'
        },
        createdAt: '2023-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: '3',
        name: 'Facilities',
        code: 'FAC',
        description: 'Building maintenance and facilities management',
        parentId: '4',
        parentName: 'Operations',
        managerEmail: 'facilities@company.com',
        managerName: 'Mike Wilson',
        userCount: 8,
        ticketCount: 34,
        status: 'active',
        settings: {
            autoAssign: true,
            escalationRules: false,
            restrictedAccess: false,
            slaOverride: '8h'
        },
        createdAt: '2023-02-01T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: '4',
        name: 'Operations',
        code: 'OPS',
        description: 'General operations and coordination',
        managerEmail: 'ops.manager@company.com',
        managerName: 'Lisa Chen',
        userCount: 30,
        ticketCount: 89,
        status: 'active',
        settings: {
            autoAssign: true,
            escalationRules: true,
            restrictedAccess: false
        },
        createdAt: '2023-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: '5',
        name: 'Finance',
        code: 'FIN',
        description: 'Financial services and accounting',
        managerEmail: 'finance@company.com',
        managerName: 'David Brown',
        userCount: 15,
        ticketCount: 23,
        status: 'active',
        settings: {
            autoAssign: false,
            escalationRules: true,
            restrictedAccess: true,
            slaOverride: '1h'
        },
        createdAt: '2023-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    }
];
export default function DepartmentsPage() {
    const [departments, setDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        parentId: '',
        managerEmail: '',
        status: 'active',
        settings: {
            autoAssign: false,
            escalationRules: false,
            restrictedAccess: false,
            slaOverride: ''
        }
    });
    // Simulate API call
    useEffect(() => {
        const timer = setTimeout(() => {
            setDepartments(mockDepartments);
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);
    const filteredDepartments = departments.filter(dept => dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const handleCreateDepartment = () => {
        setIsCreating(true);
        setFormData({
            name: '',
            code: '',
            description: '',
            parentId: '',
            managerEmail: '',
            status: 'active',
            settings: {
                autoAssign: false,
                escalationRules: false,
                restrictedAccess: false,
                slaOverride: ''
            }
        });
    };
    const handleEditDepartment = (department) => {
        setSelectedDepartment(department);
        setIsEditing(true);
        setFormData({
            name: department.name,
            code: department.code,
            description: department.description,
            parentId: department.parentId || '',
            managerEmail: department.managerEmail || '',
            status: department.status,
            settings: Object.assign(Object.assign({}, department.settings), { slaOverride: department.settings.slaOverride || '' })
        });
    };
    const handleSave = () => {
        var _a;
        if (isCreating) {
            const newDepartment = Object.assign(Object.assign({ id: Date.now().toString() }, formData), { managerName: formData.managerEmail ? 'New Manager' : undefined, userCount: 0, ticketCount: 0, parentName: formData.parentId ? (_a = departments.find(d => d.id === formData.parentId)) === null || _a === void 0 ? void 0 : _a.name : undefined, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
            setDepartments([...departments, newDepartment]);
            setIsCreating(false);
        }
        else if (isEditing && selectedDepartment) {
            const updatedDepartments = departments.map(dept => {
                var _a;
                return dept.id === selectedDepartment.id
                    ? Object.assign(Object.assign(Object.assign({}, dept), formData), { managerName: formData.managerEmail ? dept.managerName || 'Manager' : undefined, parentName: formData.parentId ? (_a = departments.find(d => d.id === formData.parentId)) === null || _a === void 0 ? void 0 : _a.name : undefined, updatedAt: new Date().toISOString() }) : dept;
            });
            setDepartments(updatedDepartments);
            setIsEditing(false);
            setSelectedDepartment(null);
        }
    };
    const handleDelete = (department) => {
        setDepartments(departments.filter(dept => dept.id !== department.id));
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
            case 'inactive':
                return <Badge variant="secondary">Inactive</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };
    const DepartmentForm = () => (<div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Department Name</Label>
          <Input id="name" value={formData.name} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { name: e.target.value }))} placeholder="e.g., Information Technology"/>
        </div>
        <div>
          <Label htmlFor="code">Department Code</Label>
          <Input id="code" value={formData.code} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { code: e.target.value }))} placeholder="e.g., IT"/>
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={formData.description} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { description: e.target.value }))} placeholder="Brief description of the department's responsibilities" rows={3}/>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="parentId">Parent Department</Label>
          <Select value={formData.parentId} onValueChange={(value) => setFormData(Object.assign(Object.assign({}, formData), { parentId: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select parent department"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {departments.map(dept => (<SelectItem key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="managerEmail">Manager Email</Label>
          <Input id="managerEmail" type="email" value={formData.managerEmail} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { managerEmail: e.target.value }))} placeholder="manager@company.com"/>
        </div>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData(Object.assign(Object.assign({}, formData), { status: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label>Department Settings</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="autoAssign" title="Auto-assign tickets to department members" checked={formData.settings.autoAssign} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { settings: Object.assign(Object.assign({}, formData.settings), { autoAssign: e.target.checked }) }))}/>
            <Label htmlFor="autoAssign" className="text-sm">Auto-assign tickets to department members</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="escalationRules" title="Enable escalation rules" checked={formData.settings.escalationRules} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { settings: Object.assign(Object.assign({}, formData.settings), { escalationRules: e.target.checked }) }))}/>
            <Label htmlFor="escalationRules" className="text-sm">Enable escalation rules</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="restrictedAccess" title="Restricted access (HR/sensitive departments)" checked={formData.settings.restrictedAccess} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { settings: Object.assign(Object.assign({}, formData.settings), { restrictedAccess: e.target.checked }) }))}/>
            <Label htmlFor="restrictedAccess" className="text-sm">Restricted access (HR/sensitive departments)</Label>
          </div>
        </div>
        <div>
          <Label htmlFor="slaOverride">SLA Override</Label>
          <Input id="slaOverride" value={formData.settings.slaOverride} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { settings: Object.assign(Object.assign({}, formData.settings), { slaOverride: e.target.value }) }))} placeholder="e.g., 4h, 2h, 1h"/>
        </div>
      </div>
    </div>);
    if (loading) {
        return (<div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading departments...</div>
      </div>);
    }
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Departments</h1>
          <p className="text-gray-600">Manage organizational departments and access control</p>
        </div>
        <Button onClick={handleCreateDepartment} className="flex items-center space-x-2">
          <Plus className="h-4 w-4"/>
          <span>Add Department</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
          <Input placeholder="Search departments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/>
        </div>
      </div>

      {/* Department Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600"/>
              <span className="text-sm text-gray-600">Total Departments</span>
            </div>
            <div className="text-2xl font-bold">{departments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600"/>
              <span className="text-sm text-gray-600">Total Users</span>
            </div>
            <div className="text-2xl font-bold">{departments.reduce((sum, dept) => sum + dept.userCount, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-orange-600"/>
              <span className="text-sm text-gray-600">Total Tickets</span>
            </div>
            <div className="text-2xl font-bold">{departments.reduce((sum, dept) => sum + dept.ticketCount, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-600"/>
              <span className="text-sm text-gray-600">Restricted Access</span>
            </div>
            <div className="text-2xl font-bold">
              {departments.filter(dept => dept.settings.restrictedAccess).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Departments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Departments ({filteredDepartments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Tickets</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Settings</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.map((department) => (<TableRow key={department.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{department.name}</div>
                      <div className="text-sm text-gray-500">{department.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{department.code}</Badge>
                  </TableCell>
                  <TableCell>
                    {department.parentName ? (<span className="text-sm text-gray-600">{department.parentName}</span>) : (<span className="text-sm text-gray-400">None</span>)}
                  </TableCell>
                  <TableCell>
                    {department.managerName ? (<div>
                        <div className="text-sm font-medium">{department.managerName}</div>
                        <div className="text-xs text-gray-500">{department.managerEmail}</div>
                      </div>) : (<span className="text-sm text-gray-400">Not assigned</span>)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-gray-400"/>
                      <span>{department.userCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4 text-gray-400"/>
                      <span>{department.ticketCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(department.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {department.settings.autoAssign && (<Badge variant="secondary" className="text-xs">Auto</Badge>)}
                      {department.settings.escalationRules && (<Badge variant="secondary" className="text-xs">Escalation</Badge>)}
                      {department.settings.restrictedAccess && (<Badge variant="destructive" className="text-xs">Restricted</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditDepartment(department)}>
                        <Edit className="h-4 w-4"/>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4"/>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Department</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{department.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(department)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Department Sheet */}
      <Sheet open={isCreating || isEditing} onOpenChange={(open) => {
            if (!open) {
                setIsCreating(false);
                setIsEditing(false);
                setSelectedDepartment(null);
            }
        }}>
        <SheetContent className="w-[600px]">
          <SheetHeader>
            <SheetTitle>
              {isCreating ? 'Create New Department' : 'Edit Department'}
            </SheetTitle>
            <SheetDescription>
              {isCreating
            ? 'Create a new department with access controls and settings.'
            : 'Update department information and settings.'}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <DepartmentForm />
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => {
            setIsCreating(false);
            setIsEditing(false);
            setSelectedDepartment(null);
        }}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {isCreating ? 'Create Department' : 'Update Department'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>);
}
