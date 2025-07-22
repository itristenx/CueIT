'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { AdminLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  RefreshCw,
  Search,
  Filter,
  Tag,
  Calendar,
  Users,
  FileText,
  Globe,
  Lock,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageCircle
} from 'lucide-react';

interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'internal' | 'department';
  department?: string;
  views: number;
  likes: number;
  dislikes: number;
  comments: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface KnowledgeBaseCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  articleCount: number;
}

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [categories, setCategories] = useState<KnowledgeBaseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState<KnowledgeBaseArticle | null>(null);

  const [articleForm, setArticleForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    visibility: 'public' as 'public' | 'internal' | 'department',
    department: '',
    featured: false
  });

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiRequest('/api/v2/knowledge-base');
      setArticles(result);
    } catch (err) {
      console.error('Articles fetch error:', err);
      setError('Failed to load articles');
      
      // Mock data for development
      setArticles([
        {
          id: '1',
          title: 'How to Reset Your Password',
          content: 'Follow these steps to reset your password...',
          excerpt: 'Step-by-step guide to reset your password',
          author: 'John Doe',
          category: 'IT Support',
          tags: ['password', 'security', 'account'],
          status: 'published',
          visibility: 'public',
          views: 1247,
          likes: 89,
          dislikes: 3,
          comments: 12,
          featured: true,
          createdAt: '2024-01-01T09:00:00Z',
          updatedAt: '2024-01-10T14:30:00Z',
          publishedAt: '2024-01-02T10:00:00Z'
        },
        {
          id: '2',
          title: 'HR Policies and Procedures',
          content: 'Company HR policies and procedures...',
          excerpt: 'Overview of HR policies for employees',
          author: 'Jane Smith',
          category: 'HR',
          tags: ['hr', 'policies', 'procedures'],
          status: 'published',
          visibility: 'internal',
          department: 'HR',
          views: 456,
          likes: 34,
          dislikes: 1,
          comments: 8,
          featured: false,
          createdAt: '2024-01-05T11:00:00Z',
          updatedAt: '2024-01-12T16:45:00Z',
          publishedAt: '2024-01-06T09:00:00Z'
        },
        {
          id: '3',
          title: 'Network Configuration Guide',
          content: 'Guide for network configuration...',
          excerpt: 'Technical guide for network setup',
          author: 'Mike Johnson',
          category: 'IT Support',
          tags: ['network', 'configuration', 'technical'],
          status: 'draft',
          visibility: 'internal',
          views: 0,
          likes: 0,
          dislikes: 0,
          comments: 0,
          featured: false,
          createdAt: '2024-01-14T10:00:00Z',
          updatedAt: '2024-01-15T14:20:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/v2/knowledge-base/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const result = await response.json();
      setCategories(result);
    } catch (err) {
      console.error('Categories fetch error:', err);
      
      // Mock data for development
      setCategories([
        {
          id: '1',
          name: 'IT Support',
          description: 'Technical support articles',
          color: 'bg-blue-100 text-blue-800',
          articleCount: 45
        },
        {
          id: '2',
          name: 'HR',
          description: 'Human resources articles',
          color: 'bg-green-100 text-green-800',
          articleCount: 23
        },
        {
          id: '3',
          name: 'Operations',
          description: 'Operational procedures',
          color: 'bg-purple-100 text-purple-800',
          articleCount: 18
        },
        {
          id: '4',
          name: 'Facilities',
          description: 'Facility management',
          color: 'bg-orange-100 text-orange-800',
          articleCount: 12
        }
      ]);
    }
  };

  const handleSaveArticle = async () => {
    try {
      const articleData = {
        ...articleForm,
        tags: articleForm.tags.split(',').map(tag => tag.trim()),
        author: 'Current User', // This would come from auth context
        excerpt: articleForm.excerpt || articleForm.content.substring(0, 150) + '...'
      };

      const response = await fetch('/api/v2/knowledge-base', {
        method: editingArticle ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingArticle ? { ...articleData, id: editingArticle.id } : articleData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save article');
      }
      
      setShowEditor(false);
      setEditingArticle(null);
      setArticleForm({
        title: '',
        content: '',
        excerpt: '',
        category: '',
        tags: '',
        status: 'draft',
        visibility: 'public',
        department: '',
        featured: false
      });
      
      fetchArticles();
      alert('Article saved successfully!');
    } catch (err) {
      console.error('Save article error:', err);
      alert('Failed to save article');
    }
  };

  const handleEditArticle = (article: KnowledgeBaseArticle) => {
    setEditingArticle(article);
    setArticleForm({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      category: article.category,
      tags: article.tags.join(', '),
      status: article.status,
      visibility: article.visibility,
      department: article.department || '',
      featured: article.featured
    });
    setShowEditor(true);
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      const response = await fetch(`/api/v2/knowledge-base/${articleId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete article');
      }
      
      fetchArticles();
      alert('Article deleted successfully!');
    } catch (err) {
      console.error('Delete article error:', err);
      alert('Failed to delete article');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Globe className="h-4 w-4 text-blue-500" />;
      case 'internal':
        return <Lock className="h-4 w-4 text-yellow-500" />;
      case 'department':
        return <Users className="h-4 w-4 text-purple-500" />;
      default:
        return <Globe className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Knowledge Base</h1>
            <p className="text-muted-foreground">
              Manage articles and documentation
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={fetchArticles}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setShowEditor(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </Button>
          </div>
        </div>

        <Separator />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{articles.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {articles.filter(a => a.status === 'published').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <Edit className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {articles.filter(a => a.status === 'draft').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {articles.reduce((sum, article) => sum + article.views, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-muted-foreground">{category.description}</div>
                  </div>
                  <Badge className={category.color}>{category.articleCount}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search knowledge base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              title="Knowledge Base Search"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Articles Table */}
        <Card>
          <CardHeader>
            <CardTitle>Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {article.featured && <Star className="h-4 w-4 text-yellow-500" />}
                        <div>
                          <div className="font-medium">{article.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {article.excerpt}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{article.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(article.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {getVisibilityIcon(article.visibility)}
                        <span className="text-sm">{article.visibility}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1 text-gray-400" />
                        {article.views}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="flex items-center text-green-600">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {article.likes}
                        </div>
                        <div className="flex items-center text-red-600">
                          <ThumbsDown className="h-3 w-3 mr-1" />
                          {article.dislikes}
                        </div>
                        <div className="flex items-center text-blue-600">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          {article.comments}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(article.updatedAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditArticle(article)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteArticle(article.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Article Editor Modal */}
        {showEditor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>
                  {editingArticle ? 'Edit Article' : 'Create New Article'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={articleForm.title}
                      onChange={(e) => setArticleForm({...articleForm, title: e.target.value})}
                      placeholder="Article title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={articleForm.category} onValueChange={(value: string) => setArticleForm({...articleForm, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={articleForm.excerpt}
                    onChange={(e) => setArticleForm({...articleForm, excerpt: e.target.value})}
                    placeholder="Brief description of the article"
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={articleForm.content}
                    onChange={(e) => setArticleForm({...articleForm, content: e.target.value})}
                    placeholder="Article content (supports Markdown)"
                    rows={10}
                  />
                </div>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={articleForm.tags}
                      onChange={(e) => setArticleForm({...articleForm, tags: e.target.value})}
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={articleForm.status} onValueChange={(value: any) => setArticleForm({...articleForm, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Visibility</Label>
                    <Select value={articleForm.visibility} onValueChange={(value: any) => setArticleForm({...articleForm, visibility: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="department">Department</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {articleForm.visibility === 'department' && (
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select value={articleForm.department} onValueChange={(value: string) => setArticleForm({...articleForm, department: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="Facilities">Facilities</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <label htmlFor="featured" className="sr-only">Featured article</label>
                  <input
                    type="checkbox"
                    id="featured"
                    checked={articleForm.featured}
                    onChange={(e) => setArticleForm({...articleForm, featured: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="featured">Featured article</Label>
                </div>
                
                <div className="flex items-center justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => {
                    setShowEditor(false);
                    setEditingArticle(null);
                    setArticleForm({
                      title: '',
                      content: '',
                      excerpt: '',
                      category: '',
                      tags: '',
                      status: 'draft',
                      visibility: 'public',
                      department: '',
                      featured: false
                    });
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveArticle}>
                    {editingArticle ? 'Update' : 'Create'} Article
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// Adding type declarations for JSX elements.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
      // Add other elements as needed
    }
  }
}
