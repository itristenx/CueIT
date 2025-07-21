'use client';

import { useKnowledgeBase } from '@/hooks/useAPI';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  BookOpen, 
  Calendar,
  Eye,
  ThumbsUp,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const SEARCH_PLACEHOLDER = "Search for help articles, guides, or troubleshooting tips (e.g., password reset, VPN setup)";

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  tags?: string[];
  views?: number;
  likes?: number;
  featured?: boolean;
  updatedAt: string;
}

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  
  const { data: articles, isLoading } = useKnowledgeBase({
    search,
    category: category === 'all' ? undefined : category,
  });

  if (isLoading) {
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
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground">Find answers to common questions and helpful guides</p>
        </div>
        <Link href="/knowledge-base/search">
          <Button>
            <Search className="mr-2 h-4 w-4" />
            Advanced Search
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Articles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={SEARCH_PLACEHOLDER}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={category === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCategory('all')}
        >
          All Articles
        </Button>
        <Button 
          variant={category === 'getting-started' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCategory('getting-started')}
        >
          Getting Started
        </Button>
        <Button 
          variant={category === 'troubleshooting' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCategory('troubleshooting')}
        >
          Troubleshooting
        </Button>
        <Button 
          variant={category === 'how-to' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCategory('how-to')}
        >
          How To
        </Button>
        <Button 
          variant={category === 'faq' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCategory('faq')}
        >
          FAQ
        </Button>
      </div>

      {/* Articles Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles?.data?.length ? (
          articles.data.map((article: Article) => (
            <Card key={article.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link href={`/knowledge-base/${article.id}`}>
                      <CardTitle className="hover:text-blue-600 transition-colors line-clamp-2">
                        {article.title}
                      </CardTitle>
                    </Link>
                    <CardDescription className="mt-2 line-clamp-3">
                      {article.description}
                    </CardDescription>
                  </div>
                  {article.featured && (
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">
                      {article.category}
                    </Badge>
                    {article.tags?.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(article.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {article.views || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {article.likes || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                <p className="text-muted-foreground mb-4">
                  {search ? 
                    "No articles match your search criteria. Try different keywords or browse all categories." :
                    "No articles are available at the moment."
                  }
                </p>
                {search && (
                  <Button onClick={() => setSearch('')} variant="outline">
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Popular Articles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Popular Articles
          </CardTitle>
          <CardDescription>
            Most viewed and helpful articles from our knowledge base
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {articles?.data?.slice(0, 5).map((article: Article) => (
              <div key={article.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <Link href={`/knowledge-base/${article.id}`}>
                    <h4 className="font-medium hover:text-blue-600 transition-colors">
                      {article.title}
                    </h4>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {article.category}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {article.views || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    {article.likes || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
