
import { MultiStepForm } from "@/components/applications/multi-step-form";
import { getApplicationById, getDistricts, getCircles, getSubDivisions, getVillages, getLandPurposes, getLocationTypes, getAreaUnits, getLandClassifications, getChangeOfLandUseDates } from "@/app/actions";
import { cookies } from "next/headers";
import { notFound, redirect } from 'next/navigation';
import { ServerLogHandler } from "@/components/debug/server-log-handler";
import type { FullApplicationResponse, Application } from "@/lib/definitions";


export default async function EditApplicationPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/');
  }

  const applicationResult = await getApplicationById(accessToken, id) as { data: FullApplicationResponse | null, log: string | undefined };
  
  if (!applicationResult.data?.owner_details) {
    notFound();
  }
  
  // Add applictaion_id to the owner_details object to pass to the form
  const application: Application = {
      ...applicationResult.data.owner_details,
      applictaion_id: id,
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
    applicationResult.log,
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
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Edit Application: {id}
          </h1>
        </div>
        <p className="text-muted-foreground">
          Modify the details for the land use change application.
        </p>
        <MultiStepForm 
          existingApplication={application}
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
