
'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { ApplicationListItem, PaginatedApplications } from '@/lib/definitions';
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
import { Loader2, Search } from 'lucide-react';
import { getApplications } from '@/app/actions';
import { useNearScreen } from '@/hooks/use-near-screen';
import { useDebug } from '@/context/DebugContext';
import Link from 'next/link';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';

interface UnprocessedApplicationsTableProps {
  initialData: PaginatedApplications | null;
}

const mockOwners = [
    "Arjun Verma", "Priya Sharma", "Vikram Singh", "Anjali Kapoor", 
    "Rohan Mehra", "Divya Patel", "Karan Khanna", "Sneha Reddy",
    "Rahul Joshi", "Neha Gupta", "Suresh Patel", "Meena Kumari"
];

const mockAreas = [
    "10 acres", "5 acres", "8 acres", "12 acres", "7 acres", "9 acres", "6 acres", "11 acres", "4 acres", "15 acres"
]

export function UnprocessedApplicationsTable({ initialData }: UnprocessedApplicationsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [status, setStatus] = useState('');
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationListItem[]>(initialData?.applications || []);
  const [page, setPage] = useState(initialData?.pagination.currentPage || 1);
  const [hasMore, setHasMore] = useState( (initialData?.pagination.currentPage || 1) < (initialData?.pagination.pageCount || 1) );
  const [isLoading, setIsLoading] = useState(false);
  const externalRef = useRef(null);
  const { addLog } = useDebug();

  const { isNearScreen } = useNearScreen({
    externalRef: isLoading ? null : externalRef,
    once: false,
  });

  const loadMoreApplications = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const nextPage = page + 1;
    const { data: newData, log } = await getApplications(nextPage);
    addLog(log || "Log for getApplications");

    if (newData && Array.isArray(newData.applications)) {
      setApplications(prev => [...prev, ...newData.applications]);
      setPage(newData.pagination.currentPage);
      setHasMore(newData.pagination.currentPage < newData.pagination.pageCount);
    } else {
        setHasMore(false);
    }
    
    setIsLoading(false);
  }, [page, hasMore, isLoading, addLog]);
  
  useEffect(() => {
    if (isNearScreen) {
        loadMoreApplications();
    }
  }, [isNearScreen, loadMoreApplications]);


  const filteredData = useMemo(() => {
    if (!searchTerm) return applications;
    const lowercasedFilter = searchTerm.toLowerCase();
    return applications.filter(
      (item, index) =>
        item.applictaion_id?.toLowerCase().includes(lowercasedFilter) ||
        item.patta_no.toLowerCase().includes(lowercasedFilter) ||
        (mockOwners[index % mockOwners.length] || '').toLowerCase().includes(lowercasedFilter)
    );
  }, [applications, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-grow sm:flex-grow-0 sm:min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
            placeholder="Search by App ID, Owner, Patta No."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            />
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last7">Last 7 days</SelectItem>
                <SelectItem value="last30">Last 30 days</SelectItem>
                <SelectItem value="this_month">This month</SelectItem>
            </SelectContent>
        </Select>
         <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
            </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>App ID</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Patta No.</TableHead>
              <TableHead>Area (Ha)</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((app, index) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium font-mono">{app.applictaion_id || ''}</TableCell>
                  <TableCell>{mockOwners[index % mockOwners.length]}</TableCell>
                  <TableCell>{app.patta_no}</TableCell>
                  <TableCell>{mockAreas[index % mockAreas.length]}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="link" className="p-0 h-auto" asChild>
                        <Link href={`/dashboard/my-applications/${app.applictaion_id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No unprocessed applications found.
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
      {!hasMore && (
        <p className="text-center text-muted-foreground py-4">You have reached the end of the list.</p>
      )}
    </div>
  );
}
