import { NewApplicationForm } from "@/components/applications/new-application-form";
import { 
  getDistricts, 
  getCircles, 
  getSubDivisions, 
  getVillages, 
  getLandPurposes,
  getLocationTypes,
  getAreaUnits,
  getLandClassifications,
  getChangeOfLandUseDates
} from "@/app/actions";
import { cookies } from "next/headers";
import { redirect } from 'next/navigation';
import { ServerLogHandler } from "@/components/debug/server-log-handler";

export default async function NewApplicationPage() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/');
  }

  const [
    districtsResult, 
    circlesResult, 
    subDivisionsResult, 
    villagesResult, 
    landPurposesResult, 
    locationTypesResult, 
    areaUnitsResult, 
    landClassificationsResult, 
    changeOfLandUseDatesResult
  ] = await Promise.all([
    getDistricts(accessToken),
    getCircles(accessToken),
    getSubDivisions(accessToken),
    getVillages(accessToken),
    getLandPurposes(accessToken),
    getLocationTypes(accessToken),
    getAreaUnits(accessToken),
    getLandClassifications(accessToken),
    getChangeOfLandUseDates(accessToken)
  ]);
  
  const allLogs = [
    districtsResult.log,
    circlesResult.log,
    subDivisionsResult.log,
    villagesResult.log,
    landPurposesResult.log,
    locationTypesResult.log,
    areaUnitsResult.log,
    landClassificationsResult.log,
    changeOfLandUseDatesResult.log,
  ];

  return (
    <>
      <ServerLogHandler logs={allLogs} />
      <div className="flex-1 space-y-4 px-4 md:px-8">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Application for Change of Land Use</h1>
        </div>
        <NewApplicationForm
          districts={districtsResult.data}
          circles={circlesResult.data}
          subDivisions={subDivisionsResult.data}
          villages={villagesResult.data}
          landPurposes={landPurposesResult.data}
          locationTypes={locationTypesResult.data}
          areaUnits={areaUnitsResult.data}
          landClassifications={landClassificationsResult.data}
          changeOfLandUseDates={changeOfLandUseDatesResult.data}
          accessToken={accessToken}
        />
      </div>
    </>
  );
}
