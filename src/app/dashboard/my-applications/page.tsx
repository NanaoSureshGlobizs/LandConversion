import { ApplicationsTable } from '@/components/applications/applications-table';
import { mockApplications } from '@/lib/mock-data';

export default function MyApplicationsPage() {
  return (
    <div className="flex-1 space-y-4 px-4 md:px-8">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">My Applications</h1>
      </div>
      <p className="text-muted-foreground">
        View and manage all your past and current land use applications.
      </p>
      <ApplicationsTable data={mockApplications} />
    </div>
  );
}