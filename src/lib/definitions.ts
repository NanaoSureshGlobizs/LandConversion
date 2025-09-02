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

export interface Application {
  id: string;
  pattaNumber: string;
  area: number; // in square feet or Hectare/Acres as string? The image says Hectare/Acres, mock data is number
  dateSubmitted: string;
  status: ApplicationStatus;
  village: string;
  district: string;
  surveyNumber: string;
  currentLandUse: string;
  proposedLandUse: string; // from old form
  ownerName: string;

  // From image
  dob: string;
  email: string;
  phoneNumber: string;
  aadhar: string;
  ownerAddress: string;
  dagNo: string;
  areaForChange: string;
  sdoCircle: string;
  villageNumber: string;
  landAddress: string;
  locationType: string;
  presentLandClassification: string;
  purpose: string;
  documents: Document[];
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