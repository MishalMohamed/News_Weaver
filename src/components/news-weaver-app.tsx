'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from '@/components/ui/sidebar';
import { FeedSidebar } from '@/components/feed-sidebar';
import { ArticleList } from '@/components/article-list';
import { useFeeds } from '@/hooks/use-feeds';
import { useFavorites } from '@/hooks/use-favorites';
import type { Article, Feed } from '@/lib/types';
import { fetchRssFeed, classifyArticleContent } from '@/app/actions';
import { NewsWeaverIcon } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function NewsWeaverApp() {
  const { feeds, addFeed, removeFeed, updateFeed, isLoaded: feedsLoaded } = useFeeds();
  const { favoriteArticles, toggleFavorite, isFavorite, isLoaded: favoritesLoaded } = useFavorites();
  const [selectedFeed, setSelectedFeed] = useState<Feed | 'favorites' | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [classifyingIds, setClassifyingIds] = useState(new Set<string>());

  const isLoaded = feedsLoaded && favoritesLoaded;

  useEffect(() => {
    if (isLoaded && feeds.length > 0 && !selectedFeed) {
      setSelectedFeed(feeds[0]);
    } else if (isLoaded && feeds.length === 0 && !selectedFeed) {
      setSelectedFeed('favorites');
    }
  }, [feeds, isLoaded, selectedFeed]);

  const classifyAndSetArticles = useCallback(async (articlesToClassify: Article[]) => {
    const articleIdsToClassify = articlesToClassify
        .filter(a => !a.sentiment && (a.guid || a.link))
        .map(a => a.guid || a.link);

    setClassifyingIds(new Set(articleIdsToClassify));

    const classificationPromises = articlesToClassify.map(async (article) => {
        if (article.sentiment) return article; // Already classified

        try {
            const classification = await classifyArticleContent(article.title, article.contentSnippet || article.content || '');
            return { ...article, ...classification };
        } catch (error) {
            console.error(`Failed to classify article ${article.link}:`, error);
            // Assign default classification on error
            return { ...article, sentiment: 'neutral', topic: 'General' };
        }
    });

    const classifiedArticles = await Promise.all(classificationPromises);
    setArticles(classifiedArticles);
    setClassifyingIds(new Set());
  }, []);

  useEffect(() => {
    if (selectedFeed) {
      if (selectedFeed === 'favorites') {
        setLoading(false);
        setError(null);
        classifyAndSetArticles(favoriteArticles);
      } else {
        const loadArticles = async () => {
          setLoading(true);
          setError(null);
          setArticles([]);
          try {
            const fetchedArticles = await fetchRssFeed(selectedFeed.url);
            setArticles(fetchedArticles); // show unclassified articles first
            classifyAndSetArticles(fetchedArticles);
          } catch (e: any) {
            setError(e.message || 'Failed to fetch articles.');
          } finally {
            setLoading(false);
          }
        };
        loadArticles();
      }
    }
  }, [selectedFeed, favoriteArticles, classifyAndSetArticles]);

  const handleSelectFeed = (feed: Feed | 'favorites') => {
    setSelectedFeed(feed);
    setSearchQuery('');
    setSentimentFilter('all');
    setTopicFilter('all');
  };

  const availableTopics = useMemo(() => {
    const sourceArticles = selectedFeed === 'favorites' ? favoriteArticles : articles;
    const topics = new Set(sourceArticles.map(a => a.topic).filter(Boolean));
    return ['all', ...Array.from(topics)];
  }, [articles, selectedFeed, favoriteArticles]);

  const sortedAndFilteredArticles = useMemo(() => {
    const sourceArticles = selectedFeed === 'favorites' ? favoriteArticles : articles;
    return sourceArticles
      .filter(article => {
         const searchMatch = article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.contentSnippet?.toLowerCase().includes(searchQuery.toLowerCase());
         const sentimentMatch = sentimentFilter === 'all' || article.sentiment === sentimentFilter;
         const topicMatch = topicFilter === 'all' || article.topic === topicFilter;
         return searchMatch && sentimentMatch && topicMatch;
      })
      .sort((a, b) => {
        switch (sortOrder) {
          case 'newest':
            return new Date(b.isoDate || 0).getTime() - new Date(a.isoDate || 0).getTime();
          case 'oldest':
            return new Date(a.isoDate || 0).getTime() - new Date(b.isoDate || 0).getTime();
          case 'a-z':
            return (a.title || '').localeCompare(b.title || '');
          case 'z-a':
            return (b.title || '').localeCompare(a.title || '');
          default:
            return 0;
        }
      });
  }, [articles, searchQuery, sortOrder, selectedFeed, favoriteArticles, sentimentFilter, topicFilter]);

  const currentFeedName = useMemo(() => {
    if (selectedFeed === 'favorites') return 'Favorites';
    if (selectedFeed) return selectedFeed.name;
    return 'Select a feed';
  }, [selectedFeed]);

  return (
    <SidebarProvider>
      <Sidebar as="nav" aria-label="Main Navigation" side="left" collapsible="icon">
        <SidebarRail />
        <SidebarHeader className="items-center justify-center text-center">
            <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                <NewsWeaverIcon className="size-7" />
                <h1 className="text-xl font-headline font-bold group-data-[collapsible=icon]:hidden">News Weaver</h1>
            </div>
        </SidebarHeader>
        <FeedSidebar
            feeds={feeds}
            selectedFeed={selectedFeed}
            onSelectFeed={handleSelectFeed}
            addFeed={addFeed}
            removeFeed={removeFeed}
            updateFeed={updateFeed}
            isLoaded={isLoaded}
        />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-auto min-h-14 flex-wrap items-center justify-between gap-2 border-b bg-card px-4 py-2">
          <div className="flex items-center gap-2">
            <SidebarTrigger aria-label="Toggle Navigation Sidebar" />
            <h2 className="text-lg font-semibold truncate max-w-xs">{currentFeedName}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
             {selectedFeed && (
                <>
                    <div className="relative w-full sm:w-auto sm:min-w-48">
                        <label htmlFor="search-articles" className="sr-only">Search Articles</label>
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="search-articles"
                            type="search"
                            placeholder="Search articles..."
                            className="w-full rounded-lg bg-background pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger aria-label="Sort Order" className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Trending (Newest)</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="a-z">A-Z</SelectItem>
                            <SelectItem value="z-a">Z-A</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                        <SelectTrigger aria-label="Filter by Sentiment" className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by sentiment" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sentiments</SelectItem>
                            <SelectItem value="positive">Positive</SelectItem>
                            <SelectItem value="negative">Negative</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select value={topicFilter} onValueChange={setTopicFilter} disabled={availableTopics.length <= 1}>
                        <SelectTrigger aria-label="Filter by Topic" className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by topic" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableTopics.map(topic => (
                                <SelectItem key={topic} value={topic}>
                                    {topic === 'all' ? 'All Topics' : topic}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </>
             )}
            <ThemeToggle />
          </div>
        </header>
        <main id="main-content" className="p-4 md:p-6" aria-live="polite" aria-atomic="true">
            <ArticleList
                articles={sortedAndFilteredArticles}
                loading={loading}
                error={error}
                feedName={currentFeedName}
                searchQuery={searchQuery}
                isFavoritesView={selectedFeed === 'favorites'}
                onToggleFavorite={toggleFavorite}
                isFavorite={isFavorite}
                classifyingIds={classifyingIds}
            />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
