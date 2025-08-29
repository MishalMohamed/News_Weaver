'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { getFeedDetails } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { Feed } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
  name: z.string().optional(),
  category: z.string().optional(),
});

type AddFeedFormValues = z.infer<typeof formSchema>;

interface AddFeedDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onFeedAdded: (feed: Omit<Feed, 'id'>) => void;
  onFeedUpdated: (feed: Feed) => void;
  onClose: () => void;
  editingFeed: Feed | null;
}

export function AddFeedDialog({ isOpen, onOpenChange, onFeedAdded, onFeedUpdated, onClose, editingFeed }: AddFeedDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<AddFeedFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { url: '', name: '', category: '' },
  });

  useEffect(() => {
    if (editingFeed) {
      form.reset({ url: editingFeed.url, name: editingFeed.name, category: editingFeed.category });
    } else {
      form.reset({ url: '', name: '', category: '' });
    }
  }, [editingFeed, form]);


  const onSubmit = async (values: AddFeedFormValues) => {
    setIsSubmitting(true);
    try {
      const feedDetails = await getFeedDetails(values.url);
      const finalName = values.name || feedDetails.name;
      
      if (editingFeed) {
        onFeedUpdated({ ...editingFeed, name: finalName, url: values.url, category: values.category });
        toast({ title: 'Feed updated successfully!' });
      } else {
        onFeedAdded({ name: finalName, url: values.url, category: values.category });
        toast({ title: 'Feed added successfully!' });
      }
      onClose();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Could not add or update the feed.',
      });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      onClose();
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingFeed ? 'Edit Feed' : 'Add a New Feed'}</DialogTitle>
          <DialogDescription>
            Enter the URL of the RSS feed you want to add.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feed URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/rss.xml" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="My favorite news" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Technology" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingFeed ? 'Update Feed' : 'Add Feed'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
