/**
 * Claude.ai-Style Message Bubble
 *
 * Clean, minimal message bubbles inspired by Claude.ai
 * - Full-width messages with avatar
 * - No background bubbles, just clean text
 * - Markdown support for formatting
 * - Streaming animation
 */

'use client';

import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/chat';
import { User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={cn(
        'group px-6 py-4',
        isUser && 'bg-white dark:bg-slate-950',
        isAssistant && 'bg-slate-50 dark:bg-slate-900/50'
      )}
    >
      <div className="mx-auto flex max-w-3xl gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {isUser ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              <User className="h-4 w-4" strokeWidth={2} />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600 shadow-sm">
              <span className="text-xs font-bold text-white">A</span>
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0 pt-1">
          {/* Role Label */}
          <div className="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {isUser ? 'You' : 'Afilo Assistant'}
          </div>

          {/* Message Text */}
          <div
            className={cn(
              'prose prose-sm dark:prose-invert max-w-none',
              'prose-p:leading-relaxed prose-p:my-2',
              'prose-headings:font-semibold prose-headings:text-slate-900 dark:prose-headings:text-slate-100',
              'prose-a:text-orange-600 dark:prose-a:text-orange-400 prose-a:no-underline hover:prose-a:underline',
              'prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
              'prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-700',
              'prose-ul:my-2 prose-ol:my-2',
              'prose-li:my-1',
              isStreaming && 'animate-pulse'
            )}
          >
            {isUser ? (
              // User messages: plain text
              <p className="whitespace-pre-wrap text-slate-900 dark:text-slate-100">
                {message.content}
              </p>
            ) : (
              // Assistant messages: render markdown
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Custom link component
                  a: ({ node, ...props }) => (
                    <a
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 dark:text-orange-400 hover:underline"
                    />
                  ),
                  // Custom code component
                  code: ({ node, inline, className, children, ...props }: any) => {
                    return inline ? (
                      <code
                        className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-sm font-mono text-slate-900 dark:text-slate-100"
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <code
                        className="block rounded bg-slate-100 dark:bg-slate-800 p-3 text-sm font-mono text-slate-900 dark:text-slate-100 overflow-x-auto"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>

          {/* Streaming Indicator */}
          {isStreaming && (
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex gap-1">
                <span className="inline-block h-1 w-1 animate-bounce rounded-full bg-orange-500 [animation-delay:-0.3s]"></span>
                <span className="inline-block h-1 w-1 animate-bounce rounded-full bg-orange-500 [animation-delay:-0.15s]"></span>
                <span className="inline-block h-1 w-1 animate-bounce rounded-full bg-orange-500"></span>
              </div>
              <span>Generating response</span>
            </div>
          )}

          {/* Timestamp (for completed messages) */}
          {!isStreaming && message.createdAt && (
            <div className="mt-2 text-xs text-slate-400 dark:text-slate-600">
              {new Date(message.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
