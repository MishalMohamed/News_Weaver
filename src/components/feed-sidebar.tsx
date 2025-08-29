'use client';

import { useState, useMemo } from 'react';
import {
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Rss, Trash2, Edit, Folder, Star } from 'lucide-react';
import { AddFeedDialog } from '@/components/add-feed-dialog';
import type { Feed } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface FeedSidebarProps {
  feeds: Feed[];
  selectedFeed: Feed | 'favorites' | null;
  onSelectFeed: (feed: Feed | 'favorites') => void;
  addFeed: (feed: Omit<Feed, 'id'>) => void;
  removeFeed: (feedId: string) => void;
  updateFeed: (feed: Feed) => void;
  isLoaded: boolean;
}

export function FeedSidebar({
  feeds,
  selectedFeed,
  onSelectFeed,
  addFeed,
  removeFeed,
  updateFeed,
  isLoaded
}: FeedSidebarProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState<Feed | null>(null);

  const handleEdit = (feed: Feed) => {
    setEditingFeed(feed);
    setIsAddDialogOpen(true);
  }

  const handleCloseDialog = () => {
    setEditingFeed(null);
    setIsAddDialogOpen(false);
  }

  const groupedFeeds = useMemo(() => {
    return feeds.reduce((acc, feed) => {
      const category = feed.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(feed);
      return acc;
    }, {} as Record<string, Feed[]>);
  }, [feeds]);

  const defaultActiveCategories = useMemo(() => {
    if (!selectedFeed || selectedFeed === 'favorites') return [];
    return Object.keys(groupedFeeds).filter(category =>
      groupedFeeds[category].some(feed => feed.id === (selectedFeed as Feed).id)
    );
  }, [selectedFeed, groupedFeeds]);

  const renderFeedItem = (feed: Feed) => (
    <SidebarMenuItem key={feed.id}>
        <SidebarMenuButton
            onClick={() => onSelectFeed(feed)}
            isActive={typeof selectedFeed === 'object' && selectedFeed?.id === feed.id}
            tooltip={feed.name}
        >
            <Rss />
            <span>{feed.name}</span>
        </SidebarMenuButton>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 group-data-[collapsible=icon]:hidden">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleEdit(feed)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
                </DropdownMenuItem>
                <AlertDialog>
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                    <span className="text-destructive">Delete</span>
                    </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the "{feed.name}" feed.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => removeFeed(feed.id)}>
                        Delete
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </SidebarMenuItem>
  )

  return (
    <>
      <SidebarContent className="p-2">
        {!isLoaded && (
             <SidebarMenu className='p-2'>
                {Array.from({ length: 4 }).map((_, i) => <SidebarMenuSkeleton key={i} showIcon />)}
             </SidebarMenu>
        )}
        {isLoaded && (
            <SidebarMenu className="p-2">
                <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={() => onSelectFeed('favorites')}
                        isActive={selectedFeed === 'favorites'}
                        tooltip="Favorites"
                    >
                        <Star />
                        <span className="group-data-[collapsible=icon]:hidden">Favorites</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        )}
        <SidebarSeparator />
        {isLoaded && (
            <Accordion type="multiple" defaultValue={['Uncategorized', ...defaultActiveCategories]} className="w-full">
                {Object.entries(groupedFeeds).map(([category, categoryFeeds]) => (
                    <AccordionItem value={category} key={category} className="border-none group/accordion">
                        <AccordionTrigger className="px-2 py-1.5 text-sm font-medium hover:bg-sidebar-accent rounded-md [&[data-state=open]>svg]:rotate-90 group-data-[collapsible=icon]:hidden">
                           <div className="flex items-center gap-2">
                             <Folder className="h-4 w-4" />
                             <span className="group-data-[collapsible=icon]:hidden">{category}</span>
                           </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-1 group-data-[collapsible=icon]:hidden">
                            <SidebarMenu className="ml-4 border-l pl-2">
                                {categoryFeeds.map(renderFeedItem)}
                            </SidebarMenu>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        )}
      </SidebarContent>
      <SidebarFooter className="p-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:pt-2">
        <Button
          variant="ghost"
          className="w-full justify-start group-data-[collapsible=icon]:justify-center"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">Add Feed</span>
        </Button>
      </SidebarFooter>
      <AddFeedDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onFeedAdded={addFeed}
        onFeedUpdated={updateFeed}
        onClose={handleCloseDialog}
        editingFeed={editingFeed}
      />
    </>
  );
}
