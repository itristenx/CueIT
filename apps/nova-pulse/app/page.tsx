"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ticket, User, Clock, AlertCircle } from 'lucide-react';
import { useTickets } from '../src/hooks/useTickets';

export default function PulsePage() {
  const { data: tickets, isLoading, error } = useTickets();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nova Pulse</h1>
        <p className="mt-2 text-gray-600">Technician workspace for ticket management and resolution</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* TODO: Replace with real stats from API */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets ? tickets.length : '-'}</div>
            <p className="text-xs text-muted-foreground">Live from API</p>
          </CardContent>
        </Card>
        {/* ...other stat cards can be updated similarly... */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>My Ticket Queue</CardTitle>
            <CardDescription>Tickets assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && <div>Loading tickets...</div>}
            {error && <div className="text-red-500">Error loading tickets</div>}
            <div className="space-y-4">
              {tickets && tickets.length > 0 ? (
                tickets.map((ticket: any) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-semibold">{ticket.prefix}{ticket.number}</div>
                      <div className="text-sm text-gray-600">{ticket.title}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={ticket.priority === 'high' ? 'destructive' : 'default'}>{ticket.priority}</Badge>
                      <Button size="sm">View</Button>
                    </div>
                  </div>
                ))
              ) : (
                !isLoading && <div>No tickets found.</div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Nova Ascend - Your Stats</CardTitle>
            <CardDescription>Gamification and performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">XP Level</span>
                <span className="text-2xl font-bold text-blue-600">Level 12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Stardust Points</span>
                <span className="text-xl font-semibold text-purple-600">2,450</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Rank</span>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Specialist</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tickets Resolved</span>
                <span className="text-lg font-semibold">156</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

