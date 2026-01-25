'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { MessageSquare, X, Send, Loader2, ExternalLink } from 'lucide-react';
import React, { useState, useRef, useEffect, FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Helper to parse and render URLs as clickable links
function renderWithLinks(text: string): React.ReactNode {
  // Match markdown links [title](url) or raw URLs
  const urlRegex =
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)?|(?<![(\[])(https?:\/\/[^\s)\]]+)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const title = match[1]; // From markdown link
    const mdUrl = match[2]; // URL from markdown link
    const rawUrl = match[3]; // Raw URL

    const url = mdUrl || rawUrl;
    const displayText = title || url;

    parts.push(
      <a
        key={match.index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gold-dark hover:underline font-medium break-all inline-flex items-center gap-1"
      >
        {displayText}
        <ExternalLink className="h-3 w-3 text-gold" />
      </a>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export function GoldChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-primary text-primary-foreground hover:bg-gold-dark z-60 transition-all duration-300 hover:scale-105 flex items-center justify-center"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
      </button>

      {isOpen && (
        <div className="fixed top-4 left-4 right-4 bottom-24 md:inset-auto md:bottom-24 md:right-6 md:w-115.5 md:h-180 bg-background border border-gold-light/30 rounded-2xl shadow-2xl flex flex-col z-50 animate-fade-up overflow-hidden">
          <div className="p-4 bg-primary text-primary-foreground flex flex-col">
            <h3 className="font-bold text-lg">The Gold Consultant</h3>
            <p className="text-xs text-gold-light/80">
              Powered by AI & Live Data
            </p>
          </div>

          <div
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20"
            ref={scrollRef}
          >
            {messages.length === 0 && (
              <div className="text-center text-sm text-muted-foreground mt-10 p-4">
                <p>Hi! I am your AI Analyst.</p>
                <p className="mt-2">Ask me anything like:</p>
                <div className="mt-4 space-y-2">
                  <button
                    type="button"
                    onClick={() => setInput('Is now a good time to buy?')}
                    className="block w-full text-xs border border-gold/20 bg-white p-2 rounded hover:bg-gold-light/10 text-left"
                  >
                    &quot;Is now a good time to buy?&quot;
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput('Physical gold vs Digital gold?')}
                    className="block w-full text-xs border border-gold/20 bg-white p-2 rounded hover:bg-gold-light/10 text-left"
                  >
                    &quot;Physical gold vs Digital gold?&quot;
                  </button>
                </div>
              </div>
            )}

            {messages.map((m) => {
              const textContent =
                m.parts
                  ?.filter(
                    (part): part is { type: 'text'; text: string } =>
                      part.type === 'text'
                  )
                  .map((part) => part.text)
                  .join('') || '';

              const isRefusal =
                m.role === 'assistant' &&
                textContent
                  .toLowerCase()
                  .includes('i only discuss gold and financial markets');

              const showDisclaimer = m.role === 'assistant' && !isRefusal;

              // Split content and sources section
              const sourcesMatch = textContent.match(
                /\n?\*?\*?Sources:?\*?\*?\n?([\s\S]*?)$/i
              );
              const mainContent = sourcesMatch
                ? textContent.replace(sourcesMatch[0], '').trim()
                : textContent;
              const sourcesContent = sourcesMatch
                ? sourcesMatch[1].trim()
                : null;

              return (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                      m.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-white border border-gold-light/20 text-foreground rounded-tl-none'
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        strong: ({ children }) => (
                          <span className="font-bold text-gold-dark">
                            {children}
                          </span>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-4 my-1">{children}</ul>
                        ),
                        li: ({ children }) => (
                          <li className="my-0.5">{children}</li>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gold-dark hover:underline font-medium break-all inline-flex items-center gap-1"
                          >
                            {children}
                            <ExternalLink className="h-3 w-3 text-gold" />
                          </a>
                        ),
                      }}
                    >
                      {mainContent}
                    </ReactMarkdown>
                    {sourcesContent && (
                      <div className="mt-3 pt-2 border-t border-gold-light/20 text-[10px] text-muted-foreground">
                        <span className="font-semibold">Sources: </span>
                        <span className="block">
                          {renderWithLinks(sourcesContent)}
                        </span>
                      </div>
                    )}
                    {showDisclaimer && (
                      <p
                        className={`text-[10px] text-muted-foreground italic ${sourcesContent ? 'mt-1' : 'mt-3 pt-2 border-t border-gold-light/20'}`}
                      >
                        Not a financial advice.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gold-light/20 px-4 py-2 rounded-2xl rounded-tl-none">
                  <Loader2 className="h-4 w-4 animate-spin text-gold" />
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-4 bg-background border-t border-gold-light/20 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about gold..."
              className="flex-1 bg-muted/10 border border-gold-light/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-primary hover:bg-gold-dark text-primary-foreground p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
