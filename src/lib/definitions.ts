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
  name: string;
  fileName: string;
  uploadedDate: string;
}

// This is now based on the API response for a single application
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
  area_for_change: string;
  district: string;
  sdo_circle: string;
  village: string;
  village_number: string;
  location_type: string;
  land_classification: string;
  purpose: string;
  status: ApplicationStatus;
  // Documents are not yet in the view API response
  documents?: Document[]; 
}


export interface ApplicationListItem {
  patta_no: string;
  area_type: string;
  date_submitted: string;
  applictaion_id: string;
  status_name: ApplicationStatus;
}

export interface PaginatedApplications {
  lists: ApplicationListItem[];
  pagination: {
    totalCount: number;
    pageCount: number;
    currentPage: number;
    perPage: number;
  };
}
