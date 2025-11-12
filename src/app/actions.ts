

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


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://conversionapi.globizsapp.com/api';

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
    debugLog += `Error: ${error}\n-------------------`;
    return { success: false, message: 'An unexpected error occurred.', data: null, debugLog };
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
    debugLog += `Error: ${error}\n-------------------`;
    return { success: false, message: 'An unexpected error occurred.', data: null, debugLog };
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
    debugLog += `Error: ${error}\n-------------------`;
    return { success: false, message: 'An unexpected error occurred.', data: null, debugLog };
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
  
  if (!accessToken?.value) {
    return { isAuthenticated: false, role: null, access: [], userId: null };
  }
  
  const role = cookieStore.get('userRole');
  const accessCookie = cookieStore.get('userAccess');
  const userId = cookieStore.get('userId');

  try {
    const access = accessCookie ? JSON.parse(accessCookie.value) : [];
    return { 
      isAuthenticated: true, 
      role: role?.value || null, 
      access: access,
      userId: userId?.value || null
    };
  } catch (error) {
    addLog(`Failed to parse user access cookie: ${error}`);
    // Fallback to authenticated state with empty access if parsing fails
    return { isAuthenticated: true, role: role?.value || null, access: [], userId: userId?.value || null };
  }
}


async function fetchFromApi(endpoint: string, token: string | undefined) {
  const url = `${API_BASE_URL}${endpoint}`;
  let debugLog = '--- Fetching from API ---\n';
  debugLog += `Request URL: GET ${url}\n`;


  if (!token) {
    debugLog += `Authentication token not found for endpoint: ${endpoint}\n`;
    debugLog += '---------------------------\n';
    addLog(`Authentication token not found for endpoint: ${endpoint}`);
    return { data: null, debugLog };
  }

  const headers = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  debugLog += `Headers: ${JSON.stringify(headers, null, 2)}\n`;


  try {
    const response = await fetch(url, { headers });
    
    const responseText = await response.text();

    if (!response.ok) {
      const errorMessage = `HTTP error! status: ${response.status} for endpoint: ${endpoint}. Body: ${responseText}`;
      addLog(errorMessage);
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
            // The workflow API has a nested data object, so we handle that here.
            if (result.data && typeof result.data.success !== 'undefined') {
                 if (result.data.data) {
                    return { data: result.data.data, debugLog };
                 }
                 // Handle cases where the nested call was successful but returned no data
                 return { data: result.data, debugLog };
            }
            return { data: result.data, debugLog };
        }

        addLog(`API error or unexpected data format from ${endpoint}: ${result.message || result}`);
        return { data: null, debugLog };

    } catch (jsonError) {
        const errorMessage = `Failed to parse JSON from ${endpoint}. Response text: ${responseText}`;
        addLog(`${errorMessage}, ${jsonError}`);
        debugLog += `Error: ${errorMessage}\n`;
        debugLog += '---------------------------\n';
        return { data: null, debugLog };
    }

  } catch (error) {
    debugLog += `Error: ${error}\n`;
    debugLog += '---------------------------\n';
    addLog(`Failed to fetch from ${endpoint}: ${error}`);
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
    
    // Pass the new application ID back to the client
    const application_id = result.data?.application_id || null;

    return { ...result, data: { application_id }, debugLog };
  } catch (error) {
    debugLog += `Error: ${error}\n`;
    debugLog += '---------------------------\n';
    addLog(`submitApplication error: ${error}`);
    return { success: false, message: 'An unexpected error occurred.', data: null, debugLog };
  }
}

export async function submitHillApplication(formData: any, token: string | undefined) {
  if (!token) {
    return { success: false, message: 'Authentication token not found.', data: null, debugLog: 'submitHillApplication Error: No auth token provided.' };
  }

  const url = `${API_BASE_URL}/land-details-for-hill/create`;
  let debugLog = '--- Submitting Hill Area Application ---\n';
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
    
    // Pass the new application ID back to the client
    const application_id = result.data?.id || null;

    return { ...result, data: { application_id }, debugLog };
  } catch (error) {
    debugLog += `Error: ${error}\n`;
    debugLog += '---------------------------\n';
    addLog(`submitHillApplication error: ${error}`);
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
    addLog(`uploadFile error: ${error}`);
    return { success: false, message: "An unexpected error occurred during file upload.", data: null, debugLog };
  }
}


export async function submitSurveyReport(payload: any, token: string | undefined) {
  if (!token) {
    return { success: false, message: 'Authentication token not found.', debugLog: 'submitSurveyReport Error: No auth token provided.' };
  }

  const url = `${API_BASE_URL}/workflow`;
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
    addLog(`submitSurveyReport error: ${error}`);
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
    addLog(`forwardApplication error: ${error}`);
    return { success: false, message: 'An unexpected error occurred.', debugLog };
  }
}


export async function forwardMultipleApplications(payload: any, token: string | undefined) {
  if (!token) {
    return { success: false, message: 'Authentication token not found.', debugLog: 'forwardMultipleApplications Error: No auth token provided.' };
  }

  const url = `${API_BASE_URL}/workflow/create-multiple`;
  let debugLog = '--- Forwarding Multiple Applications ---\n';
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
    addLog(`forwardMultipleApplications error: ${error}`);
    return { success: false, message: 'An unexpected error occurred.', debugLog };
  }
}

export async function submitMarsacReport(payload: any, token: string | undefined) {
  if (!token) {
    return { success: false, message: 'Authentication token not found.', debugLog: 'submitMarsacReport Error: No auth token provided.' };
  }

  const url = `${API_BASE_URL}/marsac-entry`;
  let debugLog = '--- Submitting MARSAC Report ---\n';
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
    addLog(`submitMarsacReport error: ${error}`);
    return { success: false, message: 'An unexpected error occurred.', debugLog };
  }
}


export async function requestReverification(payload: any, token: string | undefined) {
  if (!token) {
    return { success: false, message: 'Authentication token not found.', debugLog: 'requestReverification Error: No auth token provided.' };
  }

  const url = `${API_BASE_URL}/workflow/reverify`;
  let debugLog = '--- Requesting Reverification ---\n';
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

    // The API wraps the actual success message in a nested 'data' object.
    if (result.success && result.data?.success) {
      return { ...result.data, debugLog };
    }

    return { ...result, debugLog };
  } catch (error) {
    debugLog += `Error: ${error}\n`;
    debugLog += '----------------------------\n';
    addLog(`requestReverification error: ${error}`);
    return { success: false, message: 'An unexpected error occurred.', debugLog };
  }
}


// --- LEGACY DATA ACTIONS ---
export async function getLegacyData(accessToken: string, page = 1, limit = 10) {
    if (!accessToken) {
      return { data: null, log: "No access token found" };
    }
    let url = `/legacy/list?page=${page}&limit=${limit}`;
    const { data, debugLog } = await fetchFromApi(url, accessToken);
    return { data, log: debugLog };
}

export async function getLegacyDataById(token: string, id: string) {
    const { data, debugLog } = await fetchFromApi(`/legacy/${id}`, token);
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
    addLog(`submitLegacyData error: ${error}`);
    return { success: false, message: 'An unexpected error occurred.', debugLog };
  }
}

// --- USER MANAGEMENT ACTIONS ---
export async function getUsers(token: string) {
    const { data, debugLog } = await fetchFromApi('/profile', token);
    return { data: Array.isArray(data) ? data : [], log: debugLog };
}

