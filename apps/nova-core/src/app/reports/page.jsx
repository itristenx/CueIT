'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, Filter, TrendingUp, Clock, CheckCircle, Users, Ticket, BarChart3, PieChart as PieChartIcon, FileText } from 'lucide-react';
// Mock data for charts
const ticketTrendData = [
    { name: 'Jan', created: 45, resolved: 42, sla_met: 38 },
    { name: 'Feb', created: 52, resolved: 48, sla_met: 44 },
    { name: 'Mar', created: 38, resolved: 41, sla_met: 39 },
    { name: 'Apr', created: 61, resolved: 55, sla_met: 50 },
    { name: 'May', created: 42, resolved: 44, sla_met: 42 },
    { name: 'Jun', created: 58, resolved: 52, sla_met: 48 },
];
const categoryData = [
    { name: 'Hardware', value: 35, color: '#3B82F6' },
    { name: 'Software', value: 28, color: '#10B981' },
    { name: 'Network', value: 18, color: '#F59E0B' },
    { name: 'Access', value: 12, color: '#EF4444' },
    { name: 'Other', value: 7, color: '#8B5CF6' },
];
const departmentData = [
    { department: 'IT', open: 12, resolved: 45, avg_resolution: 2.3 },
    { department: 'HR', open: 8, resolved: 23, avg_resolution: 1.8 },
    { department: 'Finance', open: 5, resolved: 18, avg_resolution: 3.1 },
    { department: 'Operations', open: 15, resolved: 34, avg_resolution: 2.7 },
    { department: 'Marketing', open: 6, resolved: 12, avg_resolution: 1.9 },
];
const slaData = [
    { month: 'Jan', met: 85, missed: 15 },
    { month: 'Feb', met: 78, missed: 22 },
    { month: 'Mar', met: 92, missed: 8 },
    { month: 'Apr', met: 88, missed: 12 },
    { month: 'May', met: 95, missed: 5 },
    { month: 'Jun', met: 89, missed: 11 },
];
const techniciansData = [
    { name: 'John Smith', assigned: 23, resolved: 21, avg_time: 2.1, rating: 4.8 },
    { name: 'Sarah Johnson', assigned: 18, resolved: 19, avg_time: 1.9, rating: 4.9 },
    { name: 'Mike Davis', assigned: 25, resolved: 22, avg_time: 2.4, rating: 4.6 },
    { name: 'Lisa Anderson', assigned: 20, resolved: 18, avg_time: 2.8, rating: 4.7 },
    { name: 'Tom Wilson', assigned: 16, resolved: 17, avg_time: 2.2, rating: 4.5 },
];
// Color indicator component using Tailwind classes
const ColorIndicator = ({ color }) => {
    const colorClasses = {
        '#3B82F6': 'bg-blue-500',
        '#10B981': 'bg-green-500',
        '#F59E0B': 'bg-yellow-500',
        '#EF4444': 'bg-red-500',
        '#8B5CF6': 'bg-purple-500',
    };
    return (<div className={`w-3 h-3 rounded-full ${colorClasses[color] || 'bg-gray-500'}`}/>);
};
export default function ReportsPage() {
    const [dateRange, setDateRange] = useState('30');
    const [department, setDepartment] = useState('all');
    const [category, setCategory] = useState('all');
    const [isGenerating, setIsGenerating] = useState(false);
    const generateReport = async (format) => {
        setIsGenerating(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsGenerating(false);
        // In real implementation, this would trigger a download
        alert(`${format.toUpperCase()} report generated and downloaded!`);
    };
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Advanced Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive analytics and insights for your ITSM system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => generateReport('csv')} disabled={isGenerating}>
            <Download className="w-4 h-4 mr-2"/>
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => generateReport('excel')} disabled={isGenerating}>
            <Download className="w-4 h-4 mr-2"/>
            Export Excel
          </Button>
          <Button onClick={() => generateReport('pdf')} disabled={isGenerating}>
            <Download className="w-4 h-4 mr-2"/>
            {isGenerating ? 'Generating...' : 'Export PDF'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5"/>
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                  <SelectItem value="180">Last 6 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="hardware">Hardware</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="network">Network</SelectItem>
                  <SelectItem value="access">Access</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-sm text-green-600">+12% from last month</p>
              </div>
              <Ticket className="w-8 h-8 text-blue-500"/>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Resolution Time</p>
                <p className="text-2xl font-bold">2.3 days</p>
                <p className="text-sm text-green-600">-0.4 days from last month</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500"/>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">SLA Compliance</p>
                <p className="text-2xl font-bold">89%</p>
                <p className="text-sm text-red-600">-3% from last month</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500"/>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Customer Satisfaction</p>
                <p className="text-2xl font-bold">4.7/5</p>
                <p className="text-sm text-green-600">+0.2 from last month</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500"/>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Reports */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Ticket Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="sla">SLA Performance</TabsTrigger>
          <TabsTrigger value="technicians">Technicians</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5"/>
                Ticket Trends Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={ticketTrendData}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="name"/>
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="created" stroke="#3B82F6" name="Created"/>
                  <Line type="monotone" dataKey="resolved" stroke="#10B981" name="Resolved"/>
                  <Line type="monotone" dataKey="sla_met" stroke="#F59E0B" name="SLA Met"/>
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5"/>
                  Tickets by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {categoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color}/>))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Category Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((category, index) => (<div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ColorIndicator color={category.color}/>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{category.value}</p>
                        <p className="text-sm text-gray-600">tickets</p>
                      </div>
                    </div>))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5"/>
                Department Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Department</th>
                      <th className="text-left p-2">Open Tickets</th>
                      <th className="text-left p-2">Resolved</th>
                      <th className="text-left p-2">Avg Resolution (days)</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentData.map((dept, index) => (<tr key={index} className="border-b">
                        <td className="p-2 font-medium">{dept.department}</td>
                        <td className="p-2">{dept.open}</td>
                        <td className="p-2">{dept.resolved}</td>
                        <td className="p-2">{dept.avg_resolution}</td>
                        <td className="p-2">
                          <Badge variant={dept.avg_resolution < 2.5 ? "default" : "destructive"}>
                            {dept.avg_resolution < 2.5 ? "Good" : "Needs Attention"}
                          </Badge>
                        </td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5"/>
                SLA Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={slaData}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="month"/>
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="met" fill="#10B981" name="SLA Met"/>
                  <Bar dataKey="missed" fill="#EF4444" name="SLA Missed"/>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technicians" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5"/>
                Technician Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Technician</th>
                      <th className="text-left p-2">Assigned</th>
                      <th className="text-left p-2">Resolved</th>
                      <th className="text-left p-2">Avg Time (days)</th>
                      <th className="text-left p-2">Rating</th>
                      <th className="text-left p-2">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {techniciansData.map((tech, index) => (<tr key={index} className="border-b">
                        <td className="p-2 font-medium">{tech.name}</td>
                        <td className="p-2">{tech.assigned}</td>
                        <td className="p-2">{tech.resolved}</td>
                        <td className="p-2">{tech.avg_time}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            <span>{tech.rating}</span>
                            <span className="text-yellow-500">★</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant={tech.rating > 4.5 ? "default" : "secondary"}>
                            {tech.rating > 4.5 ? "Excellent" : "Good"}
                          </Badge>
                        </td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Additional Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5"/>
            Additional Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="text-left">
                <p className="font-medium">Custom Report Builder</p>
                <p className="text-sm text-gray-600">Create custom reports with drag-and-drop</p>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="text-left">
                <p className="font-medium">Scheduled Reports</p>
                <p className="text-sm text-gray-600">Set up automated report delivery</p>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="text-left">
                <p className="font-medium">Data Export</p>
                <p className="text-sm text-gray-600">Export raw data for analysis</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>);
}
