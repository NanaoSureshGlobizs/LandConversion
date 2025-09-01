'use server';

import { cookies } from 'next/headers';

interface SendOtpResponse {
  success: boolean;
  message?: string;
  data: null;
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
}

const API_BASE_URL = 'https://villageapi.globizsapp.com/api';

export async function sendOtp(username: string): Promise<SendOtpResponse> {
  const url = `${API_BASE_URL}/auth/send-otp`;
  const payload = { username };
  console.log('--- Sending OTP ---');
  console.log('Request URL:', url);
  console.log('Request Payload:', payload);

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
    console.log('API Response:', data);
    console.log('-------------------');


    if (!response.ok) {
      return { success: false, message: data.message || `HTTP error! status: ${response.status}`, data: null };
    }

    return data as SendOtpResponse;
  } catch (error) {
    console.error('sendOtp error:', error);
    return { success: false, message: 'An unexpected error occurred.', data: null };
  }
}

export async function verifyOtp(username: string, otp: string): Promise<VerifyOtpResponse> {
  const url = `${API_BASE_URL}/auth/verify-otp`;
  const payload = { username, otp };
  console.log('--- Verifying OTP ---');
  console.log('Request URL:', url);
  console.log('Request Payload:', payload);

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
    console.log('API Response:', data);
    console.log('---------------------');

    if (!response.ok) {
       return { success: false, message: data.message || `HTTP error! status: ${response.status}`, data: null };
    }

    if (data.success && data.data?.accessToken) {
      cookies().set('accessToken', data.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      // After successful login and cookie set, we will rely on middleware for redirection.
      // A page reload on the client might be necessary if direct navigation doesn't work.
    }

    return data as VerifyOtpResponse;
  } catch (error) {
    console.error('verifyOtp error:', error);
    return { success: false, message: 'An unexpected error occurred.', data: null };
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
