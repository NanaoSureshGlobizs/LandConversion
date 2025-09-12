
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ServerLogHandler } from '@/components/debug/server-log-handler';
import { UserManagementTable } from '@/components/applications/user-management-table';
import { getUsers, getDistricts, getSubDivisions, getCircles } from '@/app/actions';
import { CreateUserForm } from '@/components/applications/create-user-form';
import type { User } from '@/lib/definitions';

export default async function UserManagementPage() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/');
  }

  const [
    { data: users, log: usersLog },
    { data: districts, log: districtsLog },
    { data: subDivisions, log: subDivisionsLog },
    { data: circles, log: circlesLog },
  ] = await Promise.all([
    getUsers(accessToken),
    getDistricts(accessToken),
    getSubDivisions(accessToken),
    getCircles(accessToken),
  ]);

  const allLogs = [usersLog, districtsLog, subDivisionsLog, circlesLog];

  return (
    <>
      <ServerLogHandler logs={allLogs} />
      <div className="flex-1 space-y-4 px-4 md:px-8">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">User Management</h1>
          <CreateUserForm
            districts={districts}
            subDivisions={subDivisions}
            circles={circles}
            accessToken={accessToken}
          />
        </div>
        <p className="text-muted-foreground">
          Create, view, and manage user accounts and permissions.
        </p>
        <UserManagementTable initialData={users as User[]} accessToken={accessToken} />
      </div>
    </>
  );
}
