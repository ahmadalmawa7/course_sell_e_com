import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/data/types';
import { mockUser } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  adminToken: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  verifyAdminOtp: (email: string, otp: string) => Promise<{ success: boolean; message: string }>;
  resendAdminOtp: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  enrollInCourse: (courseId: string) => Promise<void>;
  updateProgress: (courseId: string, progress: number) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('erudition-user');
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored) as any;
      if (parsed?._id && !parsed.id) {
        parsed.id = parsed._id?.toString();
        delete parsed._id;
      }
      return parsed as User;
    } catch {
      localStorage.removeItem('erudition-user');
      return null;
    }
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('erudition-admin') === 'true';
  });
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('erudition-admin-token');
  });

  const normalizeEmail = (value: string) => value.trim().toLowerCase();
  const normalizePassword = (value: string) => value.trim();

  const login = async (email: string, password: string) => {
    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = normalizePassword(password);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password: normalizedPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        setIsAdmin(false);
        setAdminToken(null);
        return true;
      }
      console.error('Login failed:', data.message);
      return false;
    } catch (error) {
      console.error('Login request error:', error);
      return false;
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      const normalizedEmail = normalizeEmail(email);
      const normalizedPassword = normalizePassword(password);
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password: normalizedPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: data.message || 'OTP sent' };
      }
      return { success: false, message: data.message || 'Invalid credentials' };
    } catch (error) {
      console.error('Admin login request failed:', error);
      return { success: false, message: 'Unable to request admin OTP' };
    }
  };

  const verifyAdminOtp = async (email: string, otp: string) => {
    try {
      const normalizedEmail = normalizeEmail(email);
      const normalizedOtp = otp.trim();
      const res = await fetch('/api/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, otp: normalizedOtp }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const verifiedUser = data.user;
        if (verifiedUser) {
          setUser({
            id: verifiedUser.id || verifiedUser._id?.toString() || '',
            name: verifiedUser.name || 'Admin',
            email: verifiedUser.email || normalizedEmail,
            phone: verifiedUser.phone || '',
            profileImage: verifiedUser.profileImage || '',
            enrolledCourses: Array.isArray(verifiedUser.enrolledCourses) ? verifiedUser.enrolledCourses : [],
            completedCourses: Array.isArray(verifiedUser.completedCourses) ? verifiedUser.completedCourses : [],
            progress: verifiedUser.progress || {},
            certificates: Array.isArray(verifiedUser.certificates) ? verifiedUser.certificates : [],
          });
        }
        setIsAdmin(true);
        setAdminToken(data.token || null);
        return { success: true, message: data.message || 'OTP verified' };
      }
      return { success: false, message: data.message || 'Invalid or expired OTP' };
    } catch (error) {
      console.error('Admin OTP verification failed:', error);
      return { success: false, message: 'Unable to verify OTP' };
    }
  };

  const resendAdminOtp = async (email: string, password: string) => {
    return adminLogin(email, password);
  };

  const register = async (name: string, email: string, password: string) => {
    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = normalizePassword(password);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: normalizedEmail, password: normalizedPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        setIsAdmin(false);
        setAdminToken(null);
        return true;
      }
      console.error('Registration failed:', data.message);
      return false;
    } catch (error) {
      console.error('Registration request error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    setAdminToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('erudition-user');
      localStorage.removeItem('erudition-admin');
      localStorage.removeItem('erudition-admin-token');
    }
  };

  const enrollInCourse = async (courseId: string) => {
    if (!user) return;
    if (user.enrolledCourses.includes(courseId)) return;

    try {
      const res = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, courseId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
      } else {
        console.error('Failed to enroll:', data.message);
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  const updateProgress = async (courseId: string, progress: number) => {
    if (!user) return;

    try {
      const res = await fetch('/api/enrollment/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, courseId, progress }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser({ ...user, progress: { ...user.progress, [courseId]: progress } });
      } else {
        console.error('Failed to update progress:', data.message);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;

    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...data }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setUser(result.user);
        return true;
      } else {
        console.error('Failed to update profile:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem('erudition-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('erudition-user');
    }
  }, [user]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (adminToken) {
      localStorage.setItem('erudition-admin-token', adminToken);
    } else {
      localStorage.removeItem('erudition-admin-token');
    }
  }, [adminToken]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('erudition-admin', String(isAdmin));
  }, [isAdmin]);

  return (
    <AuthContext.Provider value={{ user, isAdmin, adminToken, login, adminLogin, verifyAdminOtp, resendAdminOtp, register, logout, enrollInCourse, updateProgress, updateProfile, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
