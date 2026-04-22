import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Link, Navigate } from 'react-router-dom';
import { BookOpen, Calendar, Award, Clock, Download, User, TrendingUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

const DashboardPage = () => {
  const { user } = useAuth();
  const { courses, liveClasses } = useData();
  if (!user) return <Navigate to="/login" />;

  const enrolledCourses = courses.filter((c) => user.enrolledCourses?.includes(c.id) ?? false);
  const upcomingClasses = liveClasses.filter((lc) => user.enrolledCourses?.includes(lc.courseId) ?? false);
  const completedCourses = user.completedCourses ?? [];

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredEnrolled = enrolledCourses.filter(course =>
    course.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

  const handleDownloadCertificate = (cert: typeof user.certificates[0]) => {
    // Mock PDF download
    const content = `
CERTIFICATE OF COMPLETION

This is to certify that

${cert.studentName}

has successfully completed the course

${cert.courseName}

Instructor: ${cert.instructor}
Date: ${cert.completionDate}

Erudition Infinite
Integrating Talent, Thought & Action
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificate-${cert.courseName.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Certificate downloaded!');
  };

  return (
    <div className="bg-cream min-h-screen">
      <section className="bg-gradient-hero py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/20">
              <User className="h-7 w-7 text-gold" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-secondary">Welcome, {user.name}</h1>
              <p className="text-sm text-secondary/70">{user.email}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Stats */}
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { icon: BookOpen, label: 'Enrolled Courses', value: enrolledCourses.length },
              { icon: TrendingUp, label: 'In Progress', value: Math.max(0, enrolledCourses.length - completedCourses.length) },
              { icon: Award, label: 'Completed', value: completedCourses.length },
              { icon: Calendar, label: 'Upcoming Classes', value: upcomingClasses.length },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-lg border border-border bg-card p-4 text-center">
                <Icon className="mx-auto mb-2 h-5 w-5 text-gold" />
                <p className="font-heading text-2xl font-bold text-card-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          {/* Enrolled Courses */}
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search my courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground">My Courses</h2>
          {filteredEnrolled.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground mb-4">No courses found matching your search.</p>
              <Link to="/courses"><Button className="bg-primary text-primary-foreground">Browse Courses</Button></Link>
            </div>
          ) : (
            <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEnrolled.map((course) => {
                const progress = user.progress[course.id] || 0;
                return (
                  <div key={course.id} className="rounded-lg border border-border bg-card p-5">
                    <h3 className="mb-1 font-heading text-base font-semibold text-card-foreground">{course.title}</h3>
                    <p className="mb-3 text-xs text-muted-foreground">{course.category}</p>
                    <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span className="font-medium text-card-foreground">{progress}%</span>
                    </div>
                    <div className="mb-3 h-2 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-gold transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/courses/${course.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs border-primary text-primary">Continue</Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Upcoming Live Classes */}
          {upcomingClasses.length > 0 && (
            <>
              <h2 className="mb-4 font-heading text-xl font-bold text-foreground">Upcoming Live Classes</h2>
              <div className="mb-8 grid gap-4 md:grid-cols-2">
                {upcomingClasses.map((cls) => (
                  <div key={cls.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                    <div>
                      <p className="font-medium text-card-foreground text-sm">{cls.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" /> {cls.date} • <Clock className="h-3 w-3" /> {cls.time}
                      </p>
                    </div>
                    <a href={cls.meetLink} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="bg-gold text-charcoal hover:bg-gold-dark text-xs">Join</Button>
                    </a>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Certificates */}
          {user.certificates.length > 0 && (
            <>
              <h2 className="mb-4 font-heading text-xl font-bold text-foreground">Certificates</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {user.certificates.map((cert) => (
                  <div key={cert.id} className="rounded-lg border border-gold/30 bg-card p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <Award className="mb-2 h-6 w-6 text-gold" />
                        <h3 className="font-heading text-base font-semibold text-card-foreground">{cert.courseName}</h3>
                        <p className="text-xs text-muted-foreground mt-1">Completed: {cert.completionDate}</p>
                        <p className="text-xs text-muted-foreground">Instructor: {cert.instructor.split(',')[0]}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadCertificate(cert)} className="gap-1 text-xs border-gold text-gold hover:bg-gold hover:text-charcoal">
                        <Download className="h-3 w-3" /> Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
