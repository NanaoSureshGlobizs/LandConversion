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
import { Button } from '@/components/ui/button';

interface ApplicationsTableProps {
  data: Application[];
}

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
          placeholder="Search by Application ID"
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
              <TableHead>Area (Ha)</TableHead>
              <TableHead>Date Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((app) => (
                <TableRow
                  key={app.id}
                >
                  <TableCell className="font-medium" onClick={() => handleRowClick(app.id)}>{app.id}</TableCell>
                  <TableCell onClick={() => handleRowClick(app.id)}>{app.pattaNumber}</TableCell>
                  <TableCell onClick={() => handleRowClick(app.id)}>{app.area.toLocaleString()} acres</TableCell>
                  <TableCell onClick={() => handleRowClick(app.id)}>
                    {new Date(app.dateSubmitted).toLocaleDateString('en-CA')}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="cursor-default">
                      {app.status}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button variant="link" onClick={() => handleRowClick(app.id)}>
                      Track Application
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
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
