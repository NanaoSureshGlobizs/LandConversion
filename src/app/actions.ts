'use server';

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
  try {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ username }),
    });

    const data = await response.json();

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
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ username, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
       return { success: false, message: data.message || `HTTP error! status: ${response.status}`, data: null };
    }

    return data as VerifyOtpResponse;
  } catch (error) {
    console.error('verifyOtp error:', error);
    return { success: false, message: 'An unexpected error occurred.', data: null };
  }
}
