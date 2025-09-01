export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected' | 'In Review';

export interface Application {
  id: string;
  pattaNumber: string;
  area: number; // in square feet
  dateSubmitted: string;
  status: ApplicationStatus;
  village: string;
  district: string;
  surveyNumber: string;
  currentLandUse: string;
  proposedLandUse: string;
  ownerName: string;
}
