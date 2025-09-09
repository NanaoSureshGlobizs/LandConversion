

'use server';

import { cookies } from 'next/headers';
import * as jose from 'jose';

interface BaseApiResponse {
  success: boolean;
  message?: string;
  debugLog?: string;
}

interface SendOtpResponse extends BaseApiResponse {
  data: null;
}

interface VerifyOtpData {
  accessToken: string;
  refreshToken: string;
  role: string;
  access: string[];
}

interface VerifyOtpResponse extends BaseApiResponse {
  data: VerifyOtpData | null;
}

interface SignUpResponse extends BaseApiResponse {
    data: null;
}


const API_BASE_URL = 'https://conversionapi.globizsapp.com/api';

// --- CITIZEN ACTIONS ---

export async function citizenSignUp(username: string, email: string): Promise<SignUpResponse> {
  const url = `${API_BASE_URL}/citizen/sign-up`;
  const payload = { username, email };
  let debugLog = '--- Citizen Sign Up ---\n';
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
    
    return { ...data, debugLog };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    addLog(`FE CATCH BLOCK ERROR:\n${errorMessage}`);
    return { success: false, message: 'An unexpected error occurred.', data: null, debugLog: `Error: ${error}\n-------------------` };
  }
}

export async function citizenSendOtp(username: string): Promise<SendOtpResponse> {
  const url = `${API_BASE_URL}/citizen/send-otp`;
  const payload = { username };
  let debugLog = '--- Citizen Sending OTP ---\n';
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

    return { ...data, debugLog };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    addLog(`FE CATCH BLOCK ERROR:\n${errorMessage}`);
    return { success: false, message: 'An unexpected error occurred.', data: null, debugLog: `Error: ${error}\n-------------------` };
  }
}

export async function citizenVerifyOtp(username: string, otp: string): Promise<VerifyOtpResponse> {
  const url = `${API_BASE_URL}/citizen/verify-otp`;
  const payload = { username, otp_code: otp };
  return await handleOtpVerification(url, payload, 'Citizen');
}


// --- ADMIN/STAFF ACTIONS ---

export async function sendOtp(username: string): Promise<SendOtpResponse> {
  const url = `${API_BASE_URL}/auth/send-otp`;
  const payload = { username };
  let debugLog = '--- Admin/Staff Sending OTP ---\n';
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    addLog(`FE CATCH BLOCK ERROR:\n${errorMessage}`);
    return { success: false, message: 'An unexpected error occurred.', data: null, debugLog: `Error: ${error}\n-------------------` };
  }
}

export async function verifyOtp(username: string, otp: string): Promise<VerifyOtpResponse> {
  const url = `${API_BASE_URL}/auth/verify-otp`;
  const payload = { username, otp_code: otp };
  return await handleOtpVerification(url, payload, 'Admin/Staff');
}


// --- SHARED & GENERIC ACTIONS ---

async function handleOtpVerification(url: string, payload: { username: string; otp_code: string }, userType: 'Admin/Staff' | 'Citizen'): Promise<VerifyOtpResponse> {
    let debugLog = `--- Verifying OTP (${userType}) ---\n`;
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
        
        if (!response.ok) {
            debugLog += '---------------------\n';
            return { success: false, message: data.message || `HTTP error! status: ${response.status}`, data: null, debugLog };
        }

        if (data.success && data.data?.accessToken) {
            const decodedToken = jose.decodeJwt(data.data.accessToken);
            debugLog += `Decoded JWT: ${JSON.stringify(decodedToken, null, 2)}\n`;

            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax' as const,
                path: '/',
            };
            cookies().set('accessToken', data.data.accessToken, cookieOptions);
            cookies().set('userRole', data.data.role, cookieOptions);
            cookies().set('userAccess', JSON.stringify(data.data.access), cookieOptions);
            if (decodedToken.sub) {
                cookies().set('userId', decodedToken.sub.toString(), cookieOptions);
            }
        }
        
        debugLog += '---------------------\n';
        const responseData = data as VerifyOtpResponse;
        responseData.debugLog = debugLog;
        return responseData;

    } catch (error) {
        debugLog += `Error: ${error}\n`;
        debugLog += '---------------------\n';
        const errorMessage = error instanceof Error ? error.message : String(error);
        addLog(`FE CATCH BLOCK ERROR:\n${errorMessage}`);
        return { success: false, message: 'An unexpected error occurred.', data: null, debugLog };
    }
}


