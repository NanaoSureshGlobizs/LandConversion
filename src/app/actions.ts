'use server';

import { cookies } from 'next/headers';

interface SendOtpResponse {
  success: boolean;
  message?: string;
  data: null;
  debugLog?: string;
}

interface VerifyOtpData {
  accessToken: string;
  refreshToken: string;
  name: string;
  designation: string;
  access: string[];
}

interface VerifyOtpResponse {
  success: boolean;
  data: VerifyOtpData | null;
  message?: any;
  debugLog?: string;
}

const API_BASE_URL = 'https://conversionapi.globizsapp.com/api';

export async function sendOtp(username: string): Promise<SendOtpResponse> {
  const url = `${API_BASE_URL}/auth/send-otp`;
  const payload = { username };
  let debugLog = '--- Sending OTP ---\n';
  debugLog += `Request URL: ${url}\n`;
  debugLog += `Request Payload: ${JSON.stringify(payload, null, 2)}\n`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    debugLog += `API Response: ${JSON.stringify(data, null, 2)}\n`;
    debugLog += '-------------------';

    if (!response.ok) {
      return { success: false, message: data.message || `HTTP error! status: ${response.status}`, data: null, debugLog };
    }

    const responseData = data as SendOtpResponse;
    responseData.debugLog = debugLog;
    return responseData;
  } catch (error) {
    debugLog += `Error: ${error}\n`;
    debugLog += '-------------------';
    console.error('sendOtp error:', error);
    return { success: false, message: 'An unexpected error occurred.', data: null, debugLog };
  }
}

export async function verifyOtp(username: string, otp: string): Promise<VerifyOtpResponse> {
  const url = `${API_BASE_URL}/auth/verify-otp`;
  const payload = { username, otp_code: otp };
  let debugLog = '--- Verifying OTP ---\n';
  debugLog += `Request URL: ${url}\n`;
  debugLog += `Request Payload: ${JSON.stringify(payload, null, 2)}\n`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    debugLog += `API Response: ${JSON.stringify(data, null, 2)}\n`;
    debugLog += '---------------------';


    if (!response.ok) {
       return { success: false, message: data.message || `HTTP error! status: ${response.status}`, data: null, debugLog };
    }

    if (data.success && data.data?.accessToken) {
      cookies().set('accessToken', data.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }
    
    const responseData = data as VerifyOtpResponse;
    responseData.debugLog = debugLog;
    return responseData;

  } catch (error) {
    debugLog += `Error: ${error}\n`;
    debugLog += '---------------------';
    console.error('verifyOtp error:', error);
    return { success: false, message: 'An unexpected error occurred.', data: null, debugLog };
  }
}

export async function logout() {
  cookies().delete('accessToken');
}

export async function checkAuth() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken');
  return !!accessToken;
}

// Client-side fetching function needs accessToken
export async function getDropdownData(endpoint: string, token: string) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`HTTP error! status: ${response.status} for endpoint: ${endpoint}. Body: ${errorBody}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success) {
      return result.data;
    }
    console.error(`API error from ${endpoint}:`, result.message);
    return [];
  } catch (error) {
    console.error(`Failed to fetch from ${endpoint}:`, error);
    return [];
  }
}

async function fetchFromApi(endpoint: string) {
  const url = `${API_BASE_URL}${endpoint}`;
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  const headers: HeadersInit = {
    'Accept': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  } else {
    // If there's no access token, we can't make an authenticated request.
    // Depending on the API, this might be an error or return public data.
    // For this use case, we'll proceed, but log a warning.
    console.warn(`fetchFromApi called for ${endpoint} without an accessToken.`);
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      // Log the error response for debugging
      const errorBody = await response.text();
      console.error(`HTTP error! status: ${response.status} for endpoint: ${endpoint}. Body: ${errorBody}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.success) {
      return result.data;
    }
    console.error(`API error from ${endpoint}:`, result.message);
    return [];
  } catch (error) {
    console.error(`Failed to fetch from ${endpoint}:`, error);
    return [];
  }
}

// These are now fetched on the client-side
// export async function getDistricts() {
//   return fetchFromApi('/district');
// }
// export async function getCircles() {
//   return fetchFromApi('/circle');
// }
// export async function getSubDivisions() {
//   return fetchFromApi('/sub-division');
// }
// export async function getVillages() {
//   return fetchFromApi('/village');
// }
// export async function getLandPurposes() {
//   return fetchFromApi('/land-purpose');
// }
// export async function getLocationTypes() {
//   return fetchFromApi('/location-type');
// }
// export async function getAreaUnits() {
//   return fetchFromApi('/area-unit');
// }
// export async function getLandClassifications() {
//   return fetchFromApi('/land-classification');
// }
// export async function getChangeOfLandUseDates() {
//   return fetchFromApi('/change-of-land-use');
// }
