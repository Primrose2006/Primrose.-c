
import React, { useState, useCallback } from 'react';
import { streamChatResponse } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { ChatInterface } from './ChatInterface';

const PassportIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
);

const BuildingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
);

const VoteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 12 2 2 4-4"/><path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"/><path d="M22 19H2"/></svg>
);

const commonDocuments = [
  {
    icon: PassportIcon,
    title: 'Passport Application (DS-11)',
    description: 'Required for U.S. citizens to travel internationally. Used for first-time applicants, minors, and non-routine renewals.',
  },
  {
    icon: BuildingIcon,
    title: 'Employer ID Number (EIN) Application (SS-4)',
    description: 'Used by business entities to apply for a tax identification number from the IRS.',
  },
  {
    icon: VoteIcon,
    title: 'Voter Registration Application',
    description: 'The national mail-in form for citizens to register to vote in federal elections.',
  },
];


const GREETING_MESSAGE = "Hello! I can help you find the government documents you might need. What are you trying to accomplish? For example, are you starting a business, planning to travel, or applying for benefits?";

export const GovernmentHub: React.FC = () => {
    const [history, setHistory] = useState<ChatMessage[]>([
        { role: 'model', content: GREETING_MESSAGE }
    ]);
    const [message, setMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSendMessage = useCallback(async () => {
        if (!message.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: message };
        const historyForApi = [...history, userMessage];
        
        setHistory(prev => [...prev, userMessage, { role: 'model', content: '' }]);
        setIsLoading(true);
        setError(null);
        setMessage('');

        try {
            await streamChatResponse(
                historyForApi, 
                '', 
                'hub',
                (chunk) => {
                    setHistory(prev => {
                        if (prev.length > 0 && prev[prev.length - 1].role === 'model') {
                            const lastMessage = prev[prev.length - 1];
                            const updatedLastMessage = { ...lastMessage, content: lastMessage.content + chunk };
                            return [...prev.slice(0, -1), updatedLastMessage];
                        }
                        return prev;
                    });
                }
            );
        } catch (err) {
            console.error('Error sending hub message:', err);
            const errorMessage = "Sorry, an error occurred. Please try sending your message again.";
            setError(errorMessage);
            setHistory(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.role === 'model' && lastMessage.content === '') {
                    const updatedLastMessage = { ...lastMessage, content: "I seem to be having trouble connecting. Please try again." };
                    return [...prev.slice(0, -1), updatedLastMessage];
                }
                return prev;
            });
        } finally {
            setIsLoading(false);
        }
    }, [history, message, isLoading]);

    return (
        <div className="space-y-12">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">
                    Government Document Hub
                </h2>
                <p className="mt-2 text-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto">
                    Browse common documents or use our AI-powered finder to get personalized recommendations for your specific needs.
                </p>
            </div>

            <div>
                <h3 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-6">Common Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {commonDocuments.map((doc, index) => (
                        <div key={index} className="bg-surface dark:bg-dark-surface p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm transition-transform hover:scale-105 hover:shadow-lg">
                           <doc.icon className="w-10 h-10 text-primary mb-4"/>
                           <h4 className="font-bold text-lg text-text-primary dark:text-dark-text-primary">{doc.title}</h4>
                           <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">{doc.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-2 text-center">
                    Personalized Document Finder
                </h3>
                <p className="text-center text-text-secondary dark:text-dark-text-secondary mb-6">
                    Chat with our AI to get document suggestions for your situation.
                </p>

                <div className="max-w-3xl mx-auto h-[600px] flex flex-col">
                    <ChatInterface
                        history={history}
                        onSendMessage={handleSendMessage}
                        isLoading={isLoading}
                        message={message}
                        setMessage={setMessage}
                    />
                     {error && (
                        <div className="mt-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md" role="alert">
                            <p>{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
