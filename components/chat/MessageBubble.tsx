/**
 * Message Bubble Component
 *
 * Displays individual chat messages with role-based styling.
 * Supports markdown rendering and code syntax highlighting.
 */

'use client';

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { ChatMessage } from '@/types/chat';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'flex w-full gap-2 px-3 py-2',
        isUser && 'flex-row-reverse'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium',
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-slate-900 text-white'
        )}
      >
        {isUser ? 'U' : 'B'}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'flex max-w-[85%] flex-col gap-1',
          isUser && 'items-end'
        )}
      >
        {/* Message Bubble */}
        <div
          className={cn(
            'rounded-lg px-3 py-2 text-sm',
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-900 border border-slate-200',
            isStreaming && 'animate-pulse'
          )}
        >
          {isAssistant ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                components={{
                // Custom code block with syntax highlighting
                code({ node, className, children, ...props }) {
                  // Check if it's an inline code element by looking for newlines
                  const codeContent = String(children);
                  const inline = !codeContent.includes('\n');
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');

                  return !inline && match ? (
                    <div className="relative my-2">
                      <button
                        onClick={() => handleCopyCode(codeString)}
                        className="absolute right-2 top-2 rounded bg-slate-700 p-1.5 hover:bg-slate-600"
                        aria-label="Copy code"
                      >
                        {copiedCode === codeString ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-slate-300" />
                        )}
                      </button>
                      <SyntaxHighlighter
                        style={vscDarkPlus as any}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg"
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code
                      className="rounded bg-slate-700 px-1.5 py-0.5 font-mono text-sm"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                // Style other markdown elements
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="ml-4 list-disc space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="ml-4 list-decimal space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-sm">{children}</li>,
                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline hover:text-blue-300"
                  >
                    {children}
                  </a>
                ),
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
              }}
                >
                  {message.content}
                </ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
          )}
        </div>

        {/* Timestamp */}
        <span className="px-2 text-xs text-slate-500">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </motion.div>
  );
}
