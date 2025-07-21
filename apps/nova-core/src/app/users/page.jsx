'use client';
import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Users, Plus, Search, Edit, Trash2, Shield, Mail, CheckCircle, XCircle } from 'lucide-react';
export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showCreateSheet, setShowCreateSheet] = useState(false);
    const [showEditSheet, setShowEditSheet] = useState(false);
    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);
    const fetchUsers = async () => {
        try {
            setLoading(true);
            // Use shared API client
            const data = await apiRequest('/api/v2/users');
            setUsers(data.users || []);
        }
        catch (error) {
            console.error('Error fetching users:', error);
            // Mock data for development
            setUsers([
                {
                    id: '1',
                    email: 'admin@cueit.com',
                    firstName: 'Admin',
                    lastName: 'User',
                    displayName: 'Admin User',
                    department: 'IT',
                    title: 'System Administrator',
                    phone: '+1 (555) 123-4567',
                    location: 'New York, NY',
                    status: 'ACTIVE',
                    isAdmin: true,
                    createdAt: '2023-01-01T00:00:00Z',
                    lastLoginAt: '2024-01-15T10:30:00Z'
                },
                {
                    id: '2',
                    email: 'john.doe@cueit.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    displayName: 'John Doe',
                    department: 'Engineering',
                    title: 'Software Engineer',
                    phone: '+1 (555) 987-6543',
                    location: 'San Francisco, CA',
                    status: 'ACTIVE',
                    isAdmin: false,
                    createdAt: '2023-03-15T00:00:00Z',
                    lastLoginAt: '2024-01-14T14:22:00Z'
                }
            ]);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchRoles = async () => {
        try {
            const response = await fetch('/api/v2/roles');
            if (!response.ok) {
                throw new Error('Failed to fetch roles');
            }
            const data = await response.json();
            setRoles(data.roles || []);
        }
        catch (error) {
            console.error('Error fetching roles:', error);
            // Mock data for development
            setRoles([
                { id: '1', name: 'admin', description: 'System Administrator' },
                { id: '2', name: 'tech_lead', description: 'Technical Lead' },
                { id: '3', name: 'technician', description: 'Technician' },
                { id: '4', name: 'end_user', description: 'End User' }
            ]);
        }
    };
    const filteredUsers = users.filter(user => user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
    const handleCreateUser = (userData) => {
        // Implementation would call API
        console.log('Creating user:', userData);
        setShowCreateSheet(false);
        fetchUsers();
    };
    const handleEditUser = (userData) => {
        // Implementation would call API
        console.log('Editing user:', userData);
        setShowEditSheet(false);
        fetchUsers();
    };
    const handleDeleteUser = async (userId) => {
        try {
            // Implementation would call API
            console.log('Deleting user:', userId);
            setUsers(users.filter(user => user.id !== userId));
        }
        catch (error) {
            console.error('Error deleting user:', error);
        }
    };
    const getStatusBadge = (status) => {
        const statusConfig = {
            ACTIVE: { variant: 'default', icon: CheckCircle },
            INACTIVE: { variant: 'secondary', icon: XCircle },
            SUSPENDED: { variant: 'destructive', icon: XCircle }
        };
        const config = statusConfig[status];
        const Icon = config.icon;
        return (<Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3"/>
        {status.toLowerCase()}
      </Badge>);
    };
    if (loading) {
        return (<div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>);
    }
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6"/>
          <h1 className="text-3xl font-bold">Users</h1>
        </div>
        <Sheet open={showCreateSheet} onOpenChange={setShowCreateSheet}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2"/>
              Add User
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Create New User</SheetTitle>
              <SheetDescription>
                Add a new user to the system with appropriate roles and permissions.
              </SheetDescription>
            </SheetHeader>
            <UserForm onSubmit={handleCreateUser} onCancel={() => setShowCreateSheet(false)}/>
          </SheetContent>
        </Sheet>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
          <Input placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/>
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status"/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (<TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600"/>
                      </div>
                      <div>
                        <div className="font-medium">{user.displayName}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1"/>
                          {user.email}
                        </div>
                        {user.isAdmin && (<Badge variant="outline" className="mt-1">
                            <Shield className="h-3 w-3 mr-1"/>
                            Admin
                          </Badge>)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{user.department || 'N/A'}</div>
                      <div className="text-gray-500">{user.title || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(user.status)}
                  </TableCell>
                  <TableCell>
                    {user.lastLoginAt ? (<div className="text-sm">
                        <div>{new Date(user.lastLoginAt).toLocaleDateString()}</div>
                        <div className="text-gray-500">{new Date(user.lastLoginAt).toLocaleTimeString()}</div>
                      </div>) : (<span className="text-gray-400">Never</span>)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Sheet open={showEditSheet} onOpenChange={setShowEditSheet}>
                        <SheetTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                            <Edit className="h-4 w-4"/>
                          </Button>
                        </SheetTrigger>
                        <SheetContent>
                          <SheetHeader>
                            <SheetTitle>Edit User</SheetTitle>
                            <SheetDescription>
                              Update user information and permissions.
                            </SheetDescription>
                          </SheetHeader>
                          <UserForm user={selectedUser} onSubmit={handleEditUser} onCancel={() => setShowEditSheet(false)}/>
                        </SheetContent>
                      </Sheet>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4"/>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the user
                              and remove all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
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
    </div>);
}
function UserForm({ user, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        email: (user === null || user === void 0 ? void 0 : user.email) || '',
        firstName: (user === null || user === void 0 ? void 0 : user.firstName) || '',
        lastName: (user === null || user === void 0 ? void 0 : user.lastName) || '',
        displayName: (user === null || user === void 0 ? void 0 : user.displayName) || '',
        department: (user === null || user === void 0 ? void 0 : user.department) || '',
        title: (user === null || user === void 0 ? void 0 : user.title) || '',
        phone: (user === null || user === void 0 ? void 0 : user.phone) || '',
        location: (user === null || user === void 0 ? void 0 : user.location) || '',
        status: (user === null || user === void 0 ? void 0 : user.status) || 'ACTIVE',
        isAdmin: (user === null || user === void 0 ? void 0 : user.isAdmin) || false,
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };
    return (<form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { firstName: e.target.value }))} required/>
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { lastName: e.target.value }))} required/>
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { email: e.target.value }))} required/>
      </div>

      <div>
        <Label htmlFor="displayName">Display Name</Label>
        <Input id="displayName" value={formData.displayName} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { displayName: e.target.value }))}/>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="department">Department</Label>
          <Input id="department" value={formData.department} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { department: e.target.value }))}/>
        </div>
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={formData.title} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { title: e.target.value }))}/>
        </div>
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" value={formData.phone} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { phone: e.target.value }))}/>
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input id="location" value={formData.location} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { location: e.target.value }))}/>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData(Object.assign(Object.assign({}, formData), { status: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <input type="checkbox" id="isAdmin" checked={formData.isAdmin} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { isAdmin: e.target.checked }))} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
        <Label htmlFor="isAdmin">System Administrator</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {user ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>);
}
