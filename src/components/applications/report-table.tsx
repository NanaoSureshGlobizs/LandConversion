
'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { ApplicationListItem, PaginatedApplications } from '@/lib/definitions';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { getApplications } from '@/app/actions';
import { useNearScreen } from '@/hooks/use-near-screen';
import { useDebug } from '@/context/DebugContext';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';

interface ReportTableProps {
  initialData: PaginatedApplications | null;
  accessToken: string;
}

export function ReportTable({ initialData, accessToken }: ReportTableProps) {
  const [applications, setApplications] = useState<ApplicationListItem[]>(initialData?.applications || []);
  const [page, setPage] = useState(initialData?.pagination.currentPage || 1);
  const [hasMore, setHasMore] = useState( (initialData?.pagination.currentPage || 1) < (initialData?.pagination.pageCount || 1) );
  const [isLoading, setIsLoading] = useState(false);
  const externalRef = useRef(null);
  const { addLog } = useDebug();
  
  const [sdao, setSdao] = useState('');

  const { isNearScreen } = useNearScreen({
    externalRef: isLoading ? null : externalRef,
    once: false,
  });

  const loadMoreApplications = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const nextPage = page + 1;
    const { data: newData, log } = await getApplications(accessToken, nextPage);
    addLog(log || "Log for getApplications");

    if (newData && Array.isArray(newData.applications)) {
      setApplications(prev => [...prev, ...newData.applications]);
      setPage(newData.pagination.currentPage);
      setHasMore(newData.pagination.currentPage < newData.pagination.pageCount);
    } else {
        setHasMore(false);
    }
    
    setIsLoading(false);
  }, [page, hasMore, isLoading, addLog, accessToken]);
  
  useEffect(() => {
    if (isNearScreen) {
        loadMoreApplications();
    }
  }, [isNearScreen, loadMoreApplications]);


  const filteredData = useMemo(() => {
    return applications;
  }, [applications]);

  const renderAction = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'approved') {
        return <Button variant="outline" size="sm">Download Report</Button>;
    }
    if (lowerStatus === 'rejected' || lowerStatus === 'pending') {
        return <Button variant="default" size="sm">Request Report</Button>;
    }
    return null;
  }

  return (
    <div className="space-y-4">
        <div className='max-w-xs space-y-2'>
            <Label>Report From</Label>
             <Select value={sdao} onValueChange={setSdao}>
                <SelectTrigger>
                    <SelectValue placeholder="Select SDAO/DC" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="sdao1">SDAO 1</SelectItem>
                    <SelectItem value="dc1">DC 1</SelectItem>
                </SelectContent>
            </Select>
        </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>App-ID</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Area (Ha)</TableHead>
              <TableHead>SDAO Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium font-mono">{app.applictaion_id || ''}</TableCell>
                  <TableCell>Ethan Carter</TableCell>
                  <TableCell>Downtown</TableCell>
                  <TableCell>
                     <Badge variant={app.application_status.name.toLowerCase() === 'approved' ? 'default' : 'secondary'}>{app.application_status.name}</Badge>
                  </TableCell>
                  <TableCell>
                    {renderAction(app.application_status.name)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No reports found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

       <div ref={externalRef} className="h-10" />

       {isLoading && (
        <div className="flex justify-center items-center py-4">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            <span>Loading more applications...</span>
        </div>
      )}
       {!isLoading && hasMore && (
        <div className="flex justify-center">
            <Button onClick={loadMoreApplications} variant="outline">
                Load More
            </Button>
        </div>
      )}
      {!hasMore && !isLoading && (
        <p className="text-center text-muted-foreground py-4">You have reached the end of the list.</p>
      )}
    </div>
  );
}
