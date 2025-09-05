
import { MultiStepForm } from "@/components/applications/multi-step-form";
import { getApplicationById, getDistricts, getCircles, getSubDivisions, getVillages, getLandPurposes, getLocationTypes, getAreaUnits, getLandClassifications, getChangeOfLandUseDates, getPurposes, getRelationships } from "@/app/actions";
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
  
  if (!applicationResult.data) {
    notFound();
  }
  
  // The multi-step form expects a slightly different structure than the new API provides.
  // We need to map the flat API response to the nested structure the form uses.
  const applicationForForm = {
      owner_name: applicationResult.data.applicant_name,
      dob: applicationResult.data.date_of_birth,
      aadhar: applicationResult.data.aadhar_no,
      phone_number: applicationResult.data.phone_number,
      email: applicationResult.data.email,
      owner_address: applicationResult.data.address,
      district: applicationResult.data.district.name,
      sdo_circle: applicationResult.data.circle_name,
      village: applicationResult.data.village_name,
      village_number: applicationResult.data.village_id.toString(),
      location_type: applicationResult.data.location_name,
      patta_no: applicationResult.data.patta_no,
      dag_no: applicationResult.data.dag_no,
      original_area_of_plot: applicationResult.data.original_area_of_plot,
      original_area_of_plot_unit: applicationResult.data.land_area_unit_name,
      area_for_change: applicationResult.data.area_applied_for_conversion,
      area_for_change_unit: applicationResult.data.application_area_unit_name,
      land_classification: applicationResult.data.land_classification,
      purpose: '', // Purpose for conversion is not in the view response, map by id
      status: applicationResult.data.application_status.name,
      
      // Pass through IDs needed for the form's initial state
      applictaion_id: id,
      district_id: applicationResult.data.district.id,
      circle_id: applicationResult.data.circle_id,
      sub_division_id: applicationResult.data.sub_division.id,
      village_id: applicationResult.data.village_id,
      location_type_id: applicationResult.data.location_type_id,
      land_classification_id: applicationResult.data.land_classification_id,
      land_purpose_id: applicationResult.data.land_purpose_id,
      area_unit_id: applicationResult.data.land_area_unit_id,
      application_area_unit_id: applicationResult.data.application_area_unit_id,
      change_of_land_use_id: applicationResult.data.change_of_land_use_id,
      purpose_id: applicationResult.data.purpose_id,
  };


  const [
    districtsResult, 
    circlesResult, 
    subDivisionsResult, 
    villagesResult, 
    landPurposesResult, 
    locationTypesResult, 
    areaUnitsResult, 
    landClassificationsResult, 
    changeOfLandUseDatesResult,
    purposesResult,
    relationshipsResult,
  ] = await Promise.all([
    getDistricts(accessToken),
    getCircles(accessToken),
    getSubDivisions(accessToken),
    getVillages(accessToken),
    getLandPurposes(accessToken),
    getLocationTypes(accessToken),
    getAreaUnits(accessToken),
    getLandClassifications(accessToken),
    getChangeOfLandUseDates(accessToken),
    getPurposes(accessToken),
    getRelationships(accessToken),
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
    purposesResult.log,
    relationshipsResult.log,
  ];

  return (
    <>
      <ServerLogHandler logs={allLogs} />
      <div className="flex-1 space-y-4 px-4 md:px-8">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Edit Application: {applicationResult.data.application_no}
          </h1>
        </div>
        <p className="text-muted-foreground">
          Modify the details for the land use change application.
        </p>
        <MultiStepForm 
          existingApplication={applicationForForm as any} // Cast because the structure is intentionally different
          districts={districtsResult.data}
          circles={circlesResult.data}
          subDivisions={subDivisionsResult.data}
          villages={villagesResult.data}
          landPurposes={landPurposesResult.data}
          locationTypes={locationTypesResult.data}
          areaUnits={areaUnitsResult.data}
          landClassifications={landClassificationsResult.data}
          changeOfLandUseDates={changeOfLandUseDatesResult.data}
          purposes={purposesResult.data}
          relationships={relationshipsResult.data}
          accessToken={accessToken}
        />
      </div>
    </>
  );
}

    
