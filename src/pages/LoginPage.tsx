import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const { login, adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdminLogin) {
      const success = adminLogin(email, password);
      if (success) {
        toast.success('Admin login successful');
        navigate('/admin');
      } else {
        toast.error('Invalid admin credentials');
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
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Sign In
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <button onClick={() => setIsAdminLogin(!isAdminLogin)} className="text-gold hover:underline">
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
