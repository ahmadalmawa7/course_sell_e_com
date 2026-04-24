import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Navigate } from 'react-router-dom';
import { MessageCircle, Send, HelpCircle, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const SupportPage = () => {
  const { user } = useAuth();
  const { supportTickets, addSupportTicket, addSupportMessage, courses } = useData();
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ subject: '', message: '' });
  const [activeTicket, setActiveTicket] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  if (!user) return <Navigate to="/login" />;

  const myTickets = supportTickets.filter(t => t.userId === user.id);
  const active = myTickets.find(t => t.id === activeTicket);

  const handleCreateTicket = () => {
    if (!newForm.subject || !newForm.message) { toast.error('Please fill all fields.'); return; }
    addSupportTicket({
      id: `st-${Date.now()}`, userId: user.id, userName: user.name, subject: newForm.subject, status: 'open', date: new Date().toISOString().split('T')[0],
      messages: [{ sender: 'user', text: newForm.message, date: new Date().toISOString().split('T')[0] }],
    });
    setNewForm({ subject: '', message: '' });
    setShowNew(false);
    toast.success('Support ticket created!');
  };

  const handleReply = () => {
    if (!replyText || !activeTicket) return;
    addSupportMessage(activeTicket, { sender: 'user', text: replyText, date: new Date().toISOString().split('T')[0] });
    setReplyText('');
    toast.success('Message sent!');
  };

  return (
    <div>
      <section className="bg-gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2 text-xs font-medium tracking-[0.3em] text-gold uppercase">Help Center</p>
          <h1 className="mb-4 font-heading text-4xl font-bold text-secondary md:text-5xl">Support</h1>
          <p className="text-secondary/80">Raise a query or chat with our team</p>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-foreground">My Tickets</h2>
            <Button size="sm" onClick={() => setShowNew(true)}><Plus className="h-4 w-4 mr-1" /> New Ticket</Button>
          </div>

          {showNew && (
            <div className="mb-6 rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-lg font-semibold text-card-foreground">Create New Ticket</h3>
                <button onClick={() => setShowNew(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
              </div>
              <div className="space-y-3">
                <Input value={newForm.subject} onChange={e => setNewForm({ ...newForm, subject: e.target.value })} placeholder="Subject" />
                <Textarea value={newForm.message} onChange={e => setNewForm({ ...newForm, message: e.target.value })} placeholder="Describe your issue..." rows={3} />
                <Button size="sm" onClick={handleCreateTicket}>Submit Ticket</Button>
              </div>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-3">
              {myTickets.length === 0 ? (
                <div className="rounded-lg border border-border bg-card p-8 text-center">
                  <HelpCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No tickets yet.</p>
                </div>
              ) : myTickets.map(t => (
                <button key={t.id} onClick={() => setActiveTicket(t.id)}
                  className={`w-full text-left rounded-lg border p-4 transition-colors ${activeTicket === t.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-gold/50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-card-foreground text-sm">{t.subject}</p>
                    <span className={`rounded-sm px-2 py-0.5 text-xs font-medium ${t.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>{t.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.date} {t.time ? `• ${t.time}` : ''} • {t.messages.length} messages</p>
                  {t.enrolledCourses && t.enrolledCourses.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">Enrolled: {t.enrolledCourses.map((cid: string) => courses.find(c => c.id === cid || c._id === cid)?.title || cid).filter(Boolean).join(', ')}</p>
                  )}
                </button>
              ))}
            </div>

            <div className="md:col-span-2">
                  {active ? (
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  <div className="border-b border-border p-4">
                    <h3 className="font-heading text-base font-semibold text-card-foreground">{active.subject}</h3>
                    <p className="text-xs text-muted-foreground">{active.date} {active.time ? `• ${active.time}` : ''}</p>
                  </div>
                  <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                    {active.messages.map((m, i) => (
                      <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 ${m.sender === 'user' ? 'bg-primary/10 text-card-foreground' : 'bg-muted text-card-foreground'}`}>
                          <p className="text-xs font-medium mb-1">{m.sender === 'user' ? 'You' : 'Admin'}</p>
                          <p className="text-sm">{m.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">{m.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {active.status === 'open' && (
                    <div className="border-t border-border p-3 flex gap-2">
                      <Input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type a message..." onKeyDown={e => e.key === 'Enter' && handleReply()} />
                      <Button size="sm" onClick={handleReply}><Send className="h-4 w-4" /></Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-card p-12 text-center">
                  <MessageCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-muted-foreground">Select a ticket to view conversation</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SupportPage;
