'use client';

import { useKnowledgeBaseSearch } from '@/hooks/useAPI';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  BookOpen, 
  ArrowLeft,
  Calendar,
  Eye,
  ThumbsUp,
  Filter,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  
  const { data: searchResults, isLoading } = useKnowledgeBaseSearch(searchQuery);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      setSearchQuery(q);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setQuery('');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/knowledge-base">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Knowledge Base
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Search Knowledge Base</h1>
            <p className="text-muted-foreground">Find specific articles and guides</p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Articles
          </CardTitle>
          <CardDescription>
            Search through our comprehensive knowledge base for answers to your questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for articles, guides, or troubleshooting tips..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={!query.trim()}>
                Search
              </Button>
              {searchQuery && (
                <Button type="button" variant="outline" onClick={clearSearch}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchQuery && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Search Results for "{searchQuery}"
            </h2>
            {searchResults?.data && (
              <p className="text-muted-foreground">
                {searchResults.data.length} result{searchResults.data.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : searchResults?.data?.length ? (
            <div className="space-y-4">
              {searchResults.data.map((article: any) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link href={`/knowledge-base/${article.id}`}>
                            <h3 className="font-semibold text-lg hover:text-blue-600 transition-colors">
                              {article.title}
                            </h3>
                          </Link>
                          <p className="text-muted-foreground mt-1 line-clamp-2">
                            {article.description}
                          </p>
                        </div>
                      </div>
                      
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
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Updated {new Date(article.updatedAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {article.views || 0} views
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            {article.likes || 0} likes
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">
                  No articles match your search query. Try different keywords or browse all categories.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={clearSearch} variant="outline">
                    Clear Search
                  </Button>
                  <Link href="/knowledge-base">
                    <Button>Browse All Articles</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Search Tips */}
      {!searchQuery && (
        <Card>
          <CardHeader>
            <CardTitle>Search Tips</CardTitle>
            <CardDescription>
              Get better results with these search strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="font-medium">•</span>
                <span>Use specific keywords related to your issue</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">•</span>
                <span>Try different variations of your search terms</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">•</span>
                <span>Search for error messages or symptoms</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">•</span>
                <span>Use quotation marks for exact phrases</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">•</span>
                <span>Browse categories if you're not sure what to search for</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function KnowledgeBaseSearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/knowledge-base" className="flex items-center gap-2 text-nova-primary hover:text-nova-primary/80">
              <ArrowLeft className="h-4 w-4" />
              Back to Knowledge Base
            </Link>
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