export async function logout() {
  cookies().delete('accessToken');
  cookies().delete('userRole');
  cookies().delete('userAccess');
  cookies().delete('userId');
}

export async function checkAuth() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken');
  const role = cookieStore.get('userRole');
  const access = cookieStore.get('userAccess');
  const userId = cookieStore.get('userId');
  
  if (!accessToken?.value) {
    return { isAuthenticated: false, role: null, access: [], userId: null };
  }
  
  try {
    const accessArray = access ? JSON.parse(access.value) : [];
    return { 
      isAuthenticated: true, 
      role: role?.value || null, 
      access: accessArray,
      userId: userId?.value || null
    };
  } catch (error) {
    console.error("Failed to parse user access cookie:", error);
    return { isAuthenticated: true, role: role?.value || null, access: [], userId: userId?.value || null };
  }
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
      return { data: null, debugLog };
    }

    if (!responseText) {
        debugLog += 'API returned an empty response.\n';
        debugLog += '---------------------------\n';
        return { data: null, debugLog };
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
    return { success: false, message: 'Authentication token not found.', data: null, debugLog: 'submitApplication Error: No auth token provided.' };
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
      return { success: false, message: result.message || `HTTP error! status: ${response.status}`, data: null, debugLog };
    }

    return { ...result, debugLog };
  } catch (error) {
    debugLog += `Error: ${error}\n`;
    debugLog += '---------------------------\n';
    console.error('submitApplication error:', error);
    return { success: false, message: 'An unexpected error occurred.', data: null, debugLog };
  }
}


export async function uploadFile(
  formData: FormData,
  token: string | undefined
) {
  let debugLog = "--- Uploading File ---\n";
  try {
    if (!token) {
      throw new Error("Authentication token not found.");
    }

    const url = `${API_BASE_URL}/upload-file`;
    debugLog += `Request URL: ${url}\n`;
    debugLog += `Request Payload (FormData keys): ${JSON.stringify(Array.from(formData.keys()), null, 2)}\n`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: formData,
    });
    
    const responseText = await response.text();
    debugLog += `Raw API Response: ${responseText}\n`;

    if (!response.ok) {
      const message = `File upload failed with status: ${response.status}. Response: ${responseText}`;
      debugLog += `Error: ${message}\n----------------------\n`;
      // Try to parse error message from API if it's JSON, otherwise use the raw text.
      try {
        const errorJson = JSON.parse(responseText);
        return { success: false, message: errorJson.message || message, data: null, debugLog };
      } catch {
        return { success: false, message, data: null, debugLog };
      }
    }

    try {
      const result = JSON.parse(responseText);
      debugLog += `Parsed API Response: ${JSON.stringify(result, null, 2)}\n`;
      debugLog += "----------------------\n";
      // Ensure the returned object has the 'success' property.
      if (typeof result.success === 'undefined') {
          // If 'success' is missing, we assume it failed to prevent downstream errors.
          return { success: false, message: 'API response is missing the "success" field.', data: result.data || null, debugLog };
      }
      return { ...result, debugLog };
    } catch (error) {
        const message = `Failed to parse JSON response from file upload. Raw response: ${responseText}`;
        debugLog += `Error: ${message}\n----------------------\n`;
        return { success: false, message, data: null, debugLog };
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    debugLog += `File Upload Catch Block Error: ${errorMessage}\n`;
    debugLog += "----------------------\n";
    console.error("uploadFile error:", error);
    return { success: false, message: "An unexpected error occurred during file upload.", data: null, debugLog };
  }
}


