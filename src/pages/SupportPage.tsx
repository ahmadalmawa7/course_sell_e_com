import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { HelpCircle, MessageCircle, Plus, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';
import SupportChat from '@/components/SupportChat';

const SupportPage = () => {
  const { user } = useAuth();
  const { supportTickets, addSupportTicket, addSupportMessage, courses } = useData();
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ subject: '', message: '' });
  const [activeTicket, setActiveTicket] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isChatHidden, setIsChatHidden] = useState(false);

  if (!user) return <Navigate to="/login" />;

  const myTickets = supportTickets.filter(t => t.userId === user.id);
  const active = myTickets.find(t => t.id === activeTicket) || myTickets[0] || null;

  useEffect(() => {
    if (!activeTicket && myTickets.length > 0) {
      setActiveTicket(myTickets[0].id);
    }
  }, [myTickets, activeTicket]);

  const handleCreateTicket = () => {
    if (!newForm.subject.trim() || !newForm.message.trim()) {
      toast.error('Please fill all fields.');
      return;
    }

    addSupportTicket({
      id: `st-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      subject: newForm.subject.trim(),
      description: newForm.message.trim(),
      status: 'open',
      date: new Date().toISOString().split('T')[0],
      messages: [{ sender: 'user', text: newForm.message.trim(), date: new Date().toISOString().split('T')[0] }],
    });

    setNewForm({ subject: '', message: '' });
    setShowNew(false);
    toast.success('Support ticket created.');
  };

  const handleReply = () => {
    if (!active || !replyText.trim()) return;
    addSupportMessage(active.id, { sender: 'user', text: replyText.trim(), date: new Date().toISOString().split('T')[0] });
    setReplyText('');
    toast.success('Message sent.');
  };

  return (
    <div>
      <section className="bg-gradient-hero py-14 text-white">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-slate-300">Help Center</p>
          <h1 className="text-4xl font-semibold md:text-5xl">Support</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-200">Chat with our team, track your current requests, and get quick responses.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">My Tickets</h2>
              <p className="text-sm text-slate-600">Open a ticket and continue the conversation in one place.</p>
            </div>
            <Button size="sm" onClick={() => setShowNew(true)}>
              <Plus className="h-4 w-4" /> New Ticket
            </Button>
          </div>

          {showNew && (
            <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Create a new ticket</h3>
                  <p className="mt-1 text-sm text-slate-600">Describe your issue and our admin team will respond promptly.</p>
                </div>
                <button className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100" onClick={() => setShowNew(false)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Input
                  value={newForm.subject}
                  onChange={e => setNewForm({ ...newForm, subject: e.target.value })}
                  placeholder="Subject"
                />
                <Textarea
                  value={newForm.message}
                  onChange={e => setNewForm({ ...newForm, message: e.target.value })}
                  placeholder="Describe your issue..."
                  rows={4}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <Button size="sm" onClick={handleCreateTicket}>Submit Ticket</Button>
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="space-y-4">
              {myTickets.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
                  <HelpCircle className="mx-auto mb-3 h-10 w-10 text-slate-500" />
                  <p className="text-sm text-slate-600">You haven't created any tickets yet.</p>
                </div>
              ) : (
                myTickets.map(ticket => (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => setActiveTicket(ticket.id)}
                    className={`w-full rounded-3xl border p-5 text-left transition ${active?.id === ticket.id ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{ticket.subject}</p>
                        <p className="mt-1 text-xs text-slate-500">{ticket.userName} • {ticket.date}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ticket.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{ticket.status}</span>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-600 line-clamp-2">{ticket.messages[ticket.messages.length - 1]?.text || ticket.description || 'No messages yet'}</p>
                  </button>
                ))
              )}
            </div>

            <div>
              {active ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{active.subject}</p>
                      <p className="mt-1 text-xs text-slate-500">Created on {active.date}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsChatHidden(prev => !prev)}
                        className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                      >
                        {isChatHidden ? 'Show Chat' : 'Hide Chat'}
                      </button>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${active.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{active.status}</span>
                    </div>
                  </div>

                  <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-700">Description</p>
                    <p className="mt-2 text-sm text-slate-600">{active.description || 'No description available.'}</p>
                  </div>

                  <div className="mt-5">
                    {isChatHidden ? (
                      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
                        <p className="text-sm font-medium">Chat is hidden.</p>
                        <p className="mt-2 text-sm">Tap “Show Chat” to continue the conversation.</p>
                      </div>
                    ) : (
                      <SupportChat
                        messages={active.messages}
                        replyText={replyText}
                        onReplyChange={setReplyText}
                        onSubmit={handleReply}
                        disabled={active.status === 'closed'}
                        placeholder="Write a reply..."
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
                  <MessageCircle className="mx-auto mb-4 h-12 w-12" />
                  <p className="text-sm">Select a ticket to see the conversation.</p>
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
