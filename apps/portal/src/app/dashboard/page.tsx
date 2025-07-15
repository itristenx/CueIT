'use client';

import { useTickets, useTicketStats, useKnowledgeBase } from '@/hooks/useAPI';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search,
  BookOpen,
  TrendingUp,
  User
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { data: tickets, isLoading: ticketsLoading } = useTickets({ limit: 5 });
  const { data: stats, isLoading: statsLoading } = useTicketStats();
  const { data: recentArticles, isLoading: articlesLoading } = useKnowledgeBase({ limit: 3 });

  if (ticketsLoading || statsLoading || articlesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>            <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening with your support requests.</p>
        </div>
        <Link href="/tickets/new">
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            New Ticket
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.data?.open || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.data?.openThisWeek || 0} this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.data?.inProgress || 0}</div>
            <p className="text-xs text-muted-foreground">
              Being worked on
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.data?.resolved || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.data?.resolvedThisWeek || 0} this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.data?.averageResolutionTime || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              Average time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets and Knowledge Base */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Recent Tickets
            </CardTitle>
            <CardDescription>Your latest support requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tickets?.data?.length ? (
                tickets.data.map((ticket: any) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <Link href={`/tickets/${ticket.id}`}>
                        <h4 className="font-medium hover:text-blue-600 transition-colors">
                          #{ticket.id} - {ticket.title}
                        </h4>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={
                      ticket.status === 'open' ? 'destructive' :
                      ticket.status === 'in_progress' ? 'default' :
                      'secondary'
                    }>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No tickets yet. Create your first support request!
                </p>
              )}
            </div>
            <div className="mt-4">
              <Link href="/tickets">
                <Button variant="outline" className="w-full">
                  View All Tickets
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Base */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Knowledge Base
            </CardTitle>
            <CardDescription>Helpful articles and guides</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentArticles?.data?.length ? (
                recentArticles.data.map((article: any) => (
                  <div key={article.id} className="p-3 rounded-lg border">
                    <Link href={`/knowledge-base/${article.id}`}>
                      <h4 className="font-medium hover:text-blue-600 transition-colors">
                        {article.title}
                      </h4>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      {article.description}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No articles available
                </p>
              )}
            </div>
            <div className="mt-4 space-y-2">
              <Link href="/knowledge-base/search">
                <Button variant="outline" className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  Search Knowledge Base
                </Button>
              </Link>
              <Link href="/knowledge-base">
                <Button variant="outline" className="w-full">
                  Browse All Articles
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
