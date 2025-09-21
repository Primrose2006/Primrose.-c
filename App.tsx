
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TextAreaInput } from './components/TextAreaInput';
import { ResultDisplay } from './components/ResultDisplay';
import { ChatInterface } from './components/ChatInterface';
import { simplifyDocument, streamChatResponse } from './services/geminiService';
import type { SimplifiedDocument, ChatMessage, FileData } from './types';
import { LoadingSpinner } from './components/LoadingSpinner';
import { FileUpload } from './components/FileUpload';
import { DocumentAdvisor } from './components/DocumentAdvisor';
import { GovernmentHub } from './components/GovernmentHub';
import { LoginPage } from './components/LoginPage';

type ActiveTab = 'analyzer' | 'advisor' | 'hub';
type Theme = 'light' | 'dark';

const FileTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
);

const LockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);


const App: React.FC = () => {
  const [documentText, setDocumentText] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<FileData | null>(null);
  const [simplifiedResult, setSimplifiedResult] = useState<SimplifiedDocument | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('analyzer');

  const [chatContext, setChatContext] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);

  // Effect to set initial theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (userPrefersDark) {
      setTheme('dark');
    }
  }, []);

  // Effect to apply theme class and save to localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const handleSignIn = () => {
    setIsSignedIn(true);
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    if (activeTab === 'hub') {
      setActiveTab('analyzer');
    }
  };


  const resetState = () => {
    setSimplifiedResult(null);
    setError(null);
    setChatContext('');
    setChatHistory([]);
  };

  const handleDemystify = useCallback(async () => {
    const textToProcess = documentText.trim();
    if (!textToProcess && !uploadedFile) {
      setError('Please paste text or upload a document first.');
      return;
    }

    setIsLoading(true);
    resetState();

    try {
      const result = await simplifyDocument({ text: textToProcess, file: uploadedFile });
      setSimplifiedResult(result);

      const context = uploadedFile
        ? `The user has uploaded a document named "${uploadedFile.name}". Here is a summary of its contents:\n\n${result.summary}`
        : `The user has provided the following document text:\n\n---\n${textToProcess}\n---\n\nHere is a summary of its contents:\n\n${result.summary}`;
      setChatContext(context);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  }, [documentText, uploadedFile]);
  
  const handleSendMessage = useCallback(async () => {
    if (!chatMessage.trim() || isChatLoading) return;

    const newUserMessage: ChatMessage = { role: 'user', content: chatMessage };
    const newHistory = [...chatHistory, newUserMessage];
    
    setChatHistory([...newHistory, { role: 'model', content: '' }]);
    setIsChatLoading(true);
    setChatMessage('');

    try {
      await streamChatResponse(
        newHistory, 
        chatContext, 
        'analyzer',
        (chunk) => {
          setChatHistory(prev => {
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
      console.error('Error sending chat message:', err);
      setChatHistory(prev => {
        const lastMessage = prev[prev.length-1];
        if (lastMessage && lastMessage.role === 'model' && lastMessage.content === '') {
            const updatedLastMessage = {...lastMessage, content: "Sorry, I couldn't get a response. Please try again."};
            return [...prev.slice(0, -1), updatedLastMessage];
        }
        return prev;
      });
    } finally {
      setIsChatLoading(false);
    }
  }, [chatHistory, chatMessage, chatContext, isChatLoading]);

  if (!isSignedIn) {
    return <LoginPage onSignIn={handleSignIn} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-dark-background text-text-primary dark:text-dark-text-primary">
      <Header theme={theme} toggleTheme={toggleTheme} onSignOut={handleSignOut} />
      <main className="flex-grow w-full max-w-6xl mx-auto p-4 md:p-8 flex flex-col">
        <div className="mb-8 flex justify-center border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('analyzer')}
            aria-current={activeTab === 'analyzer' ? 'page' : undefined}
            className={`px-6 py-3 font-semibold text-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-t-md ${activeTab === 'analyzer' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary dark:text-dark-text-secondary hover:text-primary'}`}
          >
            Document Analyzer
          </button>
          <button
            onClick={() => setActiveTab('advisor')}
            aria-current={activeTab === 'advisor' ? 'page' : undefined}
            className={`px-6 py-3 font-semibold text-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-t-md ${activeTab === 'advisor' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary dark:text-dark-text-secondary hover:text-primary'}`}
          >
            Document Advisor
          </button>
          <button
            onClick={() => setActiveTab('hub')}
            aria-current={activeTab === 'hub' ? 'page' : undefined}
            disabled={!isSignedIn}
            className={`px-6 py-3 font-semibold text-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-t-md flex items-center gap-2 ${activeTab === 'hub' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary dark:text-dark-text-secondary'} ${!isSignedIn ? 'cursor-not-allowed text-slate-400 dark:text-slate-600' : 'hover:text-primary'}`}
            title={!isSignedIn ? "Please sign in to access" : "Government Document Hub"}
          >
             {!isSignedIn && <LockIcon className="w-4 h-4" />}
            Government Hub
          </button>
        </div>
        
        {activeTab === 'analyzer' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                 <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
                  Provide Your Document
                </h2>
                <TextAreaInput 
                  value={documentText}
                  onChange={(e) => {
                    setDocumentText(e.target.value);
                    if(e.target.value) setUploadedFile(null);
                  }}
                  placeholder="Paste your legal document text here..."
                  disabled={isLoading}
                />
                <div className="flex items-center space-x-4">
                  <hr className="flex-grow border-slate-300 dark:border-slate-600"/>
                  <span className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">OR</span>
                  <hr className="flex-grow border-slate-300 dark:border-slate-600"/>
                </div>
                <FileUpload 
                  onFileChange={(file) => {
                    setUploadedFile(file);
                    if (file) setDocumentText('');
                  }}
                  selectedFile={uploadedFile}
                />
              </div>
              <div className="flex flex-col items-center justify-center p-8 bg-surface dark:bg-dark-surface rounded-lg h-full border border-slate-200 dark:border-slate-800 shadow-sm">
                <FileTextIcon className="w-16 h-16 text-primary mb-4" />
                <h3 className="text-xl font-bold text-center text-text-primary dark:text-dark-text-primary mb-2">Ready to Demystify?</h3>
                <p className="text-center text-text-secondary dark:text-dark-text-secondary mb-6">Click the button below to get a simple breakdown of your document.</p>
                 <button 
                    onClick={handleDemystify}
                    disabled={isLoading || (!documentText.trim() && !uploadedFile)}
                    className="w-full md:w-auto bg-primary hover:bg-primary-hover disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 flex items-center justify-center"
                 >
                    {isLoading ? 
                      <>
                        <LoadingSpinner />
                        <span className="ml-2">Analyzing...</span>
                      </> 
                      : 'Demystify Document'}
                 </button>
              </div>
            </div>
            
            {error && (
              <div className="mt-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md" role="alert">
                <p className="font-bold">An error occurred</p>
                <p>{error}</p>
              </div>
            )}
            
            {simplifiedResult && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                <ResultDisplay result={simplifiedResult} />
                <div className="flex flex-col h-[600px]">
                    <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary pb-2 mb-4 border-b border-slate-200 dark:border-slate-700">
                        Ask a Follow-up Question
                    </h2>
                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-4">Have questions about specific clauses? Ask the AI to explain them.</p>
                    <ChatInterface 
                        history={chatHistory}
                        onSendMessage={handleSendMessage}
                        isLoading={isChatLoading}
                        message={chatMessage}
                        setMessage={setChatMessage}
                    />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'advisor' && (
          <DocumentAdvisor />
        )}

        {activeTab === 'hub' && isSignedIn && (
          <GovernmentHub />
        )}

      </main>
      <Footer />
    </div>
  );
};

export default App;
