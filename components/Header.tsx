
import React from 'react';
import { ThemeToggle } from './ThemeToggle';

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

const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);


interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onSignOut }) => {
  return (
    <header className="w-full bg-surface/80 dark:bg-dark-surface/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center">
            <ScaleIcon className="w-8 h-8 text-primary" />
            <h1 className="ml-3 text-2xl font-bold text-text-primary dark:text-dark-text-primary">
              Legal Doc Demystifier
            </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-text-secondary dark:text-dark-text-secondary hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Sign Out"
          >
            <UserIcon className="w-5 h-5"/>
            Sign Out
          </button>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </div>
    </header>
  );
};
