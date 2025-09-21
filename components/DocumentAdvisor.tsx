
import React, { useState, useCallback } from 'react';
import { streamChatResponse } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { ChatInterface } from './ChatInterface';

const GREETING_MESSAGE = "Hello! I'm your AI Document Advisor. What kind of goal or project are you working on? For example, are you starting a business, buying a house, or creating a will? Let's figure out what documents you might need.";

export const DocumentAdvisor: React.FC = () => {
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
          'advisor',
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
      console.error('Error sending advisor message:', err);
      const errorMessage = "Sorry, an error occurred. Please try sending your message again.";
      setError(errorMessage);
      setHistory(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.role === 'model' && lastMessage.content === '') {
              const updatedLastMessage = { ...lastMessage, content: "I seem to be having trouble connecting. Please try again in a moment." };
              return [...prev.slice(0, -1), updatedLastMessage];
          }
          return prev;
      });
    } finally {
      setIsLoading(false);
    }
  }, [history, message, isLoading]);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col flex-grow">
       <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">
            Document Advisor
          </h2>
          <p className="text-text-secondary dark:text-dark-text-secondary">
            Chat with our AI to discover which documents you might need for your goals.
          </p>
        </div>
        
        <div className="flex-grow flex flex-col">
            <ChatInterface
                history={history}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                message={message}
                setMessage={setMessage}
            />
        </div>
         {error && (
           <div className="mt-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md" role="alert">
             <p>{error}</p>
           </div>
        )}
    </div>
  );
};
