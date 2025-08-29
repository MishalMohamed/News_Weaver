'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Article } from '@/lib/types';
import { useToast } from './use-toast';

const FAVORITES_KEY = 'news-weaver-favorites';

export function useFavorites() {
  const [favoriteArticles, setFavoriteArticles] = useState<Article[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_KEY);
      if (storedFavorites) {
        setFavoriteArticles(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Failed to load favorites from localStorage', error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteArticles));
      } catch (error) {
        console.error('Failed to save favorites to localStorage', error);
      }
    }
  }, [favoriteArticles, isLoaded]);

  const isFavorite = useCallback(
    (articleLink: string) => {
      return favoriteArticles.some((fav) => fav.link === articleLink);
    },
    [favoriteArticles]
  );

  const toggleFavorite = (article: Article) => {
    if (isFavorite(article.link)) {
      setFavoriteArticles((prev) => prev.filter((fav) => fav.link !== article.link));
      toast({ title: 'Removed from favorites' });
    } else {
      setFavoriteArticles((prev) => [article, ...prev]);
      toast({ title: 'Added to favorites' });
    }
  };

  return { favoriteArticles, toggleFavorite, isFavorite, isLoaded };
}
