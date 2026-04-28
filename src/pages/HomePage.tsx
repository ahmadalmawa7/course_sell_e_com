import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, BookOpen, Users, Award, Video, Star, Calendar, Clock, TrendingUp, User, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import EnquiryPopup from '@/components/EnquiryPopup';

const SiliconIndiaFeature = () => (
  <section className="relative overflow-hidden border-y border-gold/20 bg-gradient-to-r from-[hsl(0,0%,10%)] via-[hsl(0,100%,10%)] to-[hsl(0,0%,10%)] py-12">
    {/* Subtle pattern overlay */}
    <div
      className="absolute inset-0 opacity-5"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4af37' fill-opacity='1'%3E%3Cpath d='M20 20.5V18H0v5h5v5H0v5h20v-2.5h-1.5V28H13v-7.5h5V18h2v2.5zM20 13.5V11H0v5h5v5H0v5h20v-2.5h-1.5V21H13v-7.5h5V11h2v2.5z'/%3E%3C/g%3E%3C/svg%3E")`,
      }}
    />

    <div className="container relative mx-auto px-4">
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between md:gap-10">

        {/* Left: Badge + Publication */}
        <div className="flex shrink-0 flex-col items-center gap-3 md:items-start">
          <div className="flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5">
            <Award className="h-4 w-4 text-gold" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              SiliconIndia Magazine
            </span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className="h-4 w-4 fill-gold text-gold" />
            ))}
          </div>
          <p className="text-xs text-secondary/50">June 2021 · Cover Feature</p>
        </div>

        {/* Center: Main content */}
        <div className="flex-1 text-center md:text-left">
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.3em] text-gold">
            Featured in SiliconIndia Magazine – June 2021
          </p>
          <h2 className="mb-2 font-heading text-xl font-bold text-secondary md:text-2xl">
            "Striving to guide people and organizations to succeed in their roles and accomplish objectives and long-term life goals."
          </h2>
          <p className="text-sm text-secondary/70">
            Recognized among the{' '}
            <span className="font-semibold text-gold">
              10 Most Promising Workforce Development Companies – 2021
            </span>
          </p>
          <p className="mt-1 text-xs text-secondary/50">
            — Lt Col Shreesh Kumar (Retd), Founder & CEO
          </p>
        </div>

        {/* Right: CTA */}
        <div className="shrink-0">
          <Link to="/about">
            <Button
              variant="outline"
              className="border-gold text-gold hover:bg-gold hover:text-charcoal gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Read Full Feature
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </section>
);

