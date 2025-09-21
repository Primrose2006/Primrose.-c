import React from 'react';
import type { SimplifiedDocument } from '../types';

interface ResultDisplayProps {
  result: SimplifiedDocument | null;
}

const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);

const WarningIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);

const KeyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>
);


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  if (!result) {
    return null;
  }

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary pb-2 border-b border-slate-200 dark:border-slate-700">
          Document Analysis
        </h2>
      <div className="p-5 bg-surface dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center">
          <InfoIcon className="w-5 h-5 mr-3"/>
          Simple Summary
        </h3>
        <p className="text-text-secondary dark:text-dark-text-secondary whitespace-pre-wrap">{result.summary}</p>
      </div>

      <div className="p-5 bg-surface dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center">
            <KeyIcon className="w-5 h-5 mr-3"/>
            Key Terms Defined
        </h3>
        <div className="space-y-4">
          {result.keyTerms.map((item, index) => (
            <div key={index} className="border-t border-slate-200 dark:border-slate-700 pt-3 first:pt-0 first:border-none">
              <p className="font-semibold text-text-primary dark:text-dark-text-primary">{item.term}</p>
              <p className="text-text-secondary dark:text-dark-text-secondary">{item.definition}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 bg-surface dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-4 flex items-center">
            <WarningIcon className="w-5 h-5 mr-3"/>
            Heads-Up & Considerations
        </h3>
        <ul className="list-disc list-inside space-y-2 text-text-secondary dark:text-dark-text-secondary">
          {result.potentialRisks.map((risk, index) => (
            <li key={index}>{risk}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};