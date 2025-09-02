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
