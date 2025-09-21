import React from 'react';

interface TextAreaInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  disabled: boolean;
}

export const TextAreaInput: React.FC<TextAreaInputProps> = ({ value, onChange, placeholder, disabled }) => {
  return (
    <div>
      <label htmlFor="document-text" className="sr-only">
        Legal Document Text
      </label>
      <textarea
        id="document-text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={15}
        className="w-full p-4 border border-slate-300 dark:border-slate-700 rounded-lg shadow-inner focus:ring-2 focus:ring-primary focus:border-primary transition duration-200 bg-slate-50 dark:bg-slate-900/50 text-text-primary dark:text-dark-text-primary disabled:opacity-50"
        aria-label="Legal document text input"
      />
    </div>
  );
};