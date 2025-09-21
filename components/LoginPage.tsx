
import React from 'react';

const ScaleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 16-4-4-4 4"/>
    <path d="M12 2v12"/>
    <path d="M4 12H2"/>
    <path d="M10 12H8"/>
    <path d="M16 12h-2"/>
    <path d="M22 12h-2"/>
    <path d="M18 5V2"/>
    <path d="M6 5V2"/>
    <path d="M20 22H4"/>
  </svg>
);

interface LoginPageProps {
  onSignIn: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSignIn }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background dark:bg-dark-background text-text-primary dark:text-dark-text-primary p-4">
      <div className="w-full max-w-sm p-8 space-y-8 bg-surface dark:bg-dark-surface rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
        <div className="text-center">
            <ScaleIcon className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">
              Legal Doc Demystifier
            </h1>
            <p className="mt-2 text-text-secondary dark:text-dark-text-secondary">
              Sign in to continue
            </p>
        </div>
        
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
                className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-primary bg-background dark:bg-dark-background"
                placeholder="you@example.com" 
                required
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
                className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-primary bg-background dark:bg-dark-background"
                placeholder="••••••••" 
                required
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
         <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-6">
            (This is a demonstration. Any email/password will work.)
         </p>
      </div>
    </div>
  );
};
