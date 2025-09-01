'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Application, ApplicationStatus } from '@/lib/definitions';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ApplicationsTableProps {
  data: Application[];
}

const statusColors: Record<ApplicationStatus, string> = {
  Approved: 'bg-green-100 text-green-800 border-green-200',
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'In Review': 'bg-blue-100 text-blue-800 border-blue-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
  Submitted: 'bg-gray-100 text-gray-800 border-gray-200',
};

export function ApplicationsTable({ data }: ApplicationsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowercasedFilter = searchTerm.toLowerCase();
    return data.filter(
      (item) =>
        item.id.toLowerCase().includes(lowercasedFilter) ||
        item.pattaNumber.toLowerCase().includes(lowercasedFilter) ||
        item.status.toLowerCase().includes(lowercasedFilter)
    );
  }, [data, searchTerm]);

  const handleRowClick = (appId: string) => {
    router.push(`/dashboard/my-applications/${appId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Input
          placeholder="Search by Application ID, Patta No, or Status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Application ID</TableHead>
              <TableHead>Patta Number</TableHead>
              <TableHead>Area (Hectare/Acres)</TableHead>
              <TableHead>Date Submitted</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((app) => (
                <TableRow
                  key={app.id}
                  onClick={() => handleRowClick(app.id)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium">{app.id}</TableCell>
                  <TableCell>{app.pattaNumber}</TableCell>
                  <TableCell>{app.area.toLocaleString()}</TableCell>
                  <TableCell>
                    {new Date(app.dateSubmitted).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn('font-semibold', statusColors[app.status])}
                    >
                      {app.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
