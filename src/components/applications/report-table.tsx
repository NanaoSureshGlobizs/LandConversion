
'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { ApplicationListItem, PaginatedApplications, ApplicationStatusOption } from '@/lib/definitions';
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
import { getApplications, forwardApplication } from '@/app/actions';
import { useNearScreen } from '@/hooks/use-near-screen';
import { useDebug } from '@/context/DebugContext';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { useRouter } from 'next/navigation';
import { Checkbox } from '../ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface ReportTableProps {
  initialData: PaginatedApplications | null;
  accessToken: string;
  statuses: ApplicationStatusOption[];
}

export function ReportTable({ initialData, accessToken, statuses }: ReportTableProps) {
  const [applications, setApplications] = useState<ApplicationListItem[]>(initialData?.applications || []);
  const [page, setPage] = useState(initialData?.pagination.currentPage || 1);
  const [hasMore, setHasMore] = useState( (initialData?.pagination.currentPage || 1) < (initialData?.pagination.pageCount || 1) );
  const [isLoading, setIsLoading] = useState(false);
  const externalRef = useRef(null);
  const { addLog } = useDebug();
  const router = useRouter();
  const { toast } = useToast();
  
  const [sdao, setSdao] = useState('');
  const [isForwarding, setIsForwarding] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

  const { isNearScreen } = useNearScreen({
    externalRef: isLoading ? null : externalRef,
    once: false,
  });

  useEffect(() => {
    setApplications(initialData?.applications || []);
    setPage(initialData?.pagination.currentPage || 1);
    setHasMore((initialData?.pagination.currentPage || 1) < (initialData?.pagination.pageCount || 1));
    setSelectedRows({});
  }, [initialData]);

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

  const handleSelectAll = (checked: boolean) => {
    const newSelectedRows: Record<string, boolean> = {};
    if (checked) {
      applications.forEach(app => {
        newSelectedRows[app.id] = true;
      });
    }
    setSelectedRows(newSelectedRows);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedRows(prev => ({
      ...prev,
      [id]: checked
    }));
  };
  
  const selectedIds = useMemo(() => {
      return Object.keys(selectedRows).filter(id => selectedRows[id]);
  }, [selectedRows]);

  const handleForward = async () => {
    if (selectedIds.length === 0) {
      toast({
        title: "No Applications Selected",
        description: "Please select at least one application to forward.",
        variant: "destructive"
      });
      return;
    }

    setIsForwarding(true);
    addLog(`Forwarding applications with IDs: [${selectedIds.join(', ')}]`);

    const results = await Promise.all(
        selectedIds.map(id => {
            const payload = {
                application_details_id: parseInt(id),
                verification_status_id: 6, // Placeholder for 'Forward'
                remark: "Forwarded from Report Page",
                attachment: "",
                status: 1, 
            };
            return forwardApplication(payload, accessToken);
        })
    );
    
    const successfulForwards = results.filter(r => r.success).length;
    const failedForwards = results.length - successfulForwards;

    if (successfulForwards > 0) {
        toast({
            title: "Forward Successful",
            description: `${successfulForwards} application(s) have been forwarded.`
        });
        setSelectedRows({});
    }

    if (failedForwards > 0) {
         toast({
            title: "Forward Failed",
            description: `${failedForwards} application(s) could not be forwarded. Check logs for details.`,
            variant: "destructive"
        });
    }

    setIsForwarding(false);
  };


  const filteredData = useMemo(() => {
    return applications;
  }, [applications]);

  const handleRowClick = (appId: number) => {
    router.push(`/dashboard/application/${appId}?from=/dashboard/report`);
  };

  const isAllSelected = applications.length > 0 && selectedIds.length === applications.length;

  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
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
            <Button onClick={handleForward} disabled={isForwarding || selectedIds.length === 0}>
                {isForwarding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Forward ({selectedIds.length})
            </Button>
        </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
               <TableHead className="w-[50px]">
                 <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>App-ID</TableHead>
              <TableHead>Patta No.</TableHead>
              <TableHead>District</TableHead>
              <TableHead>SDAO Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((app) => (
                <TableRow key={app.id} onClick={() => handleRowClick(app.id)} className="cursor-pointer">
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={selectedRows[app.id] || false}
                        onCheckedChange={(checked) => handleSelectRow(app.id.toString(), !!checked)}
                        aria-label={`Select row ${app.id}`}
                      />
                  </TableCell>
                  <TableCell className="font-medium font-mono">{app.application_id || 'N/A'}</TableCell>
                  <TableCell>{app.patta_no}</TableCell>
                  <TableCell>{app.district.name}</TableCell>
                  <TableCell>
                     <Badge variant={app.application_status.name.toLowerCase() === 'approved' ? 'default' : 'secondary'}>{app.application_status.name}</Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/application/${app.id}?from=/dashboard/report`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
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

    