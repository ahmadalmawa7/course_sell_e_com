import { useState, useEffect } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { useData } from '@/contexts/DataContext';

import { useAuth } from '@/contexts/AuthContext';

import { useRazorpay } from '@/hooks/useRazorpay';

import { Clock, Star, Users, BookOpen, Search, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { toast } from 'sonner';



const CoursesPage = () => {

  const { courses, categories, isEnrolled, enrollCourse, refetchUserEnrollments } = useData();

  const { user } = useAuth();

  const { isLoading: isPaymentLoading, initiatePayment } = useRazorpay();

  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('All');

  const [searchQuery, setSearchQuery] = useState('');

  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);



  useEffect(() => {

    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);

    return () => clearTimeout(timer);

  }, [searchQuery]);



  // Fetch user enrollments when page mounts

  useEffect(() => {

    const userId = user?.id || (user as any)?._id?.toString();

    if (userId) {

      refetchUserEnrollments(userId);

    }

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [user?.id]);



  const filteredBySearch = courses.filter(course =>

    course.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||

    course.category.toLowerCase().includes(debouncedQuery.toLowerCase()) ||

    course.description.toLowerCase().includes(debouncedQuery.toLowerCase())

  );



  const filtered = activeCategory === 'All' ? filteredBySearch : filteredBySearch.filter((c) => c.category === activeCategory);



  const handleEnroll = async (courseId: string) => {

    if (!user) {

      navigate('/login');

      return;

    }



    const userId = user.id || (user as any)._id?.toString();

    if (!userId) {

      toast.error('User ID not found');

      return;

    }


    // Check if user is already enrolled

    const course = courses.find(c => c.id === courseId);

    if (!course) {

      toast.error('Course not found');

      return;

    }

    // Check for free courses (price 0)

    if (course.price === 0) {

      setEnrollingCourseId(courseId);

      try {

        await enrollCourse(userId, courseId);

        toast.success('Enrolled Successfully! 🎉');

        navigate(`/courses/${courseId}`);

      } catch (error) {

        const message = error instanceof Error ? error.message : String(error);

        if (message.includes('Already enrolled')) {

          toast.success('You are already enrolled! Redirecting...');

          const currentUserId = user?.id || (user as any)?._id?.toString();

          if (currentUserId) {

            await refetchUserEnrollments(currentUserId);

          }

          navigate(`/courses/${courseId}`);

        } else {

          toast.error('Failed to enroll. Please try again.');

          console.error('Enrollment error:', error);

        }

      } finally {

        setEnrollingCourseId(null);

      }

      return;

    }

    // For paid courses, initiate Razorpay payment

    setEnrollingCourseId(courseId);

    try {

      await initiatePayment(userId, courseId, () => {

        // Success callback - refresh enrollments and navigate

        const currentUserId = user?.id || (user as any)?._id?.toString();

        if (currentUserId) {

          refetchUserEnrollments(currentUserId);

        }

        navigate(`/courses/${courseId}`);

      });

    } catch (error) {

      console.error('Payment error:', error);

    } finally {

      setEnrollingCourseId(null);

    }

  };



  return (

    <div>

      <section className="bg-gradient-hero py-16">

        <div className="container mx-auto px-4 text-center">

          <p className="mb-2 text-xs font-medium tracking-[0.3em] text-gold uppercase">Our Programs</p>

          <h1 className="mb-4 font-heading text-4xl font-bold text-secondary md:text-5xl">Courses</h1>

          <p className="mx-auto max-w-xl text-secondary/80">Comprehensive training programs designed for professionals at every stage of their career.</p>

        </div>

      </section>



      <section className="py-12">

        <div className="container mx-auto px-4">

          {/* Search Bar */}

          <div className="relative mb-8 max-w-md mx-auto">

            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input

              type="text"

              placeholder="Search courses..."

              value={searchQuery}

              onChange={(e) => setSearchQuery(e.target.value)}

              className="pl-10"

            />

          </div>



          {/* Category Filters */}

          <div className="mb-8 flex flex-wrap gap-2">

            {categories.map((cat) => (

              <Button

                key={cat}

                size="sm"

                variant={activeCategory === cat ? 'default' : 'outline'}

                className={activeCategory === cat ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}

                onClick={() => setActiveCategory(cat)}

              >

                {cat}

              </Button>

            ))}

          </div>



          {/* Course Grid */}

          {filtered.length === 0 ? (

            <div className="text-center py-12">

              <p className="text-muted-foreground">No courses found matching your search.</p>

            </div>

          ) : (

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {filtered.map((course) => {

                const userId = user?.id || (user as any)?._id?.toString() || '';
                const authEnrolledCourses = user?.enrolledCourses?.map((c: any) => c?.toString()) || [];
                const isUserEnrolled = Boolean(
                  user && (isEnrolled(userId, course.id) || authEnrolledCourses.includes(course.id))
                );

                return (

                  <div key={course.id} className="h-full rounded-lg border border-border bg-card p-6 transition-all hover:border-gold/50 hover:shadow-lg">

                    <Link to={`/courses/${course.id}`} className="block">

                      <div className="mb-4 h-40 overflow-hidden rounded-lg bg-slate-100">

                        <img

                          src={course.image || '/placeholder.svg'}

                          alt={course.title}

                          className="h-full w-full object-cover"

                          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}

                        />

                      </div>

                      <div className="mb-3 flex items-center justify-between">

                        <span className="rounded-sm bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{course.category}</span>

                        <span className="rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground">{course.level}</span>

                      </div>

                      <h3 className="mb-2 font-heading text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">{course.title}</h3>

                      <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{course.description}</p>

                      <div className="mb-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">

                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course.duration}</span>

                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {course.modules} modules</span>

                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {course.enrolled} enrolled</span>

                        <span className="flex items-center gap-1"><Star className="h-3 w-3 text-gold" /> {course.rating}</span>

                      </div>

                      <div className="flex items-center justify-between border-t border-border pt-3">

                        <span className="font-heading text-xl font-bold text-primary">₹{course.price.toLocaleString()}</span>

                        <span className="text-xs text-muted-foreground">{course.instructor.split(',')[0]}</span>

                      </div>

                    </Link>

                    {/* Action Buttons */}
                    <div className="mt-4 flex gap-2">
                      {isUserEnrolled ? (
                        // Enrolled: Show Continue Learning button that opens course detail
                        <Button
                          onClick={() => navigate(`/courses/${course.id}`)}
                          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all"
                        >
                          Continue Learning
                        </Button>
                      ) : (
                        // Not Enrolled: Show Enroll Now + View Course buttons
                        <>
                          <Button
                            onClick={() => handleEnroll(course.id)}
                            disabled={enrollingCourseId === course.id || isPaymentLoading}
                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all"
                          >
                            {enrollingCourseId === course.id || isPaymentLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              `Enroll Now - ₹${course.price.toLocaleString()}`
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => navigate(`/courses/${course.id}`)}
                            className="flex-1 border-primary text-primary hover:bg-primary/10 font-semibold transition-all"
                          >
                            View Course
                          </Button>
                        </>
                      )}
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



export default CoursesPage;

