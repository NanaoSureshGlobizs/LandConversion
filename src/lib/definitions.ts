

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

export interface Relationship {
  id: number;
  name: string;
}

export interface AreaUnit {
    id: number;
    name: string;
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
  form_type: string | null;
  button_name: string | null;
  can_forward: boolean;
  highlight: boolean;
  can_edit: boolean;
  land_address: string; // Added for hill applications
  application_type?: 'hill' | 'normal' | 'plain'; // Added to distinguish application types
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
  patta_no: string | null;
  area_type: string | null;
  created_at: string;
  village_name: string | null;
  can_forward?: boolean; // Optional as it's not in all list responses
  highlight?: boolean;
  can_edit?: boolean;
  form_type?: string;
  button_name?: string;
  application_id: string;
  change_of_land_use_type: string;
  workflow_sequence_id: number;
  applied_area: string;
  status_name: ApplicationStatusName;
  application_type: 'hill' | 'plain';
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
  } | null; // Pagination can be null for some endpoints
  data?: any; // To accommodate the nested data structure
}

export interface LegacyDataItem {
  id: number;
  order_no: string;
  order_date: string;
  legacy_status: number;
  status_name: 'Review' | 'Approve' | 'Reject';
  file_name: string | null;
  file_path: string | null;
}

export type FullLegacyDataResponse = LegacyDataItem & {
    remark?: string;
};

export interface PaginatedLegacyData {
  legacies: LegacyDataItem[];
  pagination: {
    totalCount: number;
    pageCount: number;
    currentPage: number;
    perPage: number;
  };
}


export interface WorkflowItem {
  id: number;
  application_details_id: number;
  to_user_id: number;
  from_user_id: number | null;
  from_user: string | null;
  to_user: string;
  remark: string;
  opened_on: string | null;
  workflow_sequence_id: number;
  created_at: string;
  attachment: string | null;
  days_held: number;
  land_schedule: string | null;
  lattitute_of_land: string | null;
  longitute_of_land: string | null;
  kml_file: string | null;
  survey_details_id: number | null;
  survey_name: string | null;
  survey_status: string | null;
  status: {
    name: string;
    foreground_color: string;
    background_color: string;
  };
  highlight: boolean;
}

export interface WorkflowResponse {
    success: boolean;
    data: WorkflowItem[];
    message: string | null;
}

export interface User {
  id: number;
  name: string;
  designation: string;
  username: string;
  email: string;
  role: string;
  status: number;
}

export interface District {
  id: number;
  name: string;
}

export interface SubDivision {
    id: number;
    name: string;
    district_id: number;
}

export interface Circle {
    id: number;
    name: string;
    sub_division_id: number;
}

export interface HillApplicationListItem {
  id: number;
  created_at: string;
  district_id: number;
  district_name: string;
  sub_division_id: number;
  sub_division_name: string;
  applied_area: string;
  applied_area_unit_name: string;
  application_id: string;
  status_name: string;
  workflow_sequence_id: number;
  original_area_of_plot: string;
  original_area_of_plot_unit_name: string;
  land_address: string;
  lattitute: string;
  longitute: string;
}

export interface PaginatedHillApplications {
  applications: HillApplicationListItem[];
  pagination: {
    totalCount: number;
    pageCount: number;
    currentPage: number;
    perPage: number;
  };
}
