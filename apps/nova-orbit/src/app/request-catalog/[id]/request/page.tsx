'use client';

import { useState, use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  description?: string;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  defaultValue?: string;
  validation?: string;
}

interface RequestCatalogItem {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  tags: string[];
  formFields: FormField[];
}

interface RequestFormProps {
  params: Promise<{
    id: string;
  }>;
}

export default function RequestFormPage({ params }: RequestFormProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [urgency, setUrgency] = useState('medium');
  const [justification, setJustification] = useState('');

  const { data: catalogItem, isLoading, error } = useQuery({
    queryKey: ['catalog-item', id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v2/request-catalog/items/${id}`);
      return response.data.data as RequestCatalogItem;
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/api/v2/request-catalog/requests', data);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['catalog-stats'] });
      router.push(`/tickets/${data.id}`);
    },
    onError: (error: any) => {
      console.error('Failed to create request:', error);
    },
  });

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!catalogItem) return false;

    // Generate a title if not provided
    if (!formData.title) {
      formData.title = `${catalogItem.name} Request`;
    }

    // Validate required fields
    catalogItem.formFields.forEach(field => {
      if (field.required && (!formData[field.name] || formData[field.name] === '')) {
        newErrors[field.name] = `${field.label} is required`;
      }

      // Additional validation based on field type
      if (formData[field.name] && field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = `${field.label} must be a valid email address`;
        }
      }

      if (formData[field.name] && field.type === 'url') {
        try {
          new URL(formData[field.name]);
        } catch {
          newErrors[field.name] = `${field.label} must be a valid URL`;
        }
      }

      if (formData[field.name] && field.type === 'number') {
        if (isNaN(Number(formData[field.name]))) {
          newErrors[field.name] = `${field.label} must be a number`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const title = formData.title || `${catalogItem?.name} Request`;
    const description = formData.description || `Service request for ${catalogItem?.name}`;

    createRequestMutation.mutate({
      catalogItemId: id,
      title,
      description,
      formData,
      urgency,
      justification,
    });
  };

  const renderFormField = (field: FormField) => {
    const value = formData[field.name] || field.defaultValue || '';
    const hasError = !!errors[field.name];

    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type={field.type}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={hasError ? 'border-red-500' : ''}
            />
            {field.description && (
              <p className="text-sm text-gray-600">{field.description}</p>
            )}
            {hasError && (
              <p className="text-sm text-red-500">{errors[field.name]}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type="number"
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={hasError ? 'border-red-500' : ''}
            />
            {field.description && (
              <p className="text-sm text-gray-600">{field.description}</p>
            )}
            {hasError && (
              <p className="text-sm text-red-500">{errors[field.name]}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.name}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={hasError ? 'border-red-500' : ''}
              rows={3}
            />
            {field.description && (
              <p className="text-sm text-gray-600">{field.description}</p>
            )}
            {hasError && (
              <p className="text-sm text-red-500">{errors[field.name]}</p>
            )}
          </div>
        );

      case 'select':
      case 'radio':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(value) => handleInputChange(field.name, value)}
            >
              <SelectTrigger className={hasError ? 'border-red-500' : ''}>
                <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.description && (
              <p className="text-sm text-gray-600">{field.description}</p>
            )}
            {hasError && (
              <p className="text-sm text-red-500">{errors[field.name]}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                id={field.name}
                type="checkbox"
                checked={value}
                onChange={(e) => handleInputChange(field.name, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                aria-describedby={field.description ? `${field.name}-desc` : undefined}
              />
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
            </div>
            {field.description && (
              <p id={`${field.name}-desc`} className="text-sm text-gray-600">{field.description}</p>
            )}
            {hasError && (
              <p className="text-sm text-red-500">{errors[field.name]}</p>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type="date"
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={hasError ? 'border-red-500' : ''}
            />
            {field.description && (
              <p className="text-sm text-gray-600">{field.description}</p>
            )}
            {hasError && (
              <p className="text-sm text-red-500">{errors[field.name]}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !catalogItem) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load service request form. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Catalog
          </Button>
          
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {catalogItem.icon || '📋'}
                </div>
                <div>
                  <CardTitle>{catalogItem.name}</CardTitle>
                  <p className="text-sm text-gray-600">{catalogItem.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary">{catalogItem.category}</Badge>
                    {catalogItem.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dynamic form fields */}
              {catalogItem.formFields.map(renderFormField)}

              {/* Standard fields */}
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select value={urgency} onValueChange={setUrgency}>
                    <SelectTrigger>
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

                <div className="space-y-2">
                  <Label htmlFor="justification">Business Justification</Label>
                  <Textarea
                    id="justification"
                    placeholder="Please provide a brief justification for this request..."
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    rows={3}
                  />
                  <p className="text-sm text-gray-600">
                    Optional: Help us understand the business need for this request
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createRequestMutation.isPending}
                >
                  {createRequestMutation.isPending ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
