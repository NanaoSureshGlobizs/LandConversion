'use client';

import { Bug, Trash2 } from 'lucide-react';
import { useDebug } from '@/context/DebugContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '../ui/scroll-area';

export function DebugPanel() {
  const { isDebugMode, logs, clearLogs } = useDebug();

  if (!isDebugMode) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg"
        >
          <Bug className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>API Debug Panel</DialogTitle>
          <DialogDescription>
            View logs of all API requests and responses.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow h-0">
          <ScrollArea className="h-full w-full rounded-md border">
             <pre className="p-4 text-xs">{logs.join('\n\n')}</pre>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="destructive" onClick={clearLogs}>
            <Trash2 className="mr-2" />
            Clear Logs
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
