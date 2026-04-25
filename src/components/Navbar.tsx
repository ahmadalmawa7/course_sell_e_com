import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, User, LogOut, Shield, BookOpen, FileText, HelpCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Courses', to: '/courses' },
  { label: 'Live Classes', to: '/live-classes' },
  { label: 'Articles', to: '/articles' },
  { label: 'Notes', to: '/notes' },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const hiddenWhenLoggedIn = ['Live Classes', 'Notes'];
  const visibleNavLinks = navLinks.filter(link => !(user && hiddenWhenLoggedIn.includes(link.label)));

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background backdrop-blur supports-[backdrop-filter]:bg-background/95">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3">
          <img src="/Logo.png" alt="Erudition Infinite Logo" className="h-12 w-auto" />
          <div className="flex flex-col">
            <div className="flex items-start gap-0.5">
              <span className="font-serif text-xl font-bold leading-tight text-[#b30000]">ERUDITION INFINITE</span>
              <span className="font-serif text-xs font-bold text-black leading-none">®</span>
            </div>
            <span className="text-xs italic text-[#777]">Integrating talent, thought and action.</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 lg:flex">
          {visibleNavLinks.map((link) => (
            <Link key={link.to} to={link.to}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-primary ${location.pathname === link.to ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              {isAdmin ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Shield className="h-4 w-4" />
                      Admin
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link to="/dashboard"><Button variant="ghost" size="sm" className="gap-1.5"><User className="h-4 w-4" /> Dashboard</Button></Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-1.5">
                        <User className="h-4 w-4" />
                        {user.name}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link to="/my-courses" className="flex items-center gap-2 cursor-pointer">
                          <BookOpen className="h-4 w-4" />
                          My Courses
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/support" className="flex items-center gap-2 cursor-pointer">
                          <HelpCircle className="h-4 w-4" />
                          Support
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600">
                        <LogOut className="h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
              <Link to="/register"><Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Register</Button></Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="lg:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {open && (
        <div className="border-t border-border bg-background p-4 lg:hidden">
          <div className="flex flex-col gap-2">
            {visibleNavLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-2 text-sm font-medium ${location.pathname === link.to ? 'bg-muted text-primary' : 'text-muted-foreground'}`}>
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-border" />
            {user ? (
              <>
                {!isAdmin && (
                  <>
                    <Link to="/my-courses" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground">My Courses</Link>
                    <Link to="/support" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground">Support</Link>
                    <Link to="/profile" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground">Profile</Link>
                  </>
                )}
                <Link to={isAdmin ? '/admin' : '/dashboard'} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground">
                  {isAdmin ? 'Admin Panel' : 'Dashboard'}
                </Link>
                <button onClick={() => { logout(); setOpen(false); }} className="rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground">Sign In</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium text-primary">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
