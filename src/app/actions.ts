'use server';

import { cookies } from 'next/headers';
import Cookies from 'js-cookie';

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

async function fetchFromApi(endpoint: string, token: string | undefined) {
  if (!token) {
    console.error(`Authentication token not found for endpoint: ${endpoint}`);
    // In a real app, you might want to throw an error or handle this case differently
    return [];
  }

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
      // Depending on the expected behavior, you might want to throw an error
      // or return an empty array. Returning empty for now to avoid crashing the form.
      return [];
    }

    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      return result.data;
    }

    console.error(`API error or unexpected data format from ${endpoint}:`, result.message || result);
    return [];
  } catch (error) {
    console.error(`Failed to fetch from ${endpoint}:`, error);
    return [];
  }
}

// Functions to be called from Server Components
export async function getDistricts(token: string) {
  return fetchFromApi('/district', token);
}
export async function getCircles(token: string) {
  return fetchFromApi('/circle', token);
}
export async function getSubDivisions(token: string) {
  return fetchFromApi('/sub-division', token);
}
export async function getVillages(token: string) {
  return fetchFromApi('/village', token);
}
export async function getLandPurposes(token: string) {
  return fetchFromApi('/land-purpose', token);
}
export async function getLocationTypes(token: string) {
  return fetchFromApi('/location-type', token);
}
export async function getAreaUnits(token: string) {
  return fetchFromApi('/area-unit', token);
}
export async function getLandClassifications(token: string) {
  return fetchFromApi('/land-classification', token);
}
export async function getChangeOfLandUseDates(token: string) {
  return fetchFromApi('/change-of-land-use', token);
}