export async function createUser(payload: any, token: string | undefined) {
  if (!token) {
    return { success: false, message: 'Authentication token not found.', debugLog: 'createUser Error: No auth token provided.' };
  }

  const url = `${API_BASE_URL}/profile`;
  let debugLog = '--- Creating User ---\n';
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
    debugLog += '---------------------\n';
    
    if (!response.ok) {
      return { success: false, message: result.message || `HTTP error! status: ${response.status}`, debugLog };
    }

    return { ...result, debugLog };
  } catch (error) {
    debugLog += `Error: ${error}\n`;
    debugLog += '---------------------\n';
    addLog(`createUser error: ${error}`);
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
export async function getDistrictsByLandType(token: string, landType: 'hill' | 'valley') {
    const endpoint = `/district/get-by-land-type-for-${landType}`;
    const { data, debugLog } = await fetchFromApi(endpoint, token);
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

    const hillWorkflowIds = [63, 64, 65, 66, 67, 68, 69];
    const isHillWorkflow = workflow_sequence_id !== null && hillWorkflowIds.includes(workflow_sequence_id);

    let url;
    if (workflow_sequence_id) {
        if (isHillWorkflow) {
            url = `/applications/lists_for_hills?page=${page}&limit=${limit}&workflow_sequence_id=${workflow_sequence_id}`;
        } else {
            url = `/applications/lists?page=${page}&limit=${limit}&workflow_sequence_id=${workflow_sequence_id}`;
        }
    } else {
        // This is for the "My Applications" page specifically
        url = `/applications/lists-combined?page=${page}&limit=${limit}`;
    }
    
    const { data, debugLog } = await fetchFromApi(url, accessToken);

    // Normalize hill application data to have consistent property names
    if (data && isHillWorkflow && Array.isArray(data.applications)) {
        const applications = data.applications.map((item: any) => ({
                ...item,
                district_name: item.district?.name || item.district_name || 'N/A',
                sub_division_name: item.sub_division?.name || item.sub_division_name || 'N/A',
                status_name: item.application_status?.name || item.status_name || 'N/A',
            }));

        return {
            data: {
                ...data,
                applications: applications,
            },
            log: debugLog,
        };
    }
    
    // For lists-combined, the data is already in the correct format under `data`
    if (!workflow_sequence_id && data) {
        return { data, log: debugLog };
    }


    // This handles the standard response structure for most lists
    if (data && (data.conversion_applications || data.diversion_applications)) {
        let conversionApps: any[] = [];
        if (data.conversion_applications) {
            conversionApps = Array.isArray(data.conversion_applications) 
                ? data.conversion_applications 
                : Object.values(data.conversion_applications).filter((item: any): item is object => typeof item === 'object' && item !== null && 'id' in item);
        }

        let diversionApps: any[] = [];
        if (data.diversion_applications) {
             diversionApps = Array.isArray(data.diversion_applications) 
                ? data.diversion_applications 
                : Object.values(data.diversion_applications).filter((item: any): item is object => typeof item === 'object' && item !== null && 'id' in item);
        }

        const allApps = [...conversionApps, ...diversionApps];

        return { 
            data: {
                applications: allApps,
                pagination: data.pagination
            }, 
            log: debugLog 
        };
    }
    
    // This handles the specific nested structure seen for workflow_sequence_id=2 and the main list
    if (data && data['0'] && (data['0'].conversion_applications || data['0'].diversion_applications)) {
        const appsData = data['0'];
        let conversionApps: any[] = [];
        if (appsData.conversion_applications) {
            conversionApps = Array.isArray(appsData.conversion_applications) 
                ? appsData.conversion_applications
                : Object.values(appsData.conversion_applications).filter((item: any): item is object => typeof item === 'object' && item !== null && 'id' in item);
        }

        let diversionApps: any[] = [];
        if (appsData.diversion_applications) {
            diversionApps = Array.isArray(appsData.diversion_applications)
                ? appsData.diversion_applications
                : Object.values(appsData.diversion_applications).filter((item: any): item is object => typeof item === 'object' && item !== null && 'id' in item);
        }
        
        const allApps = [...conversionApps, ...diversionApps];

        return { 
            data: {
                applications: allApps,
                pagination: data.pagination
            }, 
            log: debugLog 
        };
    }
    
    return { data, log: debugLog };
}

export async function getOtherApplications(accessToken: string, page = 1, limit = 10, workflow_sequence_id: number | null = null) {
    if (!accessToken) {
      return { data: null, log: "No access token found" };
    }
    let url = `/applications/other_lists?page=${page}&limit=${limit}`;

    if(workflow_sequence_id) {
        url += `&workflow_sequence_id=${workflow_sequence_id}`;
    }

    const { data, debugLog } = await fetchFromApi(url, accessToken);

    if (data && data['0']) {
        const appsData = data['0'];
        let conversionApps: any[] = [];
        if (appsData.conversion_applications && typeof appsData.conversion_applications === 'object') {
            conversionApps = Object.values(appsData.conversion_applications).filter((item: any): item is object => typeof item === 'object' && item !== null && 'id' in item);
        }

        let diversionApps: any[] = [];
        if (appsData.diversion_applications && typeof appsData.diversion_applications === 'object') {
            diversionApps = Object.values(appsData.diversion_applications).filter((item: any): item is object => typeof item === 'object' && item !== null && 'id' in item);
        }
        
        const allApps = [...conversionApps, ...diversionApps];

        return { 
            data: {
                applications: allApps,
                pagination: data.pagination
            }, 
            log: debugLog 
        };
    }
    
    return { data, log: debugLog };
}


export async function getHillApplications(accessToken: string, page = 1, limit = 10) {
    if (!accessToken) {
      return { data: null, log: "No access token found" };
    }
    const url = `/applications/lists_for_hills?page=${page}&limit=${limit}`;
    const { data, debugLog } = await fetchFromApi(url, accessToken);

    if (data && data['0']) {
        const applications = data['0'];
        const pagination = data.pagination;
        return {
            data: {
                applications: Array.isArray(applications) ? applications : [],
                pagination,
            },
            log: debugLog,
        };
    }
    
    return { data: null, log: debugLog };
}

export async function getLlmcApplications(accessToken: string, page = 1, limit = 10) {
    if (!accessToken) {
      return { data: null, log: "No access token found" };
    }
    const url = `/applications/llmc_lists?page=${page}&limit=${limit}`;
    const { data, debugLog } = await fetchFromApi(url, accessToken);
    if (data && (data.conversion_applications || data.diversion_applications)) {
        const conversionApps = data.conversion_applications || [];
        const diversionApps = data.diversion_applications || [];
        const allApps = [...conversionApps, ...diversionApps];
        return { 
            data: {
                applications: allApps,
                pagination: data.pagination
            }, 
            log: debugLog 
        };
    }
    return { data, log: debugLog };
}

export async function getApplicationsByArea(accessToken: string, areaType: 'lesser' | 'greater' | 'all', page = 1, limit = 10) {
    if (!accessToken) {
        return { data: null, log: "No access token found" };
    }

    let allApps: any[] = [];
    let combinedPagination = null;
    let combinedLogs = '';

    const fetchAndCombine = async (type: 'lesser' | 'greater') => {
        const url = `/area/${type}?page=${page}&limit=${limit}`;
        const { data, debugLog } = await fetchFromApi(url, accessToken);
        combinedLogs += debugLog || '';

        if (data && (data.conversion_applications || data.diversion_applications)) {
            const conversionApps = data.conversion_applications || [];
            const diversionApps = data.diversion_applications || [];
            allApps = [...allApps, ...conversionApps, ...diversionApps];

            if (!combinedPagination) {
                combinedPagination = data.pagination;
            } else {
                // This is a simplified pagination merge. A real implementation might need more complex logic.
                combinedPagination.totalCount += data.pagination.totalCount;
                combinedPagination.pageCount = Math.max(combinedPagination.pageCount, data.pagination.pageCount);
            }
        }
    };

    if (areaType === 'all') {
        await fetchAndCombine('lesser');
        await fetchAndCombine('greater');
    } else {
        await fetchAndCombine(areaType);
    }

    if (allApps.length > 0) {
        return {
            data: {
                applications: allApps,
                pagination: combinedPagination,
            },
            log: combinedLogs,
        };
    }

    return { data: null, log: combinedLogs };
}


export async function getApplicationById(token: string, id: string, workflow_sequence_id?: string | null, isOther: boolean = false) {
    const hillWorkflowIds = [63, 64, 65, 66, 67, 68, 69];
    const isHillWorkflow = workflow_sequence_id !== null && workflow_sequence_id !== undefined && hillWorkflowIds.includes(parseInt(workflow_sequence_id));

    let url: string;
    if (isOther) {
        url = `/applications/other_lists_view?id=${id}`;
    } else if (isHillWorkflow) {
        url = `/land-details-for-hill/view?id=${id}`;
    } else {
        url = `/applications/view?id=${id}&workflow_sequence_id=${workflow_sequence_id ?? ''}`;
    }
    
    const { data, debugLog } = await fetchFromApi(url, token);
    
    // Handle the specific structure for a single hill application view
    if (isHillWorkflow && data && data['0']) {
        const hillData = data['0'];
        const standardizedData = {
            id: hillData.application_id, // Use application_id as the primary ID
            application_no: hillData.application_no,
            applicant_name: hillData.applicant_name,
            phone_number: hillData.applicant_phone,
            email: hillData.applicant_email,
            address: hillData.applicant_address,
            aadhar_no: hillData.applicant_aadhar_no,
            date_of_birth: hillData.applicant_dob,
            area_applied_for_conversion: hillData.area_applied_for_conversion,
            application_area_unit_name: hillData.application_area_unit_name,
            original_area_of_plot: hillData.original_area_of_plot,
            land_area_unit_name: hillData.land_area_unit_name,
            land_address: hillData.land_address,
            form_type: hillData.form_type,
            button_name: hillData.button_name,
            can_forward: hillData.can_forward,
            highlight: hillData.highlight,
            can_edit: hillData.can_edit,
            created_at: hillData.created_at,
            application_status: hillData.application_status,
            district: hillData.district,
            sub_division: hillData.sub_division,
            upload_files: data.upload_files || [],

            // Add the type flag for the client
            application_type: 'hill',

            // Fields not present in hill response, providing default/null values
            applicant_details_id: hillData.application_details_id,
            land_purpose_id: hillData.purpose_id || 1, // Defaulting as it's missing
            change_of_land_use_id: hillData.change_of_land_use_id,
            application_area_unit_id: hillData.application_area_unit_id || 1, // Defaulting
            purpose_id: hillData.purpose_id || 1, // Defaulting
            patta_no: 'N/A',
            dag_no: 'N/A',
            sheet_no: null,
            land_area_unit_id: hillData.land_area_unit_id || 1, // Defaulting
            location_type_id: 0, 
            location_name: 'N/A', 
            land_classification_id: 0,
            land_classification: 'N/A', 
            circle_id: 0, 
            circle_name: 'N/A', 
            village_id: 0, 
            village_name: 'N/A', 
        };
        return { data: standardizedData, log: debugLog };
    }
    
    if (data && (data.conversion_applications || data.diversion_applications)) {
        let applicationData = null;
        if (data.conversion_applications && Array.isArray(data.conversion_applications) && data.conversion_applications.length > 0) {
            applicationData = data.conversion_applications[0];
        } else if (data.diversion_applications && Array.isArray(data.diversion_applications) && data.diversion_applications.length > 0) {
            applicationData = data.diversion_applications[0];
        } else if (data.conversion_applications && typeof data.conversion_applications === 'object' && Object.keys(data.conversion_applications).length > 0) {
            applicationData = Object.values(data.conversion_applications).find(
                (item: any): item is object => typeof item === 'object' && item !== null && 'id' in item
            );
        } else if (data.diversion_applications && typeof data.diversion_applications === 'object' && Object.keys(data.diversion_applications).length > 0) {
            applicationData = Object.values(data.diversion_applications).find(
                (item: any): item is object => typeof item === 'object' && item !== null && 'id' in item
            );
        }
        
        if (applicationData) {
            (applicationData as any).upload_files = data.upload_files || [];
            return { data: applicationData, log: debugLog };
        }
    }
    
    return { data, log: debugLog };
}

export async function getApplicationWorkflow(token: string, id: string, isHillApplication: boolean = false) {
    if (!token) {
      return { data: null, log: "No access token found" };
    }
    const url = isHillApplication
        ? `/applications/workflows-for-hills?id=${id}`
        : `/applications/workflows?id=${id}`;
    
    const { data, debugLog } = await fetchFromApi(url, token);
    return { data, log: debugLog };
}

export async function getDashboardStats(token: string) {
    const { data, debugLog } = await fetchFromApi(`/workflow/pending-with-me`, token);
    return { data, log: debugLog };
}

// --- FEE ACTIONS ---

export async function getFeeActualAmount(applicationId: string, token: string) {
    const url = `/fee-payment/actual_amount?application_id=${applicationId}`;
    const { data, debugLog } = await fetchFromApi(url, token);
    return { data, log: debugLog };
}

export async function overwriteFeeAmount(applicationId: string, amount: number, token: string) {
  const url = `${API_BASE_URL}/fee-payment/overwrite_amount?application_id=${applicationId}`;
  const payload = { overwrite_fees: amount };
  let debugLog = '--- Overwriting Fee Amount ---\n';
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
    addLog(`overwriteFeeAmount error: ${error}`);
    return { success: false, message: 'An unexpected error occurred.', debugLog };
  }
}


export async function getSurveyQuestions(itemName: string, purposeType: number, workSequenceId: number, token: string) {
    const endpoint = `/survey/common-survey-details?item_name=${itemName}&purpose_type=${purposeType}&work_sequence_id=${workSequenceId}`;
    const { data, debugLog } = await fetchFromApi(endpoint, token);
    return { data, log: debugLog };
}


function addLog(log: string) {
  // This is a placeholder for a real logging implementation.
  // In a real app, this would send logs to a logging service.
  if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true' && process.env.NODE_ENV === 'development') {
    console.log(log);
  }
}
    

    

    











    

    



    


    



    











  

    

    




    


    

    

      









    

    

    