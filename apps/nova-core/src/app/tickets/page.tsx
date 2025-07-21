'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Ticket, 
  Plus, 
  Search, 
  Edit, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Calendar,
  Tag,
  MessageSquare
} from 'lucide-react';

interface TicketData {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  category?: string;
  subcategory?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  dueDate?: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  commentsCount: number;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [showViewSheet, setShowViewSheet] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      // Use shared API client
      const data = await apiRequest('/api/v2/tickets');
      setTickets(data.tickets || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      // Mock data for development
      setTickets([
        {
          id: '1',
          ticketNumber: 'TK-2024-001',
          title: 'Unable to access email',
          description: 'User cannot access their email account after password reset',
          priority: 'HIGH',
          status: 'OPEN',
          category: 'IT Support',
          subcategory: 'Email',
          tags: ['email', 'password', 'access'],
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          dueDate: '2024-01-16T10:30:00Z',
          creator: {
            id: '2',
            name: 'John Doe',
            email: 'john.doe@cueit.com'
          },
          assignee: {
            id: '1',
            name: 'Admin User',
            email: 'admin@cueit.com'
          },
          commentsCount: 3
        },
        {
          id: '2',
          ticketNumber: 'TK-2024-002',
          title: 'New software request',
          description: 'Request for Adobe Creative Suite license',
          priority: 'MEDIUM',
          status: 'IN_PROGRESS',
          category: 'Software',
          subcategory: 'License Request',
          tags: ['adobe', 'license', 'software'],
          createdAt: '2024-01-14T09:15:00Z',
          updatedAt: '2024-01-15T14:22:00Z',
          creator: {
            id: '3',
            name: 'Jane Smith',
            email: 'jane.smith@cueit.com'
          },
          assignee: {
            id: '1',
            name: 'Admin User',
            email: 'admin@cueit.com'
          },
          commentsCount: 1
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityBadge = (priority: TicketData['priority']) => {
    const priorityConfig = {
      LOW: { variant: 'secondary' as const, color: 'text-green-600' },
      MEDIUM: { variant: 'default' as const, color: 'text-yellow-600' },
      HIGH: { variant: 'destructive' as const, color: 'text-orange-600' },
      URGENT: { variant: 'destructive' as const, color: 'text-red-600' }
    };

    const config = priorityConfig[priority];
    return (
      <Badge variant={config.variant} className={config.color}>
        {priority.toLowerCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: TicketData['status']) => {
    const statusConfig = {
      OPEN: { variant: 'destructive' as const, icon: AlertTriangle },
      IN_PROGRESS: { variant: 'default' as const, icon: Clock },
      RESOLVED: { variant: 'default' as const, icon: CheckCircle },
      CLOSED: { variant: 'secondary' as const, icon: XCircle }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.toLowerCase().replace('_', ' ')}
      </Badge>
    );
  };

  const handleCreateTicket = (ticketData: Partial<TicketData>) => {
    // Implementation would call API
    console.log('Creating ticket:', ticketData);
    setShowCreateSheet(false);
    fetchTickets();
  };

  const handleViewTicket = (ticket: TicketData) => {
    setSelectedTicket(ticket);
    setShowViewSheet(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Ticket className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Tickets</h1>
        </div>
        <Sheet open={showCreateSheet} onOpenChange={setShowCreateSheet}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[600px] sm:w-[600px]">
            <SheetHeader>
              <SheetTitle>Create New Ticket</SheetTitle>
              <SheetDescription>
                Create a new support ticket for tracking issues and requests.
              </SheetDescription>
            </SheetHeader>
            <TicketForm onSubmit={handleCreateTicket} onCancel={() => setShowCreateSheet(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{ticket.ticketNumber}</div>
                      <div className="text-sm text-gray-900">{ticket.title}</div>
                      <div className="text-xs text-gray-500">{ticket.category}</div>
                      {ticket.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {ticket.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag className="h-2 w-2 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                          {ticket.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{ticket.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div className="text-sm">
                        <div className="font-medium">{ticket.creator.name}</div>
                        <div className="text-gray-500">{ticket.creator.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {ticket.assignee ? (
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div className="text-sm">
                          <div className="font-medium">{ticket.assignee.name}</div>
                          <div className="text-gray-500">{ticket.assignee.email}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getPriorityBadge(ticket.priority)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(ticket.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-gray-500">{new Date(ticket.createdAt).toLocaleTimeString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewTicket(ticket)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
                        {ticket.commentsCount}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Ticket Sheet */}
      <Sheet open={showViewSheet} onOpenChange={setShowViewSheet}>
        <SheetContent className="w-[600px] sm:w-[600px]">
          <SheetHeader>
            <SheetTitle>Ticket Details</SheetTitle>
            <SheetDescription>
              {selectedTicket?.ticketNumber} - {selectedTicket?.title}
            </SheetDescription>
          </SheetHeader>
          {selectedTicket && <TicketDetails ticket={selectedTicket} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

interface TicketFormProps {
  onSubmit: (ticketData: Partial<TicketData>) => void;
  onCancel: () => void;
}

function TicketForm({ onSubmit, onCancel }: TicketFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as TicketData['priority'],
    category: '',
    subcategory: '',
    tags: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as TicketData['priority'] })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="subcategory">Subcategory</Label>
        <Input
          id="subcategory"
          value={formData.subcategory}
          onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="bug, urgent, network"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Ticket</Button>
      </div>
    </form>
  );
}

interface TicketDetailsProps {
  ticket: TicketData;
}

function TicketDetails({ ticket }: TicketDetailsProps) {
  return (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Ticket Number</Label>
          <div className="font-mono text-sm">{ticket.ticketNumber}</div>
        </div>
        <div>
          <Label>Status</Label>
          <div className="mt-1">
            <Badge variant="default">{ticket.status}</Badge>
          </div>
        </div>
      </div>

      <div>
        <Label>Title</Label>
        <div className="font-medium">{ticket.title}</div>
      </div>

      <div>
        <Label>Description</Label>
        <div className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Priority</Label>
          <div className="mt-1">
            <Badge variant="destructive">{ticket.priority}</Badge>
          </div>
        </div>
        <div>
          <Label>Category</Label>
          <div className="text-sm">{ticket.category}</div>
        </div>
      </div>

      <div>
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {ticket.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Created By</Label>
          <div className="text-sm">
            <div className="font-medium">{ticket.creator.name}</div>
            <div className="text-gray-500">{ticket.creator.email}</div>
          </div>
        </div>
        <div>
          <Label>Assigned To</Label>
          <div className="text-sm">
            {ticket.assignee ? (
              <>
                <div className="font-medium">{ticket.assignee.name}</div>
                <div className="text-gray-500">{ticket.assignee.email}</div>
              </>
            ) : (
              <span className="text-gray-400">Unassigned</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Created</Label>
          <div className="text-sm">{new Date(ticket.createdAt).toLocaleString()}</div>
        </div>
        <div>
          <Label>Last Updated</Label>
          <div className="text-sm">{new Date(ticket.updatedAt).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
