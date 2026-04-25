import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Link, Navigate } from 'react-router-dom';
import { BookOpen, Clock, Star, TrendingUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

const MyCoursesPage = () => {
  const { user } = useAuth();
  const { getEnrolledCourses, getCourseProgress } = useData();
  if (!user) return <Navigate to="/login" />;

  const enrolledCourses = getEnrolledCourses(user.id);

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

  return (
    <div>
      <section className="bg-gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2 text-xs font-medium tracking-[0.3em] text-gold uppercase">My Learning</p>
          <h1 className="mb-4 font-heading text-4xl font-bold text-secondary md:text-5xl">My Courses</h1>
          <p className="text-secondary/80">Track your enrolled courses and progress</p>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <div className="relative mb-8 max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search my courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredEnrolled.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No courses found matching your search.</p>
              <Link to="/courses"><Button className="bg-primary text-primary-foreground">Browse Courses</Button></Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEnrolled.map(course => {
                const progress = getCourseProgress(user.id, course.id);
                const isCompleted = progress === 100;
                return (
                  <div key={course.id} className="rounded-lg border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="bg-gradient-hero p-4">
                      <span className="inline-block rounded-sm bg-gold/20 px-2 py-0.5 text-xs font-medium text-gold mb-2">{course.category}</span>
                      <h3 className="font-heading text-lg font-semibold text-secondary">{course.title}</h3>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course.duration}</span>
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {course.modules} modules</span>
                        <span className="flex items-center gap-1"><Star className="h-3 w-3 text-gold" /> {course.rating}</span>
                      </div>
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Progress</span>
                        <span className="font-semibold text-card-foreground">{progress}%</span>
                      </div>
                      <div className="mb-4 h-2 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${isCompleted ? 'bg-green-500' : 'bg-gold'}`} style={{ width: `${progress}%` }} />
                      </div>
                      {isCompleted && <span className="inline-block rounded-sm bg-green-100 text-green-700 px-2 py-0.5 text-xs font-medium mb-3">✓ Completed</span>}
                      <Link to={`/courses/${course.id}`}>
                        <Button variant="outline" size="sm" className="w-full border-primary text-primary text-xs">
                          {isCompleted ? 'Review Course' : 'Continue Learning'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MyCoursesPage;
