import { NewApplicationForm } from "@/components/applications/new-application-form";
import { 
  getDistricts, 
  getCircles, 
  getSubDivisions, 
  getVillages, 
  getLandPurposes 
} from "@/app/actions";
import { cookies } from "next/headers";
import { redirect } from 'next/navigation';

export default async function NewApplicationPage() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    // This should ideally not happen if ProtectedRoute is working, but as a safeguard:
    redirect('/');
  }

  // Fetch all data on the server in parallel, passing the token
  const [districts, circles, subDivisions, villages, landPurposes] = await Promise.all([
    getDistricts(accessToken),
    getCircles(accessToken),
    getSubDivisions(accessToken),
    getVillages(accessToken),
    getLandPurposes(accessToken),
  ]);

  return (
    <div className="flex-1 space-y-4 px-4 md:px-8">
       <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Application for Change of Land Use</h1>
      </div>
      <NewApplicationForm
        districts={districts}
        circles={circles}
        subDivisions={subDivisions}
        villages={villages}
        landPurposes={landPurposes}
      />
    </div>
  );
}
