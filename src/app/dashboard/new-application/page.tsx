import { NewApplicationForm } from "@/components/applications/new-application-form";
import { 
  getDistricts, 
  getCircles, 
  getSubDivisions, 
  getVillages, 
  getLandPurposes 
} from "@/app/actions";

export default async function NewApplicationPage() {
  // Fetch all data on the server in parallel
  const [districts, circles, subDivisions, villages, landPurposes] = await Promise.all([
    getDistricts(),
    getCircles(),
    getSubDivisions(),
    getVillages(),
    getLandPurposes(),
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