const HomePage = () => {
  const { courses, liveClasses, articles, getEnrolledCourses, getCourseProgress } = useData();
  const { user } = useAuth();
  const featuredCourses = courses.slice(0, 4);
  const upcomingClasses = liveClasses.slice(0, 3);
  const latestArticles = articles.slice(0, 3);
  const [testimonialsData, setTestimonialsData] = useState<any[]>([]);
  const approvedTestimonials = testimonialsData.filter(t => t.approved);
  const enrolledCourses = user ? getEnrolledCourses(user.id) : [];

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ text: '', rating: 5 });
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(error => {
        console.error('Video autoplay failed:', error);
      });
    }
  }, []);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch('/api/testimonials');
        if (res.ok) {
          const data = await res.json();
          setTestimonialsData(data);
        }
      } catch (err) {
        console.error('Failed to load testimonials', err);
      }
    };
    fetchTestimonials();
  }, []);

  const handleFeedback = async () => {
    if (!feedbackForm.text) { toast.error('Please write your feedback.'); return; }
    try {
      const payload = {
        userId: user?.id || null,
        name: user?.name || 'Anonymous',
        rating: feedbackForm.rating,
        message: feedbackForm.text,
      };
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to submit feedback');
      toast.success('Thank you! Your feedback will appear after admin approval.');
      setFeedbackForm({ text: '', rating: 5 });
      setShowFeedback(false);
      // refresh testimonials (approved list won't include this pending item but keep UI in sync)
      try {
        const r2 = await fetch('/api/testimonials');
        if (r2.ok) {
          const d = await r2.json();
          setTestimonialsData(d);
        }
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit feedback');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[600px] py-24 md:py-32" style={{ backgroundColor: '#0f172a' }}>
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
          style={{ pointerEvents: 'none' }}
        >
          <source src="/course_sell_video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" style={{ zIndex: 5 }} />
        <div className="absolute inset-0 opacity-10" style={{ zIndex: 6, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="container relative mx-auto px-4 text-center" style={{ zIndex: 10, position: 'relative' }}>
          <p className="mb-4 text-sm font-medium tracking-[0.3em] text-gold uppercase animate-fade-in-up">We will help you achieve transformation…</p>
          <h1 className="mb-6 font-heading text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>Erudition Infinite</h1>
          <p className="mx-auto mb-6 max-w-2xl text-lg text-[#F8F8F8] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            To deliver training and management solutions to the total satisfaction and delight of the customer and exceed expectations.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/courses"><Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary-hover font-semibold px-8">Explore Courses <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            <Link to="/about"><Button size="lg" variant="outline" className="border-gold text-gold hover:bg-gold hover:text-charcoal">About Us</Button></Link>
          </div>
        </div>
      </section>

      {/* My Enrolled Courses - Only for logged-in users */}
      {user && enrolledCourses.length > 0 && (
        <section className="bg-background py-12">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="mb-2 text-xs font-medium tracking-[0.3em] text-gold uppercase">My Learning</p>
                <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">My Enrolled Courses</h2>
              </div>
              <Link to="/my-courses">
                <Button variant="outline" className="border-primary text-primary">View All</Button>
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.slice(0, 3).map(course => {
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
          </div>
        </section>
      )}

      {/* SiliconIndia Feature */}
      <SiliconIndiaFeature />

      {/* Stats */}
      <section className="border-b border-border bg-background py-12">
        <div className="container mx-auto grid grid-cols-2 gap-6 px-4 md:grid-cols-4">
          {[
            { icon: BookOpen, label: 'Courses', value: '10+' },
            { icon: Users, label: 'Students Trained', value: '4,000+' },
            { icon: Award, label: 'Certifications', value: '2,500+' },
            { icon: Video, label: 'Live Sessions', value: '500+' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <Icon className="mx-auto mb-2 h-6 w-6 text-gold" />
              <p className="font-heading text-2xl font-bold text-foreground">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SILICONINDIA RECOGNITION TRUST BAR ── */}
      <section className="border-b border-border bg-background py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-3 text-center md:flex-row md:justify-center md:gap-6">
            <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">Recognised By</p>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-5 py-3">
              <Award className="h-4 w-4 text-gold flex-shrink-0" />
              <p className="text-sm font-semibold text-card-foreground">
                Top 10 Workforce Development Companies — SiliconIndia Magazine, June 2021
              </p>
              <a
                href="https://www.siliconindia.com/digital-magazine/workforce-development-companies-june-2021/#page=14"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-primary underline underline-offset-2 hover:text-primary/80 whitespace-nowrap"
              >
                View Feature →
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* ── END RECOGNITION TRUST BAR ── */}

      {/* About the Institute */}
      <section className="bg-cream py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <p className="mb-2 text-xs font-medium tracking-[0.3em] text-gold uppercase text-center">About the Institute</p>
            <h2 className="mb-8 font-heading text-3xl font-bold text-foreground md:text-4xl text-center">About the Institute</h2>
            <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
              <p>
                At Erudition Infinite we strive to nurture and shape aspirants' talents and personalities. We are committed to offer solutions to our esteemed clients after studying their area of business and analysing their needs. We deliver customized <strong className="text-primary">training</strong> and <strong className="text-primary">management</strong> development programs for corporates, government and private organisations, as well as for students of management, engineering and other professional institutes/establishments.
              </p>
              <p>
                Erudition Infinite offers <strong className="text-primary">consultancy</strong> in training, <strong className="text-primary">management</strong> development, project management, <strong className="text-primary">ISO 9001:2008</strong>, subject research and report, and guidance to <strong className="text-primary">MBA</strong> and <strong className="text-primary">engineering students</strong> for final year projects. With our panel of qualified professionals, who are also highly experienced domain experts, we shall endeavour to deliver solutions to completely satisfy and delight the client.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-medium tracking-[0.3em] text-gold uppercase">Our Programs</p>
            <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">Featured Courses</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featuredCourses.map((course) => (
              <Link key={course.id} to={`/courses/${course.id}`} className="group">
                <div className="h-full rounded-lg border border-border bg-card p-6 transition-all hover:border-gold/50 hover:shadow-lg">
                  {course.image && (
                    <div className="mb-4 overflow-hidden rounded-md border border-border">
                      <img src={course.image} alt={course.title} className="w-full h-40 object-cover" />
                    </div>
                  )}
                  <span className="mb-3 inline-block rounded-sm bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{course.category}</span>
                  <h3 className="mb-2 font-heading text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">{course.title}</h3>
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course.duration}</span>
                    <span className="flex items-center gap-1"><Star className="h-3 w-3 text-gold" /> {course.rating}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <span className="font-heading text-lg font-bold text-primary">₹{course.price.toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/courses"><Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">View All Courses <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
        </div>
      </section>

      {/* Live Classes */}
      <section className="bg-cream py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-medium tracking-[0.3em] text-gold uppercase">Interactive Learning</p>
            <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">Upcoming Live Classes</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {upcomingClasses.map((cls) => (
              <Link key={cls.id} to="/live-classes" className="group">
                <div className="rounded-lg border border-border bg-card overflow-hidden transition-all hover:border-gold/50 hover:shadow-md">
                  <div className="relative h-40 bg-muted/20">
                    {cls.thumbnail ? (
                      <img src={cls.thumbnail} alt={cls.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                        <Video className="h-10 w-10 text-primary/40" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 text-xs font-semibold bg-gold/90 text-charcoal rounded-sm">Live</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading text-base font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-1 mb-2">{cls.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-gold" /> {cls.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-gold" /> {cls.time}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/live-classes"><Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">View All Live Classes <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-medium tracking-[0.3em] text-gold uppercase">Knowledge Hub</p>
            <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">Latest Articles</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {latestArticles.map((article) => (
              <Link key={article.id} to={`/articles/${article.id}`} className="group">
                <div className="rounded-lg border border-border bg-card p-6 transition-all hover:border-gold/50 hover:shadow-md">
                  {article.image && (
                    <div className="mb-3 overflow-hidden rounded-md border border-border">
                      <img src={article.image} alt={article.title} className="w-full h-36 object-cover" />
                    </div>
                  )}
                  <span className="mb-2 inline-block text-xs font-medium text-gold">{article.category}</span>
                  <h3 className="mb-2 font-heading text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">{article.title}</h3>
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{article.author}</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/articles"><Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">Read More Articles <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-hero py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-medium tracking-[0.3em] text-gold uppercase">Testimonials</p>
            <h2 className="font-heading text-3xl font-bold text-secondary md:text-4xl">What Our Students Say</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {approvedTestimonials.slice(0, 5).map((t) => (
              <div key={t.id} className="rounded-lg border border-secondary/10 bg-secondary/5 p-6 backdrop-blur-sm">
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="mb-4 text-sm text-secondary/80 italic leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  {t.profileImage ? (
                    <img src={t.profileImage} alt={t.name} className="h-10 w-10 rounded-full object-cover border border-secondary/20" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/20">
                      <User className="h-5 w-5 text-secondary/60" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-secondary text-sm">{t.name}</p>
                    {t.courseName && (
                      <p className="text-xs text-gold">{t.courseName}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {user && (
            <div className="mt-8 text-center">
              {!showFeedback ? (
                <Button className="bg-gold text-charcoal hover:bg-gold-dark font-semibold px-6" onClick={() => setShowFeedback(true)}>Share Your Feedback</Button>
              ) : (
                <div className="mx-auto max-w-md rounded-lg bg-secondary/10 p-5 backdrop-blur-sm">
                  <h3 className="font-heading text-base font-semibold text-secondary mb-3">Your Feedback</h3>
                  <div className="flex gap-1 mb-3 justify-center">
                    {[1, 2, 3, 4, 5].map(r => (
                      <button key={r} onClick={() => setFeedbackForm({ ...feedbackForm, rating: r })}>
                        <Star className={`h-6 w-6 ${r <= feedbackForm.rating ? 'fill-gold text-gold' : 'text-secondary/30'}`} />
                      </button>
                    ))}
                  </div>
                  <Textarea value={feedbackForm.text} onChange={e => setFeedbackForm({ ...feedbackForm, text: e.target.value })} placeholder="Share your experience..." rows={3} className="mb-3 bg-secondary/10 border-secondary/20 text-secondary placeholder:text-secondary/40" />
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" className="bg-secondary/20 text-secondary hover:bg-secondary/30 border border-secondary/30" onClick={() => setShowFeedback(false)}>Cancel</Button>
                    <Button size="sm" className="bg-gold text-charcoal hover:bg-gold-dark font-semibold" onClick={handleFeedback}>Submit</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA - Only show when user is not logged in */}
      {!user && (
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 font-heading text-3xl font-bold text-foreground md:text-4xl">Begin Your Professional Transformation</h2>
            <p className="mx-auto mb-8 max-w-xl text-muted-foreground">Join thousands of professionals who have elevated their careers through Erudition Infinite's programs.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/register"><Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">Register Now <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              <Link to="/courses"><Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">Browse Courses</Button></Link>
            </div>
          </div>
        </section>
      )}
      {!user && <EnquiryPopup />}
    </div>
  );
};

export default HomePage;
