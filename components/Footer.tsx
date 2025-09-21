import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-auto p-6 bg-slate-200 dark:bg-dark-surface">
      <div className="max-w-4xl mx-auto text-center text-text-secondary dark:text-dark-text-secondary text-xs">
        <p className="font-semibold mb-2">Disclaimer</p>
        <p>
          This tool uses AI and is for informational purposes only. It is not a substitute for legal advice from a qualified professional. The analysis provided may not be fully accurate or complete.
          Always consult with an attorney before making any decisions based on information from this tool.
        </p>
      </div>
    </footer>
  );
};