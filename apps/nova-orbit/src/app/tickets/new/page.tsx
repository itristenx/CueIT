'use client';

import { useCreateTicket } from '@/hooks/useAPI';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  ArrowLeft,
  CheckCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const PLACEHOLDER_TITLE = "Provide a concise title for the issue (e.g., Unable to access email)";
const PLACEHOLDER_DESCRIPTION = "Provide detailed steps to reproduce the issue, including error messages or screenshots if available";

export default function NewTicketPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    urgency: 'medium',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTicket = useCreateTicket();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createTicket.mutateAsync(formData);
      if (result.success) {
        router.push(`/tickets/${result.data.id}`);
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
      setErrors({ submit: 'Failed to create ticket. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setErrors(prev => ({
      ...prev,
      [field]: '',
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/tickets">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tickets
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Ticket</h1>
            <p className="text-muted-foreground">Submit a new support request</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Ticket Details
            </CardTitle>
            <CardDescription>
              Please provide as much detail as possible to help us resolve your issue quickly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder={PLACEHOLDER_TITLE}
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                  className="mt-1"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder={PLACEHOLDER_DESCRIPTION}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  required
                  rows={6}
                  className="mt-1"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              {/* Priority, Category, Urgency */}
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="hardware">Hardware</SelectItem>
                      <SelectItem value="software">Software</SelectItem>
                      <SelectItem value="network">Network</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="access">Access Request</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="urgency">Urgency</Label>
                  <Select value={formData.urgency} onValueChange={(value) => handleChange('urgency', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Link href="/tickets">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Ticket
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Tips for Better Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Be specific about the problem and include error messages</li>
              <li>• Include steps to reproduce the issue</li>
              <li>• Mention which device/browser you&apos;re using</li>
              <li>• Include screenshots if they help explain the issue</li>
              <li>• Set the priority based on how much this affects your work</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