export async function submitSurveyReport(payload: any, token: string | undefined) {
  if (!token) {
    return { success: false, message: 'Authentication token not found.', debugLog: 'submitSurveyReport Error: No auth token provided.' };
  }

  const url = `${API_BASE_URL}/department-survey-record`;
  let debugLog = '--- Submitting Survey Report ---\n';
  debugLog += `Request URL: ${url}\n`;
  debugLog += `Request Payload: ${JSON.stringify(payload, null, 2)}\n`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    debugLog += `API Response: ${JSON.stringify(result, null, 2)}\n`;
    debugLog += '----------------------------\n';
    
    if (!response.ok) {
      return { success: false, message: result.message || `HTTP error! status: ${response.status}`, debugLog };
    }

    return { ...result, debugLog };
  } catch (error) {
    debugLog += `Error: ${error}\n`;
    debugLog += '----------------------------\n';
    console.error('submitSurveyReport error:', error);
    return { success: false, message: 'An unexpected error occurred.', debugLog };
  }
}

export async function forwardApplication(payload: any, token: string | undefined) {
  if (!token) {
    return { success: false, message: 'Authentication token not found.', debugLog: 'forwardApplication Error: No auth token provided.' };
  }

  const url = `${API_BASE_URL}/workflow`;
  let debugLog = '--- Forwarding Application ---\n';
  debugLog += `Request URL: ${url}\n`;
  debugLog += `Request Payload: ${JSON.stringify(payload, null, 2)}\n`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    debugLog += `API Response: ${JSON.stringify(result, null, 2)}\n`;
    debugLog += '----------------------------\n';
    
    if (!response.ok) {
      return { success: false, message: result.message || `HTTP error! status: ${response.status}`, debugLog };
    }

    return { ...result, debugLog };
  } catch (error) {
    debugLog += `Error: ${error}\n`;
    debugLog += '----------------------------\n';
    console.error('forwardApplication error:', error);
    return { success: false, message: 'An unexpected error occurred.', debugLog };
  }
}


// --- LEGACY DATA ACTIONS ---
export async function getLegacyData(accessToken: string, page = 1, limit = 10) {
    if (!accessToken) {
      return { data: null, log: "No access token found" };
    }
    let url = `/legacy-data?page=${page}&limit=${limit}`;
    const { data, debugLog } = await fetchFromApi(url, accessToken);
    return { data, log: debugLog };
}

export async function submitLegacyData(payload: any, token: string | undefined) {
  if (!token) {
    return { success: false, message: 'Authentication token not found.', debugLog: 'submitLegacyData Error: No auth token provided.' };
  }

  const url = `${API_BASE_URL}/legacy`;
  let debugLog = '--- Submitting Legacy Data ---\n';
  debugLog += `Request URL: ${url}\n`;
  debugLog += `Request Payload: ${JSON.stringify(payload, null, 2)}\n`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
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
    console.error('submitLegacyData error:', error);
    return { success: false, message: 'An unexpected error occurred.', debugLog };
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
export async function getPurposes(token: string) {
    const { data, debugLog } = await fetchFromApi('/purpose', token);
    return { data: Array.isArray(data) ? data : [], log: debugLog };
}
export async function getApplicationStatuses(token: string) {
    const { data, debugLog } = await fetchFromApi('/application-status', token);
    return { data: Array.isArray(data) ? data : [], log: debugLog };
}

export async function getRelationships(token: string) {
    const { data, debugLog } = await fetchFromApi('/relationship', token);
    return { data: Array.isArray(data) ? data : [], log: debugLog };
}

export async function getApplications(accessToken: string, page = 1, limit = 10, workflow_sequence_id: number | null = null) {
    if (!accessToken) {
      return { data: null, log: "No access token found" };
    }
    let url = `/applications/lists?page=${page}&limit=${limit}`;
    if(workflow_sequence_id) {
        url += `&workflow_sequence_id=${workflow_sequence_id}`;
    }
    const { data, debugLog } = await fetchFromApi(url, accessToken);
    return { data, log: debugLog };
}

export async function getApplicationById(token: string, id: string) {
    const { data, debugLog } = await fetchFromApi(`/applications/${id}`, token);
    return { data, log: debugLog };
}

export async function getDashboardStats(token: string) {
    const { data, debugLog } = await fetchFromApi(`/workflow/pending-with-me`, token);
    return { data, log: debugLog };
}

function addLog(log: string) {
  // This is a placeholder for a real logging implementation.
  // In a real app, this would send logs to a logging service.
  console.log(log);
}
    

    

    











    

    

