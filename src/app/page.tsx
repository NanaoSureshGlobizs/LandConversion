"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { sendOtp, verifyOtp } from './actions';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{10}$/.test(phoneNumber)) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid 10-digit phone number.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await sendOtp(phoneNumber);
      if (result.success) {
        toast({
          title: 'OTP Sent',
          description: result.message,
        });
        setStep('verify');
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to send OTP. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter a valid 6-digit OTP.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await verifyOtp(phoneNumber, otp);
      if (result.success && result.data?.accessToken) {
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        });
        // In a real app, you would store the token securely.
        router.push('/dashboard');
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Invalid OTP. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex flex-col items-center justify-center gap-2">
            <span className="text-2xl font-bold font-headline text-foreground">
              Change of Land Use
            </span>
            <span className="text-sm text-muted-foreground">
              Government of Manipur
            </span>
          </div>
          <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
          <CardDescription>
            {step === 'send'
              ? 'Enter your phone number to receive a login OTP.'
              : `Enter the OTP sent to ${phoneNumber}.`}
          </CardDescription>
        </CardHeader>
        {step === 'send' ? (
          <form onSubmit={handleSendOtp}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9999999999"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send OTP
              </Button>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={isLoading}
                  maxLength={6}
                />
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify OTP & Sign In
              </Button>
              <Button
                variant="link"
                size="sm"
                className="text-muted-foreground"
                onClick={() => {
                  setStep('send');
                  setOtp('');
                }}
                disabled={isLoading}
              >
                Use a different phone number
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
