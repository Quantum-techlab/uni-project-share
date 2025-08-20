import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Mail, Shield, CheckCircle, KeyRound } from 'lucide-react';
import { useServerAuth as useAuth } from '@/hooks/useServerAuth';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const { user, signInWithOTP, verifyOTP } = useAuth();

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await signInWithOTP(email);
    if (!result.error) {
      setStep('otp');
    }
    setIsLoading(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await verifyOTP(email, otp);
    if (!result.error) {
      // Successfully verified, user will be redirected by useAuth
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* University Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-elegant p-2">
            <img 
              src="/public/image.png" 
              alt="Department Logo" 
              className="h-12 w-12 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <GraduationCap className="h-8 w-8 text-white hidden" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              ITSA Project Vault
            </h1>
            <p className="text-slate-600 mt-2 font-medium">
              University of Ilorin, Information Technology Department Repository
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="bg-white border-2 border-slate-200 shadow-lg">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-3">
              {step === 'email' ? (
                <Shield className="h-5 w-5 text-primary" />
              ) : (
                <KeyRound className="h-5 w-5 text-primary" />
              )}
              <CardTitle className="text-xl text-slate-800">
                {step === 'email' ? 'Student Access Portal' : 'Enter Verification Code'}
              </CardTitle>
            </div>
            <CardDescription className="text-sm leading-relaxed">
              {step === 'email' ? (
                <div className="space-y-3">
                  <p className="text-slate-700 font-semibold text-base">
                    Enter your official university email to access final year projects.
                  </p>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-slate-600 font-semibold">Email Format:</span>
                    <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
                      YY-52HL001@students.unilorin.edu.ng
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-slate-700 font-semibold">
                    We've sent a verification code to your email.
                  </p>
                  <p className="font-mono text-sm font-medium text-blue-700 bg-blue-50 px-3 py-2 rounded-md break-all border border-blue-200">
                    {email}
                  </p>
                </div>
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {step === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                    University Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="21-52HL001@students.unilorin.edu.ng"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 transition-smooth focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 placeholder:font-medium text-slate-800 bg-white border-slate-300 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading || !email} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-smooth font-semibold"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending OTP to email...
                    </div>
                  ) : (
                    'Send OTP Code'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp" className="text-sm font-semibold text-slate-700">
                        Enter 6-Digit OTP Code
                      </Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="text-center text-lg font-mono tracking-widest focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 text-slate-800 bg-white border-slate-300 focus:border-blue-500"
                        maxLength={6}
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={isLoading || otp.length !== 6} 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-smooth font-semibold"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Verifying OTP...
                        </div>
                      ) : (
                        'Verify OTP'
                      )}
                    </Button>
                    
                    <div className="p-4 bg-slate-100 rounded-lg border border-slate-200">
                      <div className="flex items-start gap-3">
                        <Mail className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-slate-700">
                          <p className="font-semibold mb-1 text-slate-800">Check your email:</p>
                          <p className="font-mono text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200 mb-2 break-all">
                            {email}
                          </p>
                          <p className="text-xs text-slate-600">
                            Enter the 6-digit verification code sent to your university email.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => {
                        setStep('email');
                        setEmail('');
                        setOtp('');
                      }}
                      variant="outline" 
                      className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      Use Different Email
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-slate-100 rounded-lg border border-slate-200">
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <p className="font-semibold text-slate-800 mb-1">Security Notice</p>
                  We'll send a one-time verification code to your email. 
                  Only official department students with valid email addresses can access this system.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500">
          © 2025 University of Ilorin, Information Technology Department
        </p>
      </div>
    </div>
  );
};

export default Auth;