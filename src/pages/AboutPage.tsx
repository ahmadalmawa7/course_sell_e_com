import { Award, Target, BookOpen, Users, Briefcase, GraduationCap, TrendingUp, Heart } from 'lucide-react';

const AboutPage = () => (
  <div>
    {/* Hero */}
    <section className="bg-gradient-hero py-20">
      <div className="container mx-auto px-4 text-center">
        <p className="mb-2 text-xs font-medium tracking-[0.3em] text-gold uppercase">Est. 2009</p>
        <h1 className="mb-4 font-heading text-4xl font-bold text-secondary md:text-5xl">Erudition Infinite</h1>
        <p className="mx-auto max-w-2xl text-secondary/80 leading-relaxed">
          A premier institute dedicated to workforce development, leadership training, and personality development — helping individuals and companies build skills, improve performance, and achieve long-term goals.
        </p>
      </div>
    </section>

    {/* About Content */}
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <p className="mb-2 text-xs font-medium tracking-[0.3em] text-gold uppercase">Who We Are</p>
              <h2 className="mb-6 font-heading text-3xl font-bold text-foreground">About Erudition Infinite</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                At <strong className="text-primary">Erudition Infinite</strong> we strive to <strong className="text-primary">nurture and shape aspirants' talents and personalities</strong>. We are committed to offer solutions to our esteemed clients after <strong className="text-primary">studying their area of business and analysing their needs</strong>. We deliver customized <strong className="text-primary">training</strong> and <strong className="text-primary">management</strong> development programs for corporates, government and private organisations, as well as for students of management, engineering and other professional institutes/establishments.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Erudition Infinite offers <strong className="text-primary">consultancy</strong> in training, <strong className="text-primary">management</strong> development, project management, <strong className="text-primary">ISO 9001:2008</strong>, subject research and report, and guidance to <strong className="text-primary">MBA</strong> and <strong className="text-primary">engineering students</strong> for final year projects. With our panel of <strong className="text-primary">qualified professionals</strong>, who are also highly experienced domain experts, we shall endeavour to deliver solutions to completely satisfy and delight the client.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Users, value: '4,000+', label: 'Professionals Trained' },
                { icon: Briefcase, value: '15+', label: 'Years Experience' },
                { icon: BookOpen, value: '10+', label: 'Training Programs' },
                { icon: GraduationCap, value: '2,500+', label: 'Certifications Issued' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="rounded-lg border border-border bg-card p-5 text-center">
                  <Icon className="mx-auto mb-2 h-6 w-6 text-gold" />
                  <p className="font-heading text-2xl font-bold text-card-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Vision & Mission */}
    <section className="bg-cream py-16">
      <div className="container mx-auto grid gap-8 px-4 md:grid-cols-2 max-w-4xl">
        <div className="rounded-lg border border-border bg-card p-8">
          <Target className="mb-4 h-8 w-8 text-gold" />
          <h2 className="mb-3 font-heading text-2xl font-bold text-card-foreground">Our Vision</h2>
          <p className="text-muted-foreground leading-relaxed">
            To become a leader in the training and development and management consulting domain.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-8">
          <Heart className="mb-4 h-8 w-8 text-gold" />
          <h2 className="mb-3 font-heading text-2xl font-bold text-card-foreground">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            To deliver training and management solutions to the total satisfaction and delight of the customer and exceed expectations.
          </p>
        </div>
      </div>
    </section>

    {/* Training Philosophy */}
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-2 text-xs font-medium tracking-[0.3em] text-gold uppercase">Our Approach</p>
          <h2 className="mb-6 font-heading text-3xl font-bold text-foreground">Training Philosophy</h2>
          <p className="mb-8 text-muted-foreground leading-relaxed">
            At Erudition Infinite, we believe that true learning happens at the intersection of theory and practice. Our training methodology draws from military leadership principles, corporate best practices, and behavioral science research.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: BookOpen, title: 'Experiential Learning', desc: 'Learning by doing through simulations, case studies, and real-world scenarios.' },
              { icon: Users, title: 'Collaborative Growth', desc: 'Peer learning and group activities that build teamwork and communication.' },
              { icon: Award, title: 'Measurable Outcomes', desc: 'Every program has defined learning objectives with assessable outcomes.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-lg border border-border bg-card p-6">
                <Icon className="mb-3 h-6 w-6 text-gold" />
                <h3 className="mb-2 font-heading text-base font-semibold text-card-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* Programs */}
    <section className="bg-cream py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-medium tracking-[0.3em] text-gold uppercase">What We Offer</p>
          <h2 className="font-heading text-3xl font-bold text-foreground">Our Programs</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 max-w-5xl mx-auto">
          {[
            'Communication Skills', 'Leadership Development', 'Personality Development', 'Time Management',
            'Business Etiquette', 'Corporate Training', 'Campus to Corporate', 'Presentation Skills',
            'Management Consultancy', 'Training & Development', 'Organization Development', 'Project Management',
            'Life Skills', 'Train the Trainer'
          ].map((service) => (
            <div key={service} className="rounded-lg border border-border bg-card px-5 py-4 text-center transition-colors hover:border-gold/50 hover:shadow-sm">
              <p className="text-sm font-medium text-card-foreground">{service}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Founder */}
    <section className="bg-gradient-hero py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <div className="grid gap-8 md:grid-cols-3 items-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-gold/20 border-2 border-gold/30">
                <Users className="h-16 w-16 text-gold" />
              </div>
              <h2 className="font-heading text-xl font-bold text-secondary">Lt Col Shreesh Kumar</h2>
              <p className="text-sm text-gold">(Retd) BTech M.E. (IISc)</p>
              <p className="text-xs text-secondary/60 mt-1">Founder & CEO</p>
            </div>
            <div className="md:col-span-2">
              <p className="mb-2 text-xs font-medium tracking-[0.3em] text-gold uppercase">Founder Profile</p>
              <h3 className="mb-4 font-heading text-2xl font-bold text-secondary">A Leader Who Shapes Leaders</h3>
              <p className="text-secondary/80 leading-relaxed mb-3">
                Lt Col Shreesh Kumar is an Army veteran with <strong className="text-secondary">21+ years of service</strong> and extensive corporate experience. He specializes in leadership, training, and organizational development.
              </p>
              <p className="text-secondary/80 leading-relaxed mb-3">
                His unique approach combines military discipline, strategic thinking, and corporate acumen to deliver transformative training programs that have impacted thousands of professionals across India.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {['Leadership', 'Training', 'Strategy', 'OD Consulting', 'L&D'].map(tag => (
                  <span key={tag} className="rounded-full bg-gold/20 px-3 py-1 text-xs font-medium text-gold">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default AboutPage;
