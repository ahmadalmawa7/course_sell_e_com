import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingAdminEmail, setPendingAdminEmail] = useState('');
  const [pendingAdminPassword, setPendingAdminPassword] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const { login, adminLogin, verifyAdminOtp, resendAdminOtp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdminLogin) {
      const result = await adminLogin(email, password);
      if (result.success) {
        setOtpStep(true);
        setPendingAdminEmail(email);
        setPendingAdminPassword(password);
        setOtpMessage('OTP sent to your email. It expires in 5 minutes.');
        toast.success(result.message);
      } else {
        toast.error(result.message || 'Invalid admin credentials');
      }
      return;
    }

    const success = await login(email, password);
    if (success) {
      toast.success('Login successful');
      navigate('/');
    } else {
      toast.error('Invalid email or password');
    }
  };

  const handleVerifyOtp = async () => {
    const result = await verifyAdminOtp(pendingAdminEmail || email, otp);
    if (result.success) {
      toast.success('Admin login successful');
      navigate('/admin');
    } else {
      toast.error(result.message || 'Invalid or expired OTP');
    }
  };

  const handleResendOtp = async () => {
    const result = await resendAdminOtp(pendingAdminEmail || email, pendingAdminPassword || password);
    if (result.success) {
      setOtpMessage('OTP resent. Check your email.');
      toast.success(result.message);
    } else {
      toast.error(result.message || 'Unable to resend OTP');
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <GraduationCap className="mx-auto mb-3 h-10 w-10 text-primary" />
          <h1 className="font-heading text-2xl font-bold text-card-foreground">{isAdminLogin ? 'Admin Login' : 'Student Login'}</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-card-foreground">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="your@email.com" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-card-foreground">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="••••••••" />
          </div>
          {otpStep && (
            <div>
              <label className="mb-1 block text-sm font-medium text-card-foreground">OTP Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="123456"
              />
              <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                <p>{otpMessage || 'Enter the 6-digit code sent to your email.'}</p>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-primary hover:underline"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}
          {!otpStep ? (
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Sign In
            </Button>
          ) : (
            <Button type="button" onClick={handleVerifyOtp} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Verify OTP
            </Button>
          )}
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <button
            onClick={() => {
              setIsAdminLogin(!isAdminLogin);
              setOtpStep(false);
              setOtp('');
              setOtpMessage('');
              setPendingAdminEmail('');
              setPendingAdminPassword('');
            }}
            className="text-gold hover:underline"
          >
            {isAdminLogin ? 'Student Login' : 'Admin Login'}
          </button>
        </div>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Don't have an account? <Link to="/register" className="text-primary hover:underline">Register</Link>
        </p>
        {isAdminLogin && (
          <p className="mt-2 text-center text-xs text-muted-foreground">Demo: admin@eruditioninfinite.com / admin123</p>
        )}
        {!isAdminLogin && (
          <p className="mt-2 text-center text-xs text-muted-foreground">Demo: any email & password works</p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
