export interface Feed {
  id: string;
  name: string;
  url: string;
  category?: string;
}

// Based on rss-parser Item
export interface Article {
  link: string;
  guid?: string;
  title: string;
  pubDate?: string;
  isoDate?: string;
  content?: string;
  contentSnippet?: string;
  creator?: string;
  enclosure?: {
    url: string;
    [key: string]: any;
  };
  'media:content'?: {
    $: {
      url: string;
      [key: string]: any;
    }
  }
  sentiment?: 'positive' | 'negative' | 'neutral' | string;
  topic?: string;
  [key: string]: any;
}
