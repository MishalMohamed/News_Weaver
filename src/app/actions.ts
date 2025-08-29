'use server';

import Parser from 'rss-parser';
import { summarizeArticle } from '@/ai/flows/summarize-article';
import { classifyArticle } from '@/ai/flows/classify-article';
import type { Article, Feed } from '@/lib/types';

const parser = new Parser();

export async function fetchRssFeed(url: string): Promise<Article[]> {
  try {
    const feed = await parser.parseURL(url);
    return feed.items.map(item => ({...item, guid: item.guid || item.link})) as Article[];
  } catch (error) {
    console.error('Failed to fetch RSS feed:', error);
    throw new Error('Could not fetch or parse the RSS feed. Please check the URL and try again.');
  }
}

export async function getFeedDetails(url: string): Promise<Omit<Feed, 'id' | 'isDefault'>> {
  try {
    const feed = await parser.parseURL(url);
    if (!feed.title) {
        throw new Error('Feed has no title.');
    }
    return { name: feed.title, url };
  } catch (error) {
    console.error('Failed to validate feed URL:', error);
    throw new Error('Invalid or unreachable RSS feed URL.');
  }
}


export async function summarizeArticleContent(articleContent: string): Promise<string> {
    if (!articleContent || articleContent.trim().length < 100) {
        return "This article is too short to summarize. Please read the full content at the source.";
    }

    // Basic HTML tag stripping for cleaner summaries
    const cleanContent = articleContent.replace(/<[^>]*>?/gm, '');

    try {
        const result = await summarizeArticle({ articleContent: cleanContent });
        return result.summary;
    } catch (error) {
        console.error('Error summarizing article:', error);
        throw new Error('Could not summarize the article at this time.');
    }
}

export async function classifyArticleContent(title: string, content: string): Promise<{sentiment: string; topic: string}> {
    const cleanContent = content.replace(/<[^>]*>?/gm, '');
    try {
        const result = await classifyArticle({ title, content: cleanContent });
        return result;
    } catch (error) {
        console.error('Error classifying article:', error);
        // Return a default classification on error
        return { sentiment: 'neutral', topic: 'General' };
    }
}
