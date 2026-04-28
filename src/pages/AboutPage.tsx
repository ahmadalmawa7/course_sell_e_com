import { Award, Target, BookOpen, Users, Briefcase, GraduationCap, TrendingUp, Heart, Brain, CheckCircle } from 'lucide-react';

const trainingAreas = [
  'Communication Skills',
  'Leadership Development',
  'Presentation Skills',
  'Time Management',
  'Business Etiquette',
  'Life Skills',
  'Train the Trainer',
  'Project Management',
  'Campus to Corporate Transition',
  'Building Resilience',
  'Team Building',
  'Conflict Management',
  'Cost Management',
  'Public Speaking',
  'Problem Solving',
  'Crisis Management',
];

const approachItems = [
  {
    icon: Brain,
    title: 'SWOT Analysis',
    desc: "Use of tools like SWOT analysis in conjunction with reflections on own life experiences, as aids to helping individuals find their mojo.",
  },
  {
    icon: Target,
    title: 'Self-Awareness & Goal Setting',
    desc: "Bringing about awareness of the significance of one's role at a personal level and in the organization's scheme of things is a critical deliverable in the Firm's T & D process.",
  },
  {
    icon: TrendingUp,
    title: 'Continuous Learning',
    desc: "The focus is on helping to navigate the thought process and then spurring oneself to align with one's desired personal or organizational goals.",
  },
  {
    icon: Users,
    title: 'Multiple Intelligences',
    desc: 'The concept of multiple intelligences helps individuals develop attitudes that will help them acquire knowledge and skills, apply them correctly, and learn from experience.',
  },
];

const HelpingOthersSection = () => (
  <>
    {/* Helping Others to Succeed */}
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-medium tracking-[0.3em] text-gold uppercase">Our Purpose</p>
            <h2 className="mb-4 font-heading text-3xl font-bold text-foreground">
              Helping Others to Succeed
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground leading-relaxed">
              Erudition Infinite emphasizes bringing out the best in an individual or organization by helping them to identify their talents, set and accomplish goals, and succeed in their endeavors.
            </p>
          </div>

          {/* Approach grid */}
          <div className="mb-12 grid gap-6 md:grid-cols-2">
            {approachItems.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 rounded-lg border border-border bg-card p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10">
                  <Icon className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h3 className="mb-1 font-heading text-base font-semibold text-card-foreground">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Personality development callout */}
          <div className="mb-12 rounded-lg border border-gold/30 bg-gold/5 p-6">
            <div className="flex items-start gap-4">
              <Heart className="h-6 w-6 shrink-0 text-gold mt-0.5" />
              <div>
                <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">
                  Flagship Service: Personality Development
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  "Personality encompasses an infinite number of contributing factors. Individuals have to adapt to develop attitudes that will help them acquire knowledge and skills, apply them correctly, and learn from experience to permanently imbibe the most critical positive attributes." In this program, we cover topics like integrity, self-motivation, goal setting, empathy, discipline, adaptability, effective communication, the pursuit of knowledge and excellence, presentation skills, etiquette, time and stress management, interpersonal relations, work-life balance, cross-cultural interaction, entrepreneurial skills, effective and ethical leadership, and many more.
                </p>
                <p className="mt-3 text-xs font-semibold text-gold">
                  — Lt Col Shreesh Kumar (Retd), Founder & CEO
                </p>
              </div>
            </div>
          </div>

          {/* OD Solutions */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              <BookOpen className="h-6 w-6 shrink-0 text-gold mt-0.5" />
              <div>
                <h3 className="mb-2 font-heading text-lg font-semibold text-card-foreground">
                  Organizational Development Solutions
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Besides development programs, Erudition Infinite also offers organizational development solutions, thinking ahead from individual to the corporate entity. Performing a needs analysis by looking at core business processes data, employees' expertise, perceived deficiencies, desired and actual outcomes, the Firm provides tailor-made re-organization solutions and customized programs to their clients. Col Kumar's operational army combat experience and leadership stints in Corporate help steer the Firm's pursuit of excellence. Delivery of solutions in a non-contact manner via online platforms is also an option.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Training Areas */}
    <section className="bg-cream py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-medium tracking-[0.3em] text-gold uppercase">Comprehensive Coverage</p>
            <h2 className="font-heading text-3xl font-bold text-foreground">Training Areas</h2>
            <p className="mt-3 text-muted-foreground">
              Our interactive training aims to transform, make good team players and leaders, evolve value systems to live by and share those learnings and mentor others.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {trainingAreas.map(area => (
              <div
                key={area}
                className="rounded-lg border border-border bg-card px-4 py-3 text-center text-sm font-medium text-card-foreground transition-colors hover:border-gold/50 hover:text-primary"
              >
                {area}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  </>
);

const RecognitionSection = () => (
  <section className="bg-gradient-hero py-16">
    <div className="container mx-auto px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-medium tracking-[0.3em] text-gold uppercase">Industry Recognition</p>
          <h2 className="mb-4 font-heading text-3xl font-bold text-secondary">
            Recognized Among Top Workforce Development Companies
          </h2>
          <div className="mx-auto flex max-w-xl items-center gap-3 rounded-lg border border-gold/30 bg-gold/10 px-5 py-3">
            <Award className="h-6 w-6 shrink-0 text-gold" />
            <p className="text-sm font-semibold text-secondary">
              SiliconIndia — 10 Most Promising Workforce Development Companies – 2021
            </p>
          </div>
        </div>

        {/* Magazine callout */}
        <div className="mb-10 rounded-lg border border-gold/20 bg-secondary/5 p-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            SiliconIndia Cover Feature · June 2021
          </p>
          <blockquote className="mb-4 font-heading text-xl font-semibold italic leading-relaxed text-secondary">
            "Striving to guide people and organizations to succeed in their roles and accomplish objectives and long-term life goals."
          </blockquote>
          <p className="text-sm text-secondary/70">
            Erudition Infinite — <span className="text-gold">Lt Col Shreesh Kumar (Retd), Founder & CEO</span>
          </p>
        </div>

        {/* Description from magazine table */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-secondary/10 bg-secondary/5 p-6">
            <h3 className="mb-3 font-heading text-lg font-semibold text-secondary">
              What SiliconIndia Said
            </h3>
            <p className="text-sm leading-relaxed text-secondary/80">
              "Strives to nurture and shape aspirants' talents and personalities. Erudition Infinite is always ready to offer solutions to corporate entities after studying their area of business and identifying their needs."
            </p>
          </div>
          <div className="rounded-lg border border-secondary/10 bg-secondary/5 p-6">
            <h3 className="mb-3 font-heading text-lg font-semibold text-secondary">
              Our Credentials
            </h3>
            <ul className="space-y-2 text-sm text-secondary/80">
              {[
                'BCMS ISO 22301:2019 Certified',
                'ISMS 27001:2013 Certified',
                'Certified AMFI',
                'Certified Corporate Trainer',
                'National Defence Academy Graduate',
                'M.E. from IISc Bengaluru',
              ].map(cred => (
                <li key={cred} className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 shrink-0 text-gold" />
                  {cred}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
);

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

    {/* ── SILICONINDIA RECOGNITION BLOCK ── */}
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border border-border bg-card p-8 md:flex md:gap-8 md:items-start">
            <div className="mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/20 md:mb-0">
              <Award className="h-6 w-6 text-gold" />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium tracking-[0.3em] text-gold uppercase">External Recognition · June 2021</p>
              <h3 className="mb-3 font-heading text-xl font-bold text-card-foreground">
                Named Among India's Top 10 Workforce Development Companies
              </h3>
              <p className="mb-4 text-muted-foreground leading-relaxed text-sm">
                SiliconIndia Magazine — one of India's leading business and technology publications — recognised Erudition Infinite in its annual feature on the most promising workforce development companies in the country. The feature highlighted our commitment to building future-ready professionals through outcome-focused, customised training programs at a time when the skills gap had never been more critical.
              </p>
              <blockquote className="mb-4 border-l-2 border-gold pl-4 text-sm italic text-muted-foreground">
                "This recognition reaffirms what our learners and clients already know — that meaningful workforce transformation starts with a partner deeply invested in outcomes, not just content delivery."
              </blockquote>
              <a
                href="https://www.siliconindia.com/digital-magazine/workforce-development-companies-june-2021/#page=14"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Read the Feature →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
    {/* ── END RECOGNITION BLOCK ── */}

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

    {/* Helping Others Section */}
    <HelpingOthersSection />

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

    {/* Recognition Section */}
    <RecognitionSection />
  </div>
);

export default AboutPage;
