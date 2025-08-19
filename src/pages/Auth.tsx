import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Mail, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, signInWithOTP } = useAuth();

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await signInWithOTP(email);
    if (!result.error) {
      setEmailSent(true);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* University Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg p-2">
            <img 
              src="/public/image.png" 
              alt="Department Logo" 
              className="h-12 w-12 object-contain"
              onError={(e) => {
                // Fallback to graduation cap icon if logo fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <GraduationCap className="h-8 w-8 text-white hidden" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
            ITSA Project Vault
            </h1>
            <p className="text-slate-600 mt-2">
              University of Ilorin, Information Technology Department Repository
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="bg-white border-2 border-slate-200 shadow-lg">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">Student Access Portal</CardTitle>
            </div>
          <CardDescription className="text-sm leading-relaxed">
              <div className="space-y-2">
                <p>Enter your official university email to access final year projects.</p>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500">Format:</span>
                  <span className="font-mono text-sm font-semibold text-primary bg-primary/10 px-3 py-2 rounded-md border border-primary/20">
                    YY-52HL001@students.unilorin.edu.ng
                  </span>
                </div>
              </div>
            </CardDescription>

          </CardHeader>
          
          <CardContent>
            {emailSent ? (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Check Your Email</h3>
                    <p className="text-sm text-slate-600 mt-2">
                      We've sent a verification code to:
                    </p>
                    <p className="font-mono text-sm font-medium text-primary bg-primary/10 px-3 py-2 rounded-md mt-2 break-all">
                      {email}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Next Steps:</p>
                        <ol className="list-decimal list-inside space-y-1 text-xs">
                          <li>Check your university email inbox</li>
                          <li>Look for an email from the ITSA Project Vault</li>
                          <li>Click the verification link in the email</li>
                          <li>You'll be automatically logged in</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      setEmailSent(false);
                      setEmail('');
                    }}
                    variant="outline" 
                    className="w-full"
                  >
                    Use Different Email
                  </Button>
                </div>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  University Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your university email (e.g., 21-52HL001@students.unilorin.edu.ng)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 transition-smooth focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading || !email} 
                className="w-full bg-primary hover:bg-primary/90 text-white shadow-sm transition-smooth"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending verification code...
                  </div>
                ) : (
                  'Send Verification Code'
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-xs text-slate-600 leading-relaxed">
                  <p className="font-medium text-slate-900 mb-1">Security Notice</p>
                  We'll send a one-time verification code to your email. 
                  Only official department students with valid email addresses can access this system.
                </div>
              </div>
            </div>
            )}
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
