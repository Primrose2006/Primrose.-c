
import React from 'react';

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: () => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose, onSignIn }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300" 
      aria-modal="true" 
      role="dialog"
      onClick={onClose}
    >
      <div 
        className="relative bg-surface dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-md p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          aria-label="Close"
        >
          <XIcon className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-center text-text-primary dark:text-dark-text-primary mb-2">
          Sign In
        </h2>
        <p className="text-center text-text-secondary dark:text-dark-text-secondary mb-6">
          Access your personalized document hub.
        </p>
        
        <form onSubmit={(e) => { e.preventDefault(); onSignIn(); }}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">
                Email Address
              </label>
              <input 
                type="email" 
                id="email"
                defaultValue="user@example.com"
                className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-primary bg-background dark:bg-dark-background"
                placeholder="you@example.com" 
              />
            </div>
            <div>
              <label htmlFor="password"className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">
                Password
              </label>
              <input 
                type="password" 
                id="password"
                defaultValue="password"
                className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-primary bg-background dark:bg-dark-background"
                placeholder="••••••••" 
              />
            </div>
          </div>
          <div className="mt-8">
            <button 
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Sign In
            </button>
          </div>
        </form>
         <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-4">
            (This is a demonstration. Any email/password will work.)
         </p>
      </div>
    </div>
  );
};
