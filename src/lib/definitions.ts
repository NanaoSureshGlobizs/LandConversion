

export type ApplicationStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'In Review'
  | 'Submitted'
  | 'Inprogress'
  | 'Completed'
  | 'New'
  | 'Review';

export interface Document {
  file_path: string;
  file_name: string;
}

export interface DocumentGroup {
  [key: string]: Document[];
}

// This is based on the `owner_details` object in the API response for a single application
export interface Application {
  owner_name: string;
  email: string;
  phone_number: string;
  dob: string;
  aadhar: string;
  owner_address: string;
  patta_no: string;
  dag_no: string;
  original_area_of_plot: string;
  original_area_of_plot_unit: string;
  area_for_change: string;
  area_for_change_unit: string;
  district: string;
  sdo_circle: string;
  village: string;
  village_number: string;
  location_type: string;
  land_classification: string;
  purpose: string;
  status: ApplicationStatus;
  
  // These fields are not in the new response but were in the old one.
  // Kept for compatibility with form logic for now.
  // Will need to be mapped if not present in owner_details.
  applictaion_id?: string;
  district_id?: number;
  circle_id?: number;
  sub_division?: string;
  sub_division_id?: number;
  village_id?: number;
  location_type_id?: number;
  land_classification_id?: number;
  land_purpose_id?: number;
  area_unit_id?: number;
  application_area_unit_id?: number;
  change_of_land_use_id?: number;
  purpose_id?: number;
}

export interface FullApplicationResponse {
    owner_details: Application;
    documents: DocumentGroup;
}


export interface ApplicationListItem {
  id: number;
  patta_no: string;
  area_type: string;
  created_at: string;
  applictaion_id: string;
  application_status: {
    name: ApplicationStatus;
    foreground_color: string;
    background_color: string;
  };
  district: {
    id: number;
    name: string;
  };
  sub_division: {
    id: number;
    name: string;
  };
}


export interface PaginatedApplications {
  applications: ApplicationListItem[];
  pagination: {
    totalCount: number;
    pageCount: number;
    currentPage: number;
    perPage: number;
  };
}
