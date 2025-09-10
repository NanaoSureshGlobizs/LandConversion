
'use client';

import { Check, FileText, Search, User } from 'lucide-react';
import type { WorkflowItem } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TrackingTimelineProps {
  items: WorkflowItem[];
}

function getIconForStatus(statusName: string, highlight: boolean) {
    const status = statusName.toLowerCase();

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

export function TrackingTimeline({ items }: TrackingTimelineProps) {
  if (!items || items.length === 0) {
    return <p className="text-muted-foreground">No history to display.</p>;
  }

  return (
    <div className="space-y-8">
      {items.map((item, index) => (
        <div key={item.workflow_sequence_id + '-' + index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border',
                item.highlight ? 'bg-primary/10 border-primary text-primary' : 'bg-muted text-muted-foreground'
              )}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>{getIconForStatus(item.status.name, item.highlight)}</span>
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
          <div className="flex-1 pt-1.5">
            <p className={cn("font-semibold", item.highlight && "text-primary")}>
                {item.to_user || 'Application Submitted'}
            </p>
            {item.from_user && (
                <p className="text-sm text-muted-foreground">
                    From: {item.from_user}
                </p>
            )}
            <p className="text-sm text-muted-foreground italic">"{item.remark}"</p>
            <p className="text-xs text-muted-foreground mt-1">
              {item.created_at} &bull; {item.days_held} days held
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
