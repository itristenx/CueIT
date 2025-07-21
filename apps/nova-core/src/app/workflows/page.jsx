'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from '@/components/ui/alert-dialog';
import { Workflow, Plus, Search, Edit, Trash2, Play, Pause, Copy, ArrowRight, Zap, Clock, Users, Mail, MessageSquare, CheckCircle, XCircle, AlertTriangle, Settings } from 'lucide-react';
// Mock data for workflow rules
const mockWorkflows = [
    {
        id: '1',
        name: 'Auto-assign IT Tickets',
        description: 'Automatically assign new IT tickets to available technicians',
        enabled: true,
        trigger: {
            type: 'ticket_created',
            conditions: [
                { id: '1', field: 'department', operator: 'equals', value: 'IT' },
                { id: '2', field: 'priority', operator: 'in', value: ['medium', 'high'] }
            ]
        },
        actions: [
            {
                id: '1',
                type: 'assign',
                label: 'Auto-assign to IT team',
                config: { assigneeType: 'department', department: 'IT' }
            },
            {
                id: '2',
                type: 'notify',
                label: 'Notify assignee',
                config: { recipients: ['assignee'], template: 'new_assignment' }
            }
        ],
        priority: 1,
        department: 'IT',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        executionCount: 142,
        lastExecuted: '2024-01-15T14:30:00Z'
    },
    {
        id: '2',
        name: 'HR Ticket Escalation',
        description: 'Escalate HR tickets that remain open for more than 2 hours',
        enabled: true,
        trigger: {
            type: 'time_elapsed',
            conditions: [
                { id: '1', field: 'department', operator: 'equals', value: 'HR' },
                { id: '2', field: 'status', operator: 'equals', value: 'open' },
                { id: '3', field: 'elapsed_time', operator: 'greater_than', value: '2h' }
            ]
        },
        actions: [
            {
                id: '1',
                type: 'escalate',
                label: 'Escalate to HR Manager',
                config: { escalateTo: 'hr_manager', priority: 'high' }
            },
            {
                id: '2',
                type: 'notify',
                label: 'Send escalation notification',
                config: { recipients: ['hr_manager', 'requester'], template: 'escalation_alert' }
            }
        ],
        priority: 2,
        department: 'HR',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        executionCount: 23,
        lastExecuted: '2024-01-15T13:45:00Z'
    },
    {
        id: '3',
        name: 'Critical Issue Alert',
        description: 'Immediately notify management for critical priority tickets',
        enabled: true,
        trigger: {
            type: 'ticket_created',
            conditions: [
                { id: '1', field: 'priority', operator: 'equals', value: 'critical' }
            ]
        },
        actions: [
            {
                id: '1',
                type: 'notify',
                label: 'Alert management',
                config: { recipients: ['management'], template: 'critical_alert' }
            },
            {
                id: '2',
                type: 'assign',
                label: 'Assign to senior tech',
                config: { assigneeType: 'role', role: 'senior_technician' }
            }
        ],
        priority: 3,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        executionCount: 8,
        lastExecuted: '2024-01-15T12:15:00Z'
    },
    {
        id: '4',
        name: 'Auto-close Resolved Tickets',
        description: 'Automatically close tickets marked as resolved after 24 hours',
        enabled: false,
        trigger: {
            type: 'time_elapsed',
            conditions: [
                { id: '1', field: 'status', operator: 'equals', value: 'resolved' },
                { id: '2', field: 'elapsed_time', operator: 'greater_than', value: '24h' }
            ]
        },
        actions: [
            {
                id: '1',
                type: 'close',
                label: 'Auto-close ticket',
                config: { reason: 'auto_close_resolved' }
            },
            {
                id: '2',
                type: 'add_comment',
                label: 'Add closure comment',
                config: { comment: 'Automatically closed after 24 hours in resolved state' }
            }
        ],
        priority: 4,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        executionCount: 0
    }
];
export default function WorkflowBuilderPage() {
    const [workflows, setWorkflows] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        enabled: true,
        department: '',
        priority: 1,
        triggerType: 'ticket_created',
        conditions: [],
        actions: []
    });
    // Simulate API call
    useEffect(() => {
        const timer = setTimeout(() => {
            setWorkflows(mockWorkflows);
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);
    const filteredWorkflows = workflows.filter(workflow => {
        var _a;
        return workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            workflow.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ((_a = workflow.department) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase()));
    });
    const handleCreateWorkflow = () => {
        setIsCreating(true);
        setFormData({
            name: '',
            description: '',
            enabled: true,
            department: '',
            priority: 1,
            triggerType: 'ticket_created',
            conditions: [],
            actions: []
        });
    };
    const handleEditWorkflow = (workflow) => {
        setSelectedWorkflow(workflow);
        setIsEditing(true);
        setFormData({
            name: workflow.name,
            description: workflow.description,
            enabled: workflow.enabled,
            department: workflow.department || '',
            priority: workflow.priority,
            triggerType: workflow.trigger.type,
            conditions: workflow.trigger.conditions,
            actions: workflow.actions
        });
    };
    const handleToggleWorkflow = (workflow) => {
        const updatedWorkflows = workflows.map(w => w.id === workflow.id ? Object.assign(Object.assign({}, w), { enabled: !w.enabled }) : w);
        setWorkflows(updatedWorkflows);
    };
    const handleDuplicateWorkflow = (workflow) => {
        const newWorkflow = Object.assign(Object.assign({}, workflow), { id: Date.now().toString(), name: `${workflow.name} (Copy)`, enabled: false, executionCount: 0, lastExecuted: undefined, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        setWorkflows([...workflows, newWorkflow]);
    };
    const handleDeleteWorkflow = (workflow) => {
        setWorkflows(workflows.filter(w => w.id !== workflow.id));
    };
    const handleSave = () => {
        if (isCreating) {
            const newWorkflow = {
                id: Date.now().toString(),
                name: formData.name,
                description: formData.description,
                enabled: formData.enabled,
                department: formData.department,
                priority: formData.priority,
                trigger: {
                    type: formData.triggerType,
                    conditions: formData.conditions
                },
                actions: formData.actions,
                executionCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            setWorkflows([...workflows, newWorkflow]);
            setIsCreating(false);
        }
        else if (isEditing && selectedWorkflow) {
            const updatedWorkflows = workflows.map(w => w.id === selectedWorkflow.id
                ? Object.assign(Object.assign({}, w), { name: formData.name, description: formData.description, enabled: formData.enabled, department: formData.department, priority: formData.priority, trigger: {
                        type: formData.triggerType,
                        conditions: formData.conditions
                    }, actions: formData.actions, updatedAt: new Date().toISOString() }) : w);
            setWorkflows(updatedWorkflows);
            setIsEditing(false);
            setSelectedWorkflow(null);
        }
    };
    const getTriggerIcon = (type) => {
        switch (type) {
            case 'ticket_created':
                return <Plus className="h-4 w-4 text-green-600"/>;
            case 'ticket_updated':
                return <Edit className="h-4 w-4 text-blue-600"/>;
            case 'status_changed':
                return <ArrowRight className="h-4 w-4 text-orange-600"/>;
            case 'priority_changed':
                return <AlertTriangle className="h-4 w-4 text-red-600"/>;
            case 'time_elapsed':
                return <Clock className="h-4 w-4 text-purple-600"/>;
            default:
                return <Zap className="h-4 w-4 text-gray-600"/>;
        }
    };
    const getActionIcon = (type) => {
        switch (type) {
            case 'assign':
                return <Users className="h-4 w-4 text-blue-600"/>;
            case 'notify':
                return <Mail className="h-4 w-4 text-green-600"/>;
            case 'escalate':
                return <ArrowRight className="h-4 w-4 text-orange-600"/>;
            case 'close':
                return <XCircle className="h-4 w-4 text-red-600"/>;
            case 'update_status':
                return <Settings className="h-4 w-4 text-purple-600"/>;
            case 'add_comment':
                return <MessageSquare className="h-4 w-4 text-gray-600"/>;
            default:
                return <Zap className="h-4 w-4 text-gray-600"/>;
        }
    };
    const getStatusBadge = (enabled) => {
        return enabled ? (<Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1"/>
        Active
      </Badge>) : (<Badge variant="secondary">
        <Pause className="h-3 w-3 mr-1"/>
        Inactive
      </Badge>);
    };
    const WorkflowForm = () => (<div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Workflow Name</Label>
          <Input id="name" value={formData.name} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { name: e.target.value }))} placeholder="e.g., Auto-assign IT Tickets"/>
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={formData.description} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { description: e.target.value }))} placeholder="Describe what this workflow does..." rows={3}/>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="department">Department</Label>
            <Select value={formData.department} onValueChange={(value) => setFormData(Object.assign(Object.assign({}, formData), { department: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select department"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="Facilities">Facilities</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Input id="priority" type="number" value={formData.priority} onChange={(e) => setFormData(Object.assign(Object.assign({}, formData), { priority: parseInt(e.target.value) }))} min="1" max="10"/>
          </div>
        </div>

        <div>
          <Label>Trigger Type</Label>
          <Select value={formData.triggerType} onValueChange={(value) => setFormData(Object.assign(Object.assign({}, formData), { triggerType: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ticket_created">Ticket Created</SelectItem>
              <SelectItem value="ticket_updated">Ticket Updated</SelectItem>
              <SelectItem value="status_changed">Status Changed</SelectItem>
              <SelectItem value="priority_changed">Priority Changed</SelectItem>
              <SelectItem value="time_elapsed">Time Elapsed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <Label className="text-base font-medium">Conditions</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => {
            const newCondition = {
                id: Date.now().toString(),
                field: 'department',
                operator: 'equals',
                value: ''
            };
            setFormData(Object.assign(Object.assign({}, formData), { conditions: [...formData.conditions, newCondition] }));
        }}>
            <Plus className="h-4 w-4 mr-1"/>
            Add Condition
          </Button>
        </div>
        
        <div className="space-y-2">
          {formData.conditions.map((condition, index) => (<div key={condition.id} className="flex items-center space-x-2 p-3 border rounded">
              <Select value={condition.field} onValueChange={(value) => {
                const updated = [...formData.conditions];
                updated[index] = Object.assign(Object.assign({}, condition), { field: value });
                setFormData(Object.assign(Object.assign({}, formData), { conditions: updated }));
            }}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="requester">Requester</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={condition.operator} onValueChange={(value) => {
                const updated = [...formData.conditions];
                updated[index] = Object.assign(Object.assign({}, condition), { operator: value });
                setFormData(Object.assign(Object.assign({}, formData), { conditions: updated }));
            }}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="greater_than">Greater Than</SelectItem>
                  <SelectItem value="less_than">Less Than</SelectItem>
                  <SelectItem value="in">In</SelectItem>
                </SelectContent>
              </Select>
              
              <Input value={condition.value} onChange={(e) => {
                const updated = [...formData.conditions];
                updated[index] = Object.assign(Object.assign({}, condition), { value: e.target.value });
                setFormData(Object.assign(Object.assign({}, formData), { conditions: updated }));
            }} placeholder="Value" className="flex-1"/>
              
              <Button type="button" variant="ghost" size="sm" onClick={() => {
                const updated = formData.conditions.filter((_, i) => i !== index);
                setFormData(Object.assign(Object.assign({}, formData), { conditions: updated }));
            }}>
                <Trash2 className="h-4 w-4"/>
              </Button>
            </div>))}
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <Label className="text-base font-medium">Actions</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => {
            const newAction = {
                id: Date.now().toString(),
                type: 'notify',
                label: 'New Action',
                config: {}
            };
            setFormData(Object.assign(Object.assign({}, formData), { actions: [...formData.actions, newAction] }));
        }}>
            <Plus className="h-4 w-4 mr-1"/>
            Add Action
          </Button>
        </div>
        
        <div className="space-y-2">
          {formData.actions.map((action, index) => (<div key={action.id} className="flex items-center space-x-2 p-3 border rounded">
              <Select value={action.type} onValueChange={(value) => {
                const updated = [...formData.actions];
                updated[index] = Object.assign(Object.assign({}, action), { type: value });
                setFormData(Object.assign(Object.assign({}, formData), { actions: updated }));
            }}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assign">Assign</SelectItem>
                  <SelectItem value="notify">Notify</SelectItem>
                  <SelectItem value="escalate">Escalate</SelectItem>
                  <SelectItem value="close">Close</SelectItem>
                  <SelectItem value="update_status">Update Status</SelectItem>
                  <SelectItem value="add_comment">Add Comment</SelectItem>
                </SelectContent>
              </Select>
              
              <Input value={action.label} onChange={(e) => {
                const updated = [...formData.actions];
                updated[index] = Object.assign(Object.assign({}, action), { label: e.target.value });
                setFormData(Object.assign(Object.assign({}, formData), { actions: updated }));
            }} placeholder="Action label" className="flex-1"/>
              
              <Button type="button" variant="ghost" size="sm" onClick={() => {
                const updated = formData.actions.filter((_, i) => i !== index);
                setFormData(Object.assign(Object.assign({}, formData), { actions: updated }));
            }}>
                <Trash2 className="h-4 w-4"/>
              </Button>
            </div>))}
        </div>
      </div>
    </div>);
    if (loading) {
        return (<div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading workflows...</div>
      </div>);
    }
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workflow Builder</h1>
          <p className="text-gray-600">Create and manage automated workflows for ticket processing</p>
        </div>
        <Button onClick={handleCreateWorkflow} className="flex items-center space-x-2">
          <Plus className="h-4 w-4"/>
          <span>Create Workflow</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
          <Input placeholder="Search workflows..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/>
        </div>
      </div>

      {/* Workflow Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Workflow className="h-5 w-5 text-blue-600"/>
              <span className="text-sm text-gray-600">Total Workflows</span>
            </div>
            <div className="text-2xl font-bold">{workflows.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600"/>
              <span className="text-sm text-gray-600">Active</span>
            </div>
            <div className="text-2xl font-bold">{workflows.filter(w => w.enabled).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Pause className="h-5 w-5 text-orange-600"/>
              <span className="text-sm text-gray-600">Inactive</span>
            </div>
            <div className="text-2xl font-bold">{workflows.filter(w => !w.enabled).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-purple-600"/>
              <span className="text-sm text-gray-600">Total Executions</span>
            </div>
            <div className="text-2xl font-bold">{workflows.reduce((sum, w) => sum + w.executionCount, 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {filteredWorkflows.map((workflow) => (<Card key={workflow.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold">{workflow.name}</h3>
                    {getStatusBadge(workflow.enabled)}
                    {workflow.department && (<Badge variant="outline">{workflow.department}</Badge>)}
                  </div>
                  <p className="text-gray-600 mt-1">{workflow.description}</p>
                  
                  <div className="flex items-center space-x-6 mt-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Trigger:</span>
                      {getTriggerIcon(workflow.trigger.type)}
                      <span className="text-sm text-gray-600">
                        {workflow.trigger.type.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Actions:</span>
                      <div className="flex space-x-1">
                        {workflow.actions.slice(0, 3).map((action) => (<div key={action.id} className="flex items-center space-x-1">
                            {getActionIcon(action.type)}
                          </div>))}
                        {workflow.actions.length > 3 && (<span className="text-sm text-gray-500">+{workflow.actions.length - 3} more</span>)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Executions:</span>
                      <Badge variant="secondary">{workflow.executionCount}</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleToggleWorkflow(workflow)} title={workflow.enabled ? 'Disable workflow' : 'Enable workflow'}>
                    {workflow.enabled ? <Pause className="h-4 w-4"/> : <Play className="h-4 w-4"/>}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDuplicateWorkflow(workflow)} title="Duplicate workflow">
                    <Copy className="h-4 w-4"/>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEditWorkflow(workflow)} title="Edit workflow">
                    <Edit className="h-4 w-4"/>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" title="Delete workflow">
                        <Trash2 className="h-4 w-4"/>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{workflow.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteWorkflow(workflow)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>))}
      </div>

      {/* Create/Edit Workflow Sheet */}
      <Sheet open={isCreating || isEditing} onOpenChange={(open) => {
            if (!open) {
                setIsCreating(false);
                setIsEditing(false);
                setSelectedWorkflow(null);
            }
        }}>
        <SheetContent className="w-[800px]">
          <SheetHeader>
            <SheetTitle>
              {isCreating ? 'Create New Workflow' : 'Edit Workflow'}
            </SheetTitle>
            <SheetDescription>
              {isCreating
            ? 'Create a new automated workflow for ticket processing.'
            : 'Update the workflow configuration.'}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <WorkflowForm />
            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => {
            setIsCreating(false);
            setIsEditing(false);
            setSelectedWorkflow(null);
        }}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {isCreating ? 'Create Workflow' : 'Update Workflow'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>);
}
