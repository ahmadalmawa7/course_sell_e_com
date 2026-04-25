import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

export interface SupportMessage {
  sender: 'user' | 'admin';
  text: string;
  date: string;
}

interface SupportChatProps {
  messages: SupportMessage[];
  replyText: string;
  onReplyChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const SupportChat = ({
  messages,
  replyText,
  onReplyChange,
  onSubmit,
  disabled,
  placeholder = 'Write a message...'
}: SupportChatProps) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">Conversation</p>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-slate-600">{messages.length} messages</span>
      </div>
      <div className="space-y-3 overflow-y-auto pb-2">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-[28px] px-4 py-3 ${message.sender === 'user' ? 'bg-rose-50 text-rose-900 border border-rose-100' : 'bg-slate-100 text-slate-900'}`}>
              <div className="mb-2 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.15em] text-slate-500">
                <span>{message.sender === 'user' ? 'You' : 'Admin'}</span>
                <span>{message.date}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <div className="flex gap-2">
          <Input
            value={replyText}
            onChange={e => onReplyChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
          />
          <Button size="sm" variant="secondary" onClick={onSubmit} disabled={disabled || !replyText.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {disabled && (
          <p className="mt-2 text-sm text-slate-500">This ticket is closed. Replies are disabled.</p>
        )}
      </div>
    </div>
  );
};

export default SupportChat;
