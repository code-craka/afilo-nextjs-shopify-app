/**
 * Message Input Component
 *
 * Text input with send button for chat messages.
 * Supports Enter to send, Shift+Enter for new line.
 */

'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSendMessage,
  disabled = false,
  placeholder = 'Type your message...',
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSendMessage(trimmedMessage);
      setMessage('');

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('[MessageInput] Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const isDisabled = disabled || isSending;

  return (
    <div className="flex items-end gap-2 border-t border-slate-700 bg-slate-900 p-4">
      {/* Text Input */}
      <textarea
        ref={textareaRef}
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isDisabled}
        rows={1}
        className={cn(
          'flex-1 resize-none rounded-lg bg-slate-800 px-4 py-3 text-sm text-slate-100 placeholder-slate-500',
          'border border-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'max-h-[120px] overflow-y-auto'
        )}
      />

      {/* Send Button */}
      <Button
        onClick={handleSend}
        disabled={isDisabled || !message.trim()}
        size="icon"
        className={cn(
          'h-11 w-11 shrink-0 rounded-lg',
          'bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500',
          'transition-colors'
        )}
        aria-label="Send message"
      >
        {isSending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
