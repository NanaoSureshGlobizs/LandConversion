'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { ApplicationListItem } from '@/lib/definitions';
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
import { Trash2 } from 'lucide-react';

interface ApplicationsTableProps {
  data: ApplicationListItem[];
}

export function ApplicationsTable({ data }: ApplicationsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowercasedFilter = searchTerm.toLowerCase();
    return data.filter(
      (item) =>
        item.applictaion_id?.toLowerCase().includes(lowercasedFilter) ||
        item.patta_no.toLowerCase().includes(lowercasedFilter) ||
        item.status_name.toLowerCase().includes(lowercasedFilter)
    );
  }, [data, searchTerm]);

  const handleView = (appId: string) => {
    router.push(`/dashboard/my-applications/${appId}`);
  };

  const handleEdit = (appId: string) => {
    router.push(`/dashboard/my-applications/${appId}/edit`);
  };

  const handleDelete = (appId: string) => {
    // In a real app, you'd show a confirmation dialog here.
    console.log('Delete application:', appId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Input
          placeholder="Search by Application ID, Patta, or Status"
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
              <TableHead>Area Unit</TableHead>
              <TableHead>Date Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((app) => (
                <TableRow key={app.applictaion_id}>
                  <TableCell className="font-medium">{app.applictaion_id}</TableCell>
                  <TableCell>{app.patta_no}</TableCell>
                  <TableCell>{app.area_type}</TableCell>
                  <TableCell>
                    {app.date_submitted}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold">
                      {app.status_name}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(app.applictaion_id)}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(app.applictaion_id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(app.applictaion_id)}
                      >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
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
