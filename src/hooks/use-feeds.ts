'use client';

import { useState, useEffect } from 'react';
import type { Feed } from '@/lib/types';

const STORAGE_KEY = 'news-weaver-feeds';

const DEFAULT_FEEDS: Omit<Feed, 'id'>[] = [
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'Technology',
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'Technology',
  },
];

export function useFeeds() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedFeeds = localStorage.getItem(STORAGE_KEY);
      if (storedFeeds) {
        setFeeds(JSON.parse(storedFeeds));
      } else {
        setFeeds(DEFAULT_FEEDS.map(feed => ({...feed, id: crypto.randomUUID()})));
      }
    } catch (error) {
      console.error('Failed to load feeds from localStorage', error);
      setFeeds(DEFAULT_FEEDS.map(feed => ({...feed, id: crypto.randomUUID()})));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(feeds));
      } catch (error) {
        console.error('Failed to save feeds to localStorage', error);
      }
    }
  }, [feeds, isLoaded]);

  const addFeed = (feed: Omit<Feed, 'id'>) => {
    const newFeed: Feed = { ...feed, id: crypto.randomUUID() };
    setFeeds((prevFeeds) => [...prevFeeds, newFeed]);
  };

  const removeFeed = (feedId: string) => {
    setFeeds((prevFeeds) => prevFeeds.filter((feed) => feed.id !== feedId));
  };
  
  const updateFeed = (updatedFeed: Feed) => {
    setFeeds((prevFeeds) =>
      prevFeeds.map((feed) => (feed.id === updatedFeed.id ? updatedFeed : feed))
    );
  };

  return { feeds, addFeed, removeFeed, updateFeed, isLoaded };
}
