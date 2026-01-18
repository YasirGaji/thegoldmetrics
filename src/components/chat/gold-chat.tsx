'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect, FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-primary text-primary-foreground hover:bg-gold-dark z-50 transition-all duration-300 hover:scale-105 flex items-center justify-center"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[90vw] md:w-100 h-125 bg-background border border-gold-light/30 rounded-2xl shadow-2xl flex flex-col z-50 animate-fade-up overflow-hidden">
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
                      }}
                    >
                      {textContent}
                    </ReactMarkdown>
                    {showDisclaimer && (
                      <p className="mt-3 pt-2 border-t border-gold-light/20 text-[10px] text-muted-foreground italic">
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
