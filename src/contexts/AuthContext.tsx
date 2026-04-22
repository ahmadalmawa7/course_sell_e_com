import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/data/types';
import { mockUser } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => boolean;
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
        return true;
      }
      console.error('Login failed:', data.message);
      return false;
    } catch (error) {
      console.error('Login request error:', error);
      return false;
    }
  };

  const adminLogin = (email: string, password: string) => {
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('Admin credentials not configured in environment variables');
      return false;
    }

    if (email === adminEmail && password === adminPassword) {
      setIsAdmin(true);
      setUser({ ...mockUser, name: 'Admin', email });
      return true;
    }
    return false;
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('erudition-user');
      localStorage.removeItem('erudition-admin');
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
    localStorage.setItem('erudition-admin', String(isAdmin));
  }, [isAdmin]);

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, adminLogin, register, logout, enrollInCourse, updateProgress, updateProfile, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
