import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Ticket, 
  BookOpen, 
  MessageSquare, 
  Search, 
  Plus,
  TrendingUp,
  Users,
  Clock,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg">
                <Ticket className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                QueueIT Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button>Sign In</Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button variant="outline">
                    Dashboard
                  </Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <SignedOut>
          {/* Landing Page for Non-Authenticated Users */}
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tight">
                Welcome to QueueIT Portal
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Your modern IT Service Management platform. Submit tickets, browse knowledge articles, 
                and get the support you need.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-lg w-fit mx-auto">
                    <Ticket className="h-8 w-8" />
                  </div>
                  <CardTitle>Submit Tickets</CardTitle>
                  <CardDescription>
                    Get help with IT issues, access requests, and technical support
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="bg-green-100 text-green-600 p-3 rounded-lg w-fit mx-auto">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <CardTitle>Knowledge Base</CardTitle>
                  <CardDescription>
                    Browse helpful articles, guides, and troubleshooting tips
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="bg-purple-100 text-purple-600 p-3 rounded-lg w-fit mx-auto">
                    <MessageSquare className="h-8 w-8" />
                  </div>
                  <CardTitle>Track Progress</CardTitle>
                  <CardDescription>
                    Monitor your support requests and communicate with our team
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="space-y-4">
              <SignInButton mode="modal">
                <Button size="lg" className="text-lg px-8 py-6">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </SignInButton>
              <p className="text-sm text-muted-foreground">
                Sign in to access your dashboard and submit support requests
              </p>
            </div>
          </div>
        </SignedOut>

        <SignedIn>
          {/* Dashboard for Authenticated Users */}
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">
                Welcome back!
              </h2>
              <p className="text-lg text-muted-foreground">
                Ready to get the support you need?
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
              <Link href="/dashboard">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-lg w-fit mx-auto mb-4">
                      <TrendingUp className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold mb-2">Dashboard</h3>
                    <p className="text-sm text-muted-foreground">
                      View your tickets and statistics
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/tickets/new">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="bg-green-100 text-green-600 p-3 rounded-lg w-fit mx-auto mb-4">
                      <Plus className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold mb-2">New Ticket</h3>
                    <p className="text-sm text-muted-foreground">
                      Submit a new support request
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/tickets">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="bg-purple-100 text-purple-600 p-3 rounded-lg w-fit mx-auto mb-4">
                      <Ticket className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold mb-2">My Tickets</h3>
                    <p className="text-sm text-muted-foreground">
                      View and manage your tickets
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/knowledge-base">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="bg-orange-100 text-orange-600 p-3 rounded-lg w-fit mx-auto mb-4">
                      <BookOpen className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold mb-2">Knowledge Base</h3>
                    <p className="text-sm text-muted-foreground">
                      Browse helpful articles
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </SignedIn>
      </main>
    </div>
  );
}
