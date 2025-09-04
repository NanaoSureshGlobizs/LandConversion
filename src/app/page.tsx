
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { citizenSignUp, citizenSendOtp, citizenVerifyOtp } from './actions';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useDebug } from '@/context/DebugContext';

type AuthStep = 'signIn' | 'signUp' | 'verifyOtp';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: isAuthLoading, login } = useAuth();
  const { addLog } = useDebug();
  
  const [step, setStep] = useState<AuthStep>('signIn');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{10}$/.test(phoneNumber)) {
      toast({ title: 'Invalid Phone Number', description: 'Please enter a valid 10-digit phone number.', variant: 'destructive' });
      return;
    }
     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: 'Invalid Email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await citizenSignUp(phoneNumber, email);
      if (result.debugLog) addLog(result.debugLog);
      
      if (result.success) {
        toast({ title: 'Sign Up Successful', description: result.message });
        setStep('verifyOtp');
      } else {
        toast({ title: 'Sign Up Failed', description: result.message || 'Could not create user. Please try again.', variant: 'destructive' });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({ title: 'Error', description: 'An unexpected error occurred during sign up.', variant: 'destructive' });
      addLog(`FE CATCH BLOCK ERROR:\n${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{10}$/.test(phoneNumber)) {
      toast({ title: 'Invalid Phone Number', description: 'Please enter a valid 10-digit phone number.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await citizenSendOtp(phoneNumber);
      if (result.debugLog) addLog(result.debugLog);

      if (result.success) {
        toast({ title: 'OTP Sent', description: result.message });
        setStep('verifyOtp');
      } else {
        toast({ title: 'Error', description: result.message || 'Failed to send OTP. Please try again.', variant: 'destructive' });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
      addLog(`FE CATCH BLOCK ERROR:\n${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      toast({ title: 'Invalid OTP', description: 'Please enter a valid 6-digit OTP.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await citizenVerifyOtp(phoneNumber, otp);
      if (result.debugLog) addLog(result.debugLog);

      if (result.success && result.data) {
        toast({ title: 'Login Successful', description: 'Welcome back! Redirecting...' });
        login(result.data.role, result.data.access);
        router.push('/dashboard');
      } else {
        toast({ title: 'Error', description: result.message || 'Invalid OTP. Please try again.', variant: 'destructive' });
      }
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : String(error);
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
       addLog(`FE CATCH BLOCK ERROR:\n${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const renderFormContent = () => {
    switch(step) {
      case 'signIn':
        return (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
               <div className="flex items-center">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isSubmitting}
                    maxLength={10}
                    className="rounded-r-none"
                  />
                  <Button type="submit" className="rounded-l-none" disabled={isSubmitting} style={{ minWidth: '120px' }}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send OTP'}
                  </Button>
                </div>
            </div>
            <Button variant="link" size="sm" className="w-full text-muted-foreground" onClick={() => setStep('signUp')}>
                Don't have an account? Sign Up
            </Button>
          </form>
        );
      case 'signUp':
        return (
          <form onSubmit={handleSignUp} className="space-y-6">
             <div className="space-y-2">
                <Label htmlFor="phone-signup">Phone Number</Label>
                <Input id="phone-signup" type="tel" placeholder="10-digit mobile number" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={isSubmitting} maxLength={10} />
             </div>
              <div className="space-y-2">
                <Label htmlFor="email-signup">Email Address</Label>
                <Input id="email-signup" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} />
             </div>
             <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign Up'}
            </Button>
            <Button variant="link" size="sm" className="w-full text-muted-foreground" onClick={() => setStep('signIn')}>
                Already have an account? Sign In
            </Button>
          </form>
        );
      case 'verifyOtp':
        return (
           <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <p className="text-center text-sm text-muted-foreground">
                  An OTP has been sent to {phoneNumber}.
                </p>
                <Label htmlFor="otp">Enter OTP</Label>
                 <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={isSubmitting}
                  maxLength={6}
                />
              </div>
               <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify & Sign In
              </Button>
               <Button
                variant="link"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => {
                  setStep('signIn');
                  setOtp('');
                }}
                disabled={isSubmitting}
              >
                Use a different phone number
              </Button>
            </form>
        );
    }
  }

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gray-50 p-4">
      <div className="absolute -top-1/4 left-0 -z-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-1/4 right-0 -z-0 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex justify-center">
              <Image src="/image/kanglasha.png" alt="Kanglasha Logo" width={64} height={64} />
            </div>
            <h1 className="text-2xl font-bold font-headline text-foreground">
              Citizen Login
            </h1>
            <p className="text-muted-foreground">
              Revenue Department, Government of Manipur
            </p>
          </div>
            {renderFormContent()}
        </div>
        <div className="absolute bottom-4 text-center text-xs text-muted-foreground">
            <p>An initiative by the Government of Manipur.</p>
        </div>
      </main>
  );
}
