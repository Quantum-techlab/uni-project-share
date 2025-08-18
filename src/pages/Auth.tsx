import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Mail, Shield } from 'lucide-react';
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
    
    await signInWithOTP(email);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* University Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 university-header rounded-full flex items-center justify-center shadow-glow">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Department Project Repository
            </h1>
            <p className="text-muted-foreground mt-2">
              University of Ilorin • Computer Science Department
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="academic-paper border-2 border-primary/10">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">Student Access Portal</CardTitle>
            </div>
            <CardDescription className="text-sm leading-relaxed">
              Enter your official university email to access final year projects. 
              Format: <span className="font-mono text-primary">YY-52HL001@students.unilorin.edu.ng</span>
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  University Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="21-52HL001@students.unilorin.edu.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 transition-smooth focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading || !email} 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-card transition-smooth"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Sending verification code...
                  </div>
                ) : (
                  'Send Verification Code'
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-accent/20 rounded-lg border border-accent/30">
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <p className="font-medium text-foreground mb-1">Security Notice</p>
                  We'll send a one-time verification code to your email. 
                  Only official department students with valid email addresses can access this system.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          © 2024 University of Ilorin, Computer Science Department
        </p>
      </div>
    </div>
  );
};

export default Auth;