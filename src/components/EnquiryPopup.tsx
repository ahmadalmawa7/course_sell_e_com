import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const EnquiryPopup = () => {
  const [open, setOpen] = useState(false);
  const { addEnquiry } = useData();
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) { toast.error('Please fill all required fields.'); return; }
    addEnquiry({
      id: `e-${Date.now()}`, ...form,
      date: new Date().toISOString().split('T')[0], status: 'new',
    });
    toast.success('Enquiry submitted successfully! We will contact you soon.');
    setForm({ name: '', phone: '', email: '', message: '' });
    setOpen(false);
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors">
      <MessageSquare className="h-6 w-6" />
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
      <div className="w-full max-w-md rounded-lg bg-card shadow-2xl overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-hero p-5 text-center relative">
          <button onClick={() => setOpen(false)} className="absolute right-3 top-3 text-secondary/60 hover:text-secondary"><X className="h-5 w-5" /></button>
          <p className="text-xs tracking-[0.3em] text-gold uppercase font-medium mb-1">Erudition Infinite</p>
          <h3 className="font-heading text-xl font-bold text-secondary">Get in Touch</h3>
          <p className="text-sm text-secondary/70 mt-1">Let us help you achieve your goals</p>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Name *</label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone *</label>
            <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Email *</label>
            <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Message</label>
            <Textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Tell us how we can help..." rows={3} />
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
            Submit Enquiry
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EnquiryPopup;
