import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => (
  <footer className="border-t border-border bg-footer text-secondary">
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <img src="/Logo.png" alt="Erudition Infinite Logo" className="h-12 w-auto" />
            <div className="flex flex-col">
              <div className="flex items-start gap-0.5">
                <span className="font-serif text-xl font-bold leading-tight text-[#b30000]">ERUDITION INFINITE</span>
                <span className="font-serif text-xs font-bold text-black leading-none">®</span>
              </div>
              <span className="text-xs italic text-[#777]">Integrating talent, thought and action.</span>
            </div>
          </div>
          <p className="text-sm text-secondary/70 leading-relaxed">
            A premier institute for corporate training, leadership development, and management consultancy.
          </p>
          {/* ── SILICONINDIA BADGE ── */}
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded border border-secondary/20 px-2.5 py-1 text-xs text-secondary/60">
              🏆 Top 10 Workforce Development Co. · SiliconIndia 2021
            </span>
          </div>
          {/* ── END BADGE ── */}
        </div>

        <div>
          <h4 className="mb-4 font-heading text-sm font-semibold text-gold">Quick Links</h4>
          <div className="flex flex-col gap-2">
            {['About', 'Courses', 'Live Classes', 'Articles'].map((item) => (
              <Link key={item} to={`/${item.toLowerCase().replace(' ', '-')}`} className="text-sm text-secondary/70 transition-colors hover:text-gold">
                {item}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-heading text-sm font-semibold text-gold">Programs</h4>
          <div className="flex flex-col gap-2">
            {['Leadership Development', 'Communication Skills', 'Personality Development', 'Campus to Corporate'].map((item) => (
              <span key={item} className="text-sm text-secondary/70">{item}</span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-heading text-sm font-semibold text-gold">Contact</h4>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-secondary/70">
              <Phone className="h-4 w-4 text-gold" />
              +91 9890461942
            </div>
            <div className="flex items-center gap-2 text-sm text-secondary/70">
              <Mail className="h-4 w-4 text-gold" />
              <a href="mailto:info@eruditioninfinite.com" className="transition-colors hover:text-gold">info@eruditioninfinite.com</a>
            </div>
            <div className="flex items-center gap-2 text-sm text-secondary/70">
              <Mail className="h-4 w-4 text-gold" />
              <a href="mailto:shreeshkumar@gmail.com" className="transition-colors hover:text-gold">shreeshkumar@gmail.com</a>
            </div>
            <div className="flex items-start gap-2 text-sm text-secondary/70">
              <MapPin className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
              <div className="leading-relaxed">
                B-1/703 Whistling Palms<br />
                Aundh-Hinjewadi Road<br />
                Mankar chowk, Wakad<br />
                Pune 411057
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-secondary/20 pt-6 text-center text-xs text-secondary/50">
        © {new Date().getFullYear()} Erudition Infinite. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
