import React, { useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';

const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

const BotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
);

const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
);

interface ChatInterfaceProps {
    history: ChatMessage[];
    onSendMessage: () => void;
    isLoading: boolean;
    message: string;
    setMessage: (message: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ history, onSendMessage, isLoading, message, setMessage }) => {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [history, isLoading]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSendMessage();
      }
    };

    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col bg-surface dark:bg-dark-surface shadow-sm flex-grow">
            <div className="flex-grow overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {history.map((msg, index) => {
                    const isLastMessage = index === history.length - 1;
                    const isModelStreaming = isLastMessage && msg.role === 'model' && isLoading;

                    return (
                        <div key={index} className={`flex items-start gap-3 max-w-xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-slate-600 text-white'}`}>
                                {msg.role === 'user' ? <UserIcon className="w-5 h-5" /> : <BotIcon className="w-5 h-5" />}
                            </div>
                            <div className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                <p className="text-sm text-text-primary dark:text-dark-text-primary whitespace-pre-wrap">
                                    {msg.content}
                                    {isModelStreaming && <span className="inline-block w-2 h-4 bg-slate-700 dark:bg-slate-300 ml-1 blinking-cursor" aria-hidden="true"></span>}
                                </p>
                            </div>
                        </div>
                    );
                })}
                 <div ref={messagesEndRef} />
            </div>
            <div className="mt-auto p-4 flex items-center gap-2 border-t border-slate-200 dark:border-slate-700">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question..."
                    disabled={isLoading}
                    rows={1}
                    className="flex-grow resize-none w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-inner focus:ring-2 focus:ring-primary focus:border-primary transition duration-200 bg-background dark:bg-dark-background text-text-primary dark:text-dark-text-primary disabled:opacity-50"
                    aria-label="Chat message input"
                />
                <button
                    onClick={onSendMessage}
                    disabled={isLoading || !message.trim()}
                    className="bg-primary hover:bg-primary-hover disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold p-2.5 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
                    aria-label="Send message"
                >
                    <SendIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>
    );
};