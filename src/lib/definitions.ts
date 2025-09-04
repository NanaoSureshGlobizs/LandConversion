

export type ApplicationStatusName =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'In Review'
  | 'Submitted'
  | 'Inprogress'
  | 'Completed'
  | 'New'
  | 'Review';

export interface UploadedFile {
  id: number;
  file_path: string;
  file_name: string;
}

export interface ApplicationStatusOption {
  id: string;
  status_name: string;
}

// This is based on the `data` object in the API response for a single application
export interface Application {
  id: number;
  application_no: string;
  applicant_details_id: number;
  applicant_name: string;
  phone_number: string;
  email: string;
  address: string;
  aadhar_no: string;
  date_of_birth: string; // "1990-01-01"
  land_purpose_id: number;
  change_of_land_use_id: number;
  area_applied_for_conversion: string;
  application_area_unit_id: number;
  application_area_unit_name: string;
  purpose_id: number;
  created_at: string; // "Sep 2, 2025"
  patta_no: string;
  dag_no: string;
  sheet_no: string | null;
  original_area_of_plot: string;
  land_area_unit_id: number;
  land_area_unit_name: string;
  location_type_id: number;
  location_name: string;
  land_classification_id: number;
  land_classification: string;
  circle_id: number;
  circle_name: string;
  village_id: number;
  village_name: string;
  can_forward: boolean;
  highlight: boolean;
  can_edit: boolean;
  application_status: {
    name: ApplicationStatusName;
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
  upload_files: UploadedFile[];
}

// Renaming for clarity as this is no longer the "Full" response but just the app data
export type FullApplicationResponse = Application;


export interface ApplicationListItem {
  id: number;
  patta_no: string;
  area_type: string;
  created_at: string;
  applictaion_id: string;
  application_status: {
    name: ApplicationStatusName;
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
