import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register(name, email, password);
    if (success) {
      toast.success('Registration successful! Welcome to Erudition Infinite.');
      navigate('/');
    } else {
      toast.error('Registration failed. Please check your details and try again.');
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <GraduationCap className="mx-auto mb-3 h-10 w-10 text-primary" />
          <h1 className="font-heading text-2xl font-bold text-card-foreground">Create Account</h1>
          <p className="text-sm text-muted-foreground">Join Erudition Infinite</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-card-foreground">Full Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-card-foreground">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-card-foreground">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Register</Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
