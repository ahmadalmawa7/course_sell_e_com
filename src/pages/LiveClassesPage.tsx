import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, User, Video, ExternalLink, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const LiveClassesPage = () => {
  const { user } = useAuth();
  const { liveClasses, courses } = useData();

  return (
    <div>
      <section className="bg-gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2 text-xs font-medium tracking-[0.3em] text-gold uppercase">Interactive Sessions</p>
          <h1 className="mb-4 font-heading text-4xl font-bold text-secondary md:text-5xl">Live Classes</h1>
          <p className="mx-auto max-w-xl text-secondary/80">Daily interactive sessions conducted via Google Meet by our expert instructors.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2">
            {liveClasses.map((cls) => {
              const course = courses.find((c) => c.id === cls.courseId);
              const isEnrolled = user?.enrolledCourses.includes(cls.courseId);
              return (
                <div key={cls.id} className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="rounded-sm bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{course?.category}</span>
                      <span className="text-xs text-gold flex items-center gap-1"><Video className="h-3 w-3" /> Live Session</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted/10">
                      {cls.thumbnail ? (
                        <>
                          <img src={cls.thumbnail} alt={`${cls.title} thumbnail`} className="h-full w-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="rounded-full bg-black/30 p-2">
                              <Play className="h-4 w-4 text-white" />
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-muted/20">
                          <Play className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading text-base font-semibold text-card-foreground mb-1">{cls.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2 truncate">{cls.description}</p>
                      <div className="text-xs text-muted-foreground flex flex-wrap gap-4 items-center">
                        <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-gold" /> {cls.date}</span>
                        <span className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-gold" /> {cls.time}</span>
                        <span className="flex items-center gap-1.5"><User className="h-3 w-3 text-gold" /> {(cls.instructor || '').split(',')[0]}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 w-40 text-right">
                      {user ? (
                        isEnrolled ? (
                          <a href={cls.meetLink} target="_blank" rel="noopener noreferrer">
                            <Button className="w-full bg-gold text-charcoal hover:bg-gold-dark font-semibold gap-1.5">
                              <ExternalLink className="h-4 w-4" /> Join
                            </Button>
                          </a>
                        ) : (
                          <Link to={`/courses/${cls.courseId}`}>
                            <Button variant="outline" className="w-full border-primary text-primary">Enroll</Button>
                          </Link>
                        )
                      ) : (
                        <Link to="/login">
                          <Button variant="outline" className="w-full border-primary text-primary">Sign in</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LiveClassesPage;
