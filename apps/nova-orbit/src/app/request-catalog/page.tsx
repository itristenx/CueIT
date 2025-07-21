'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Package, Clock, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

interface RequestCatalogItem {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  isActive: boolean;
  tags: string[];
  formFields: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    description?: string;
  }>;
  _count: {
    requests: number;
  };
}

interface CatalogStats {
  totalItems: number;
  activeItems: number;
  totalRequests: number;
  categoryCounts: Record<string, number>;
}

const categoryColors = {
  IT: 'bg-blue-100 text-blue-800',
  HR: 'bg-purple-100 text-purple-800',
  FACILITIES: 'bg-green-100 text-green-800',
  OPERATIONS: 'bg-orange-100 text-orange-800',
  FINANCE: 'bg-yellow-100 text-yellow-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

const categoryIcons = {
  IT: '💻',
  HR: '👥',
  FACILITIES: '🏢',
  OPERATIONS: '⚙️',
  FINANCE: '💰',
  OTHER: '📋',
};

export default function RequestCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const { data: catalogItems, isLoading: itemsLoading } = useQuery({
    queryKey: ['catalog-items', selectedCategory],
    queryFn: async () => {
      const response = await apiClient.get('/api/v2/request-catalog/items', {
        params: {
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          isActive: true,
        },
      });
      return response.data.data as RequestCatalogItem[];
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['catalog-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v2/request-catalog/stats');
      return response.data.data as CatalogStats;
    },
  });

  const filteredItems = catalogItems?.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const categories = ['all', 'IT', 'HR', 'FACILITIES', 'OPERATIONS', 'FINANCE', 'OTHER'];

  const handleRequestService = (item: RequestCatalogItem) => {
    router.push(`/request-catalog/${item.id}/request`);
  };

  if (itemsLoading || statsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Request Catalog</h1>
          <p className="text-gray-600">
            Browse and request services from our comprehensive catalog
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{stats?.activeItems || 0}</div>
                  <div className="text-sm text-gray-600">Active Services</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{stats?.totalRequests || 0}</div>
                  <div className="text-sm text-gray-600">Total Requests</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {Object.keys(stats?.categoryCounts || {}).length}
                  </div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{filteredItems?.length || 0}</div>
                  <div className="text-sm text-gray-600">Available Now</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for services or categories (e.g., IT Support, Marketing)"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'All' : category}
              </Button>
            ))}
          </div>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems?.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {item.icon || categoryIcons[item.category as keyof typeof categoryIcons]}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <Badge 
                        className={`mt-1 ${categoryColors[item.category as keyof typeof categoryColors]}`}
                      >
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {item.description}
                </CardDescription>
                
                <div className="space-y-3">
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{item.formFields.length} fields</span>
                    <span>{item._count.requests} requests</span>
                  </div>
                  
                  <Button 
                    onClick={() => handleRequestService(item)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Request Service
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems?.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No services found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
