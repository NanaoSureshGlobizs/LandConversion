

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
import { Loader2, Search, Calendar as CalendarIcon, Download, Filter, X } from 'lucide-react';
import { getLegacyData, exportLegacyDataToExcel } from '@/app/actions';
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
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

interface LegacyDataTableProps {
  initialData: PaginatedLegacyData | null;
  accessToken: string;
}

export function LegacyDataTable({ initialData, accessToken }: LegacyDataTableProps) {
  const [data, setData] = useState<LegacyDataItem[]>(initialData?.legacies || []);
  const [page, setPage] = useState(initialData?.pagination?.currentPage || 1);
  const [hasMore, setHasMore] = useState( (initialData?.pagination?.currentPage || 1) < (initialData?.pagination?.pageCount || 1) );
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const externalRef = useRef(null);
  const { addLog } = useDebug();
  const { toast } = useToast();
  const router = useRouter();
  const isInitialLoad = useRef(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [legacyType, setLegacyType] = useState('all');
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  
  const handleSearch = async () => {
      setIsLoading(true);
      const filters = {
          order_no: searchTerm,
          from_date: fromDate ? format(fromDate, 'yyyy-MM-dd') : undefined,
          to_date: toDate ? format(toDate, 'yyyy-MM-dd') : undefined,
          legacy_type: legacyType !== 'all' ? legacyType : undefined,
      };
      const { data: newData, log } = await getLegacyData(accessToken, 1, 10, filters);
      addLog(log || "Log for getLegacyData with filters");
      if (newData && Array.isArray(newData.legacies)) {
          setData(newData.legacies);
          setPage(newData.pagination.currentPage);
          setHasMore(newData.pagination.currentPage < newData.pagination.pageCount);
      } else {
          setData([]);
          setHasMore(false);
      }
      setIsLoading(false);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setLegacyType('all');
    setFromDate(undefined);
    setToDate(undefined);
    // Optionally re-fetch data with no filters
    handleSearch();
  };


  const { isNearScreen } = useNearScreen({
    externalRef: isLoading ? null : externalRef,
    once: false,
  });

  const loadMoreData = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const nextPage = page + 1;
    const filters = {
        order_no: searchTerm,
        from_date: fromDate ? format(fromDate, 'yyyy-MM-dd') : undefined,
        to_date: toDate ? format(toDate, 'yyyy-MM-dd') : undefined,
        legacy_type: legacyType !== 'all' ? legacyType : undefined,
    };
    const { data: newData, log } = await getLegacyData(accessToken, nextPage, 10, filters);
    addLog(log || "Log for getLegacyData");

    if (newData && Array.isArray(newData.legacies)) {
      setData(prev => [...prev, ...newData.legacies]);
      setPage(newData.pagination.currentPage);
      setHasMore(newData.pagination.currentPage < newData.pagination.pageCount);
    } else {
        setHasMore(false);
    }
    
    setIsLoading(false);
  }, [page, hasMore, isLoading, addLog, accessToken, searchTerm, fromDate, toDate, legacyType]);
  
  useEffect(() => {
    if (isInitialLoad.current) {
        isInitialLoad.current = false;
        return;
    }
    if (isNearScreen) {
        loadMoreData();
    }
  }, [isNearScreen, loadMoreData]);

  const handleExport = async () => {
    setIsExporting(true);
    const filters = {
      order_no: searchTerm,
      from_date: fromDate ? format(fromDate, 'yyyy-MM-dd') : undefined,
      to_date: toDate ? format(toDate, 'yyyy-MM-dd') : undefined,
      legacy_type: legacyType !== 'all' ? legacyType : undefined,
    };
    const result = await exportLegacyDataToExcel(accessToken, filters);

    if (result.debugLog) {
      addLog(result.debugLog);
    }

    if (result.success && result.data) {
      try {
        const { fileContent, fileName, mimeType } = result.data;
        const byteCharacters = atob(fileContent);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        toast({
            title: 'Export Successful',
            description: 'The legacy data has been exported to Excel.',
        });
      } catch (error) {
        toast({
          title: 'Export Failed',
          description: 'Could not process the downloaded file.',
          variant: 'destructive',
        });
        console.error("Error creating blob from base64:", error);
      }
    } else {
      toast({
        title: 'Export Failed',
        description: result.message || 'An unknown error occurred during export.',
        variant: 'destructive',
      });
    }

    setIsExporting(false);
  };

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
  
  const activeFilterCount = [searchTerm, legacyType !== 'all', fromDate, toDate].filter(Boolean).length;


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Popover>
          <PopoverTrigger asChild>
             <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {activeFilterCount > 0 && <Badge variant="secondary" className="ml-2">{activeFilterCount}</Badge>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
             <div className="space-y-4">
                <div className="space-y-2">
                    <p className="text-sm font-medium">Filter Legacy Data</p>
                    <p className="text-sm text-muted-foreground">Apply filters to find specific records.</p>
                </div>
                <Separator />
                <div className="space-y-4">
                    <Input
                        placeholder="Search by Order No."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Select value={legacyType} onValueChange={setLegacyType}>
                        <SelectTrigger>
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
                            <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal', !fromDate && 'text-muted-foreground')}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {fromDate ? format(fromDate, 'PPP') : <span>From Date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus /></PopoverContent>
                    </Popover>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal', !toDate && 'text-muted-foreground')}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {toDate ? format(toDate, 'PPP') : <span>To Date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus /></PopoverContent>
                    </Popover>
                </div>
                 <div className="flex justify-between">
                    <Button variant="ghost" onClick={clearFilters} disabled={isLoading}>Clear</Button>
                    <Button onClick={handleSearch} disabled={isLoading}>
                       {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
                       Apply
                    </Button>
                 </div>
             </div>
          </PopoverContent>
        </Popover>
        <Button variant="outline" className="w-full sm:w-auto" onClick={handleExport} disabled={isExporting}>
            {isExporting ? <Loader2 className="mr-2 animate-spin"/> : <Download className="mr-2"/>}
            Export to Excel
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
            {data.length > 0 ? (
              data.map((item, index) => (
                <TableRow key={`${item.id}-${item.order_no}-${index}`} onClick={() => handleRowClick(item.id)} className="cursor-pointer">
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


    