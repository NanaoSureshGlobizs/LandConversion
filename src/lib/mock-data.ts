import type { Application } from './definitions';

export const mockApplications: Application[] = [
  {
    id: 'APP12345',
    pattaNumber: 'PT12345',
    area: 12,
    dateSubmitted: '2023-08-15',
    status: 'Submitted',
    village: 'Ayangpalli',
    district: 'Imphal East',
    surveyNumber: 'SN-789', // Not in image, keeping from old mock
    currentLandUse: 'Agricultural', // Not in image, keeping from old mock
    proposedLandUse: 'Residential', // Not in image, keeping from old mock
    ownerName: 'Sophia Clark',
    dob: '19-02-1985',
    email: 'sophiaclerk@gmail.com',
    phoneNumber: '+91 789 456 123',
    aadhar: '8978 5641 7894',
    ownerAddress: 'Paddy',
    dagNo: '547',
    areaForChange: 'Partial',
    sdoCircle: 'Porompat',
    villageNumber: '5',
    landAddress: 'Ayangpalli',
    locationType: 'Rural',
    presentLandClassification: 'Paddy',
    purpose: 'Shop Construction',
    documents: [
      { name: 'Patta', fileName: 'patta.jpg', uploadedDate: 'July 15, 2024' },
      { name: 'Aadhar', fileName: 'aadhar.jpg', uploadedDate: 'July 15, 2024' },
      { name: 'Letter', fileName: 'letter.pdf', uploadedDate: 'July 15, 2024' },
    ],
  },
  {
    id: 'APP67890',
    pattaNumber: 'PT12345',
    area: 12.0,
    dateSubmitted: '2023-07-22',
    status: 'Inprogress',
    village: 'Metupalayam',
    district: 'Coimbatore',
    surveyNumber: 'SN-101',
    currentLandUse: 'Fallow',
    proposedLandUse: 'Commercial',
    ownerName: 'Priya Sharma',
    dob: '10-05-1990',
    email: 'priya.sharma@example.com',
    phoneNumber: '+91 987 654 3210',
    aadhar: '1234 5678 9012',
    ownerAddress: '123, Main St, Metupalayam',
    dagNo: '101A',
    areaForChange: 'Full',
    sdoCircle: 'Coimbatore North',
    villageNumber: '10',
    landAddress: 'Near river bridge',
    locationType: 'Urban',
    presentLandClassification: 'Fallow',
    purpose: 'Shopping Complex',
    documents: [
        { name: 'Patta', fileName: 'patta-002.jpg', uploadedDate: 'July 18, 2024' },
    ],
  },
  {
    id: 'APP67890',
    pattaNumber: 'PT12345',
    area: 12,
    dateSubmitted: '2023-07-22',
    status: 'Completed',
    village: 'Valparai',
    district: 'Coimbatore',
    surveyNumber: 'SN-212',
    currentLandUse: 'Agricultural',
    proposedLandUse: 'Industrial',
    ownerName: 'Anand Raj',
    dob: '22-11-1975',
    email: 'anand.raj@example.com',
    phoneNumber: '+91 876 543 2109',
    aadhar: '2345 6789 0123',
    ownerAddress: 'Tea Estate, Valparai',
    dagNo: '212B',
    areaForChange: 'Partial',
    sdoCircle: 'Valparai',
    villageNumber: '1',
    landAddress: 'Hillside',
    locationType: 'Rural',
    presentLandClassification: 'Tea Plantation',
    purpose: 'Processing Unit',
    documents: [
      { name: 'Patta', fileName: 'patta-003.jpg', uploadedDate: 'July 20, 2024' },
      { name: 'Aadhar', fileName: 'aadhar-003.jpg', uploadedDate: 'July 20, 2024' },
    ],
  },
];

export const districts = ['Coimbatore', 'Tiruppur', 'Erode', 'Salem', 'Imphal East'];

export const sdoCircles = ['Porompat', 'Coimbatore North', 'Valparai'];

export const villages = [
  'Kovilpatti',
  'Metupalayam',
  'Valparai',
  'Pollachi',
  'Avinashi',
  'Palladam',
  'Gobichettipalayam',
  'Mettur',
  'Ayangpalli'
];

export const landUseTypes = [
  'Agricultural',
  'Residential',
  'Commercial',
  'Industrial',
  'Fallow',
  'Forest',
  'Mixed-Use Development',
  'Tea Plantation',
  'Paddy'
];
