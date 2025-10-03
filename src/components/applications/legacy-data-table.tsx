
'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { LegacyDataItem, PaginatedLegacyData } from '@/lib/definitions';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Calendar as CalendarIcon, Download } from 'lucide-react';
import { getLegacyData } from '@/app/actions';
import { useNearScreen } from '@/hooks/use-near-screen';
import { useDebug } from '@/context/DebugContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface LegacyDataTableProps {
  initialData: PaginatedLegacyData | null;
  accessToken: string;
}

export function LegacyDataTable({ initialData, accessToken }: LegacyDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<LegacyDataItem[]>(initialData?.legacies || []);
  const [page, setPage] = useState(initialData?.pagination.currentPage || 1);
  const [hasMore, setHasMore] = useState( (initialData?.pagination.currentPage || 1) < (initialData?.pagination.pageCount || 1) );
  const [isLoading, setIsLoading] = useState(false);
  const externalRef = useRef(null);
  const { addLog } = useDebug();
  const router = useRouter();
  const isInitialLoad = useRef(true);

  const [legacyType, setLegacyType] = useState('all');
  const [date, setDate] = useState<Date | undefined>();


  const { isNearScreen } = useNearScreen({
    externalRef: isLoading ? null : externalRef,
    once: false,
  });

  const loadMoreData = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const nextPage = page + 1;
    const { data: newData, log } = await getLegacyData(accessToken, nextPage);
    addLog(log || "Log for getLegacyData");

    if (newData && Array.isArray(newData.legacies)) {
      setData(prev => [...prev, ...newData.legacies]);
      setPage(newData.pagination.currentPage);
      setHasMore(newData.pagination.currentPage < newData.pagination.pageCount);
    } else {
        setHasMore(false);
    }
    
    setIsLoading(false);
  }, [page, hasMore, isLoading, addLog, accessToken]);
  
  useEffect(() => {
    if (isInitialLoad.current) {
        isInitialLoad.current = false;
        return;
    }
    if (isNearScreen) {
        loadMoreData();
    }
  }, [isNearScreen, loadMoreData]);


  const filteredData = useMemo(() => {
    return data.filter(item => {
        const searchTermMatch = item.order_no.toLowerCase().includes(searchTerm.toLowerCase());
        const typeMatch = legacyType === 'all' || item.status_name === legacyType;
        // Add date filtering logic if needed
        return searchTermMatch && typeMatch;
    });
  }, [data, searchTerm, legacyType]);

  const getStatusVariant = (status: 'Review' | 'Approve' | 'Reject'): 'default' | 'destructive' | 'secondary' => {
      switch(status) {
          case 'Approve': return 'default';
          case 'Reject': return 'destructive';
          case 'Review':
          default:
            return 'secondary';
      }
  }

  const handleRowClick = (id: number) => {
    router.push(`/dashboard/legacy-data/${id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-grow w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
            placeholder="Search by Order No."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
            />
        </div>
        <Select value={legacyType} onValueChange={setLegacyType}>
            <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Approve">Approve</SelectItem>
                <SelectItem value="Reject">Reject</SelectItem>
                <SelectItem value="Review">Review</SelectItem>
            </SelectContent>
        </Select>
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={'outline'}
                    className={cn(
                    'w-full md:w-[240px] justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Filter by Date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
        </Popover>
        <Button variant="outline" className="w-full md:w-auto">
            <Download className="mr-2"/>
            Export
        </Button>
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order No.</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <TableRow key={item.id} onClick={() => handleRowClick(item.id)} className="cursor-pointer">
                  <TableCell className="font-medium font-mono">{item.order_no}</TableCell>
                  <TableCell>{item.order_date}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(item.status_name)}>{item.status_name}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/legacy-data/${item.id}`}>View</Link>
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No legacy data found.
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
            <span>Loading more records...</span>
        </div>
      )}
       {!isLoading && hasMore && (
        <div className="flex justify-center">
            <Button onClick={loadMoreData} variant="outline">
                Load More
            </Button>
        </div>
      )}
      {!hasMore && (
        <p className="text-center text-muted-foreground py-4">You have reached the end of the list.</p>
      )}
    </div>
  );
}
