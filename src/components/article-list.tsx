'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ArticleCard } from '@/components/article-card';
import type { Article } from '@/lib/types';
import { AlertTriangle, Rss, Search, Star } from 'lucide-react';

interface ArticleListProps {
  articles: Article[];
  loading: boolean;
  error: string | null;
  feedName?: string;
  searchQuery?: string;
  isFavoritesView?: boolean;
  onToggleFavorite: (article: Article) => void;
  isFavorite: (articleLink: string) => boolean;
  classifyingIds: Set<string>;
}

export function ArticleList({ 
    articles, 
    loading, 
    error, 
    feedName, 
    searchQuery, 
    isFavoritesView, 
    onToggleFavorite, 
    isFavorite,
    classifyingIds
}: ArticleListProps) {
  if (loading) {
    return (
        <div>
            <h2 className="text-2xl font-bold font-headline mb-4 sr-only">{feedName || 'Loading...'}</h2>
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                        <Skeleton className="h-[225px] w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-4 w-3/5" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  if (searchQuery && articles.length === 0 && !isFavoritesView) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-96 bg-card rounded-lg p-8">
        <Search className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold font-headline">No articles match your search</h3>
        <p className="text-muted-foreground">Try searching for something else.</p>
      </div>
    )
  }

  if (isFavoritesView && articles.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-96 bg-card rounded-lg p-8">
            <Star className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold font-headline">No Favorite Articles Yet</h3>
            <p className="text-muted-foreground">Click the star on an article to save it here.</p>
        </div>
      )
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-96 bg-card rounded-lg p-8">
        <Rss className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold font-headline">No articles found</h3>
        <p className="text-muted-foreground">This feed appears to be empty or could not be loaded.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold font-headline mb-4 sr-only">{feedName}</h2>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {articles.map((article) => (
          <ArticleCard 
            key={article.guid || article.link} 
            article={article} 
            isFavorite={isFavorite(article.link)}
            onToggleFavorite={onToggleFavorite}
            isClassifying={classifyingIds.has(article.guid || article.link)}
          />
        ))}
      </div>
    </div>
  );
}
