
'use client';

import { useState } from 'react';
import { Check, FileText, Search, User, Send } from 'lucide-react';
import type { WorkflowItem } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { WorkflowDetailDialog } from './workflow-detail-dialog';

interface TrackingTimelineProps {
  items: WorkflowItem[];
  accessToken: string;
}

function getIconForStatus(statusName: string, highlight: boolean) {
    const status = statusName.toLowerCase();
    
    if (status.includes('re-verification')) {
        return <Send className={cn("h-5 w-5", highlight && "text-amber-500")} />;
    }
    if (status.includes('approved') || status.includes('completed')) {
        return <Check className={cn("h-5 w-5", highlight && "text-green-500")} />;
    }
    if (status.includes('review') || status.includes('progress') || status.includes('enquiry')) {
        return <Search className={cn("h-5 w-5", highlight && "text-blue-500")} />;
    }
    if (status.includes('submitted') || status.includes('new')) {
        return <FileText className={cn("h-5 w-5", highlight && "text-yellow-500")} />;
    }
    return <User className="h-5 w-5" />;
}

export function TrackingTimeline({ items, accessToken }: TrackingTimelineProps) {
  const [selectedItem, setSelectedItem] = useState<WorkflowItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!items || items.length === 0) {
    return <p className="text-muted-foreground">No history to display.</p>;
  }

  const handleItemClick = (item: WorkflowItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-8">
        {items.map((item, index) => {
           const isReverification = item.status.name.toLowerCase().includes('re-verification');
          return (
            <div key={item.workflow_sequence_id + '-' + index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border',
                    item.highlight ? 'bg-primary/10 border-primary text-primary' : 'bg-muted text-muted-foreground',
                    isReverification && 'bg-amber-500/10 border-amber-500 text-amber-500'
                  )}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{getIconForStatus(item.status.name, item.highlight || isReverification)}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{item.status.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {index < items.length - 1 && (
                  <div className="w-px flex-1 bg-border my-2" />
                )}
              </div>
              <div className="flex-1 pt-1.5 cursor-pointer" onClick={() => handleItemClick(item)}>
                <p className={cn("font-semibold hover:underline", item.highlight && "text-primary", isReverification && 'text-amber-600')}>
                    {item.to_user || 'Application Submitted'}
                </p>
                {item.from_user && (
                    <p className="text-sm text-muted-foreground">
                        From: {item.from_user}
                    </p>
                )}
                <p className="text-sm text-muted-foreground italic truncate">"{item.remark}"</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.created_at} &bull; {item.days_held} days held
                </p>
              </div>
            </div>
          )
        })}
      </div>
      {selectedItem && (
        <WorkflowDetailDialog 
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          item={selectedItem}
          accessToken={accessToken}
        />
      )}
    </>
  );
}
