
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

async function fetchFromApi(endpoint: string, token: string | undefined) {
  const url = `${API_BASE_URL}${endpoint}`;
  let debugLog = `--- Fetching from API ---\n`;
  debugLog += `Request URL: ${url}\n`;

  if (!token) {
    debugLog += `Authentication token not found for endpoint: ${endpoint}\n`;
    debugLog += '---------------------------\n';
    console.error(`Authentication token not found for endpoint: ${endpoint}`);
    return { data: null, debugLog };
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    const responseText = await response.text();

    if (!response.ok) {
      const errorMessage = `HTTP error! status: ${response.status} for endpoint: ${endpoint}. Body: ${responseText}`;
      console.error(errorMessage);
      debugLog += `API Error: ${errorMessage}\n`;
      debugLog += '---------------------------\n';
      // Attempt to parse the error response as JSON anyway
      try {
        const errorJson = JSON.parse(responseText);
        return { data: errorJson, debugLog };
      } catch (e) {
        return { data: null, debugLog };
      }
    }

    try {
        const result = JSON.parse(responseText);
        debugLog += `API Response: ${JSON.stringify(result, null, 2)}\n`;
        debugLog += '---------------------------\n';
        
        if (result.success) {
            return { data: result.data, debugLog };
        }

        console.error(`API error or unexpected data format from ${endpoint}:`, result.message || result);
        return { data: null, debugLog };

    } catch (jsonError) {
        const errorMessage = `Failed to parse JSON from ${endpoint}. Response text: ${responseText}`;
        console.error(errorMessage, jsonError);
        debugLog += `Error: ${errorMessage}\n`;
        debugLog += '---------------------------\n';
        return { data: null, debugLog };
    }

  } catch (error) {
    debugLog += `Error: ${error}\n`;
    debugLog += '---------------------------\n';
    console.error(`Failed to fetch from ${endpoint}:`, error);
    return { data: null, debugLog };
  }
}


export async function submitApplication(formData: any, token: string | undefined) {
  if (!token) {
    return { success: false, message: 'Authentication token not found.', debugLog: 'submitApplication Error: No auth token provided.' };
  }

  const url = `${API_BASE_URL}/applications`;
  let debugLog = '--- Submitting Application ---\n';
  debugLog += `Request URL: ${url}\n`;
  debugLog += `Request Payload: ${JSON.stringify(formData, null, 2)}\n`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    debugLog += `API Response: ${JSON.stringify(result, null, 2)}\n`;
    debugLog += '---------------------------\n';
    
    if (!response.ok) {
      return { success: false, message: result.message || `HTTP error! status: ${response.status}`, debugLog };
    }

    return { ...result, debugLog };
  } catch (error) {
    debugLog += `Error: ${error}\n`;
    debugLog += '---------------------------\n';
    console.error('submitApplication error:', error);
    return { success: false, message: 'An unexpected error occurred.', debugLog };
  }
}


export async function uploadFile(
  formData: FormData,
  token: string | undefined
) {
  if (!token) {
    return { success: false, message: "Authentication token not found." };
  }

  const url = `${API_BASE_URL}/upload-file`;
  let debugLog = "--- Uploading File ---\n";
  debugLog += `Request URL: ${url}\n`;
  // FormData objects are complex and cannot be directly stringified.
  // We log the keys to give an idea of what's being sent.
  debugLog += `Request Payload (FormData keys): ${JSON.stringify(Array.from(formData.keys()), null, 2)}\n`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: formData,
    });
    
    const result = await response.json();
    debugLog += `API Response: ${JSON.stringify(result, null, 2)}\n`;
    debugLog += "----------------------\n";

    if (!response.ok) {
      return { success: false, message: result.message || `HTTP error! status: ${response.status}`, debugLog };
    }
    
    return { ...result, debugLog };

  } catch (error) {
    debugLog += `Error: ${error}\n`;
    debugLog += "----------------------\n";
    console.error("uploadFile error:", error);
    return { success: false, message: "An unexpected error occurred.", debugLog };
  }
}

// Functions to be called from Server Components
async function fetchDataWithLog(fetcher: (token: string) => Promise<any>, token: string) {
    const { data, debugLog } = await fetcher(token);
    return { data: Array.isArray(data) ? data : [], log: debugLog };
}


export async function getDistricts(token: string) {
    const { data, debugLog } = await fetchFromApi('/district', token);
    return { data: Array.isArray(data) ? data : [], log: debugLog };
}
export async function getCircles(token: string) {
    const { data, debugLog } = await fetchFromApi('/circle', token);
    return { data: Array.isArray(data) ? data : [], log: debugLog };
}
export async function getSubDivisions(token: string) {
    const { data, debugLog } = await fetchFromApi('/sub-division', token);
    return { data: Array.isArray(data) ? data : [], log: debugLog };
}
export async function getVillages(token: string) {
    const { data, debugLog } = await fetchFromApi('/village', token);
    return { data: Array.isArray(data) ? data : [], log: debugLog };
}
export async function getLandPurposes(token: string) {
    const { data, debugLog } = await fetchFromApi('/land-purpose', token);
    return { data: Array.isArray(data) ? data : [], log: debugLog };
}
export async function getLocationTypes(token: string) {
    const { data, debugLog } = await fetchFromApi('/location-type', token);
    return { data: Array.isArray(data) ? data : [], log: debugLog };
}
export async function getAreaUnits(token: string) {
    const { data, debugLog } = await fetchFromApi('/area-unit', token);
    return { data: Array.isArray(data) ? data : [], log: debugLog };
}
export async function getLandClassifications(token: string) {
    const { data, debugLog } = await fetchFromApi('/land-classification', token);
    return { data: Array.isArray(data) ? data : [], log: debugLog };
}
export async function getChangeOfLandUseDates(token: string) {
    const { data, debugLog } = await fetchFromApi('/change-of-land-use', token);
    return { data: Array.isArray(data) ? data : [], log: debugLog };
}

export async function getApplications(page = 1, limit = 10) {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    if (!accessToken) {
      return { data: null, log: "No access token found" };
    }
    const { data, debugLog } = await fetchFromApi(`/applications/lists?page=${page}&limit=${limit}`, accessToken);
    return { data, log: debugLog };
}

export async function getApplicationById(token: string, id: string) {
    const { data, debugLog } = await fetchFromApi(`/applications/view?application_id=${id}`, token);
    // The API now returns a nested object.
    return { data, log: debugLog };
}

    