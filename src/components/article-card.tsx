
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { summarizeArticleContent } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { Article } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Newspaper, ExternalLink, Star, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';


interface ArticleCardProps {
  article: Article;
  isFavorite: boolean;
  onToggleFavorite: (article: Article) => void;
  isClassifying?: boolean;
}

export function ArticleCard({ article, isFavorite, onToggleFavorite, isClassifying }: ArticleCardProps) {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!article.content) {
      toast({
        variant: 'destructive',
        title: 'Cannot summarize',
        description: 'Article content is not available in the feed.',
      });
      return;
    }
    setIsSummarizing(true);
    try {
      const result = await summarizeArticleContent(article.content);
      setSummary(result);
      setIsSummaryOpen(true);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Summarization Failed',
        description: error.message,
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(article.link);
      toast({ title: 'Link copied to clipboard!' });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Failed to copy',
        description: 'Could not copy link to clipboard.',
      });
    }
  };

  const getRelativeDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  const imageUrl = article.enclosure?.url || article['media:content']?.$?.url;


  return (
    <>
      <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-lg focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:-translate-y-1">
        {imageUrl && <img src={imageUrl} alt={article.title} className="w-full h-40 object-cover" data-ai-hint="article photo" />}
        {!imageUrl && <div className="w-full h-40 bg-muted flex items-center justify-center" data-ai-hint="article placeholder" aria-hidden="true"><Newspaper className="w-10 h-10 text-muted-foreground" /></div>}
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-lg font-headline leading-tight h-14 overflow-hidden">
                <a href={article.link} target="_blank" rel="noopener noreferrer" className="hover:underline focus:outline-none focus:ring-1 focus:ring-ring rounded-sm">
                    {article.title}
                </a>
            </CardTitle>
            <Button variant="ghost" size="icon" aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'} className="h-8 w-8 flex-shrink-0" onClick={() => onToggleFavorite(article)}>
              <Star className={cn("h-5 w-5", isFavorite ? 'fill-primary text-primary' : 'text-muted-foreground')} />
            </Button>
          </div>
          <CardDescription className="flex items-center justify-between">
            <span>
                {getRelativeDate(article.isoDate)} by {article.creator || 'Unknown Author'}
            </span>
             {isClassifying && (
                <Skeleton className="h-5 w-20 rounded-md" />
             )}
            {!isClassifying && article.topic && (
                <Badge variant="secondary" aria-label={`Category: ${article.topic}`}>{article.topic}</Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow text-sm">
          <p className="line-clamp-3">{article.contentSnippet}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center bg-muted/50 p-3 gap-2">
            <Button variant="outline" size="sm" onClick={handleSummarize} disabled={isSummarizing}>
                {isSummarizing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <Newspaper className="mr-2 h-4 w-4" />
                )}
                Summarize
            </Button>
            <div className="flex items-center gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" asChild>
                                <a href={article.link} target="_blank" rel="noopener noreferrer" aria-label="Read full article">
                                    <ExternalLink className="h-5 w-5" />
                                </a>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Read Article</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={handleCopyLink} aria-label="Copy article link">
                                <Copy className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Copy Link</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </CardFooter>
      </Card>
      <AlertDialog open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline">Summary of: {article.title}</AlertDialogTitle>
          </AlertDialogHeader>
          <ScrollArea className="max-h-[60vh] pr-6">
            <AlertDialogDescription className="text-base whitespace-pre-wrap">
                {summary}
            </AlertDialogDescription>
          </ScrollArea>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
