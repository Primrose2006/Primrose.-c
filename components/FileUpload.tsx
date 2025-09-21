import React, { useState, useCallback } from 'react';
import type { FileData } from '../types';

interface FileUploadProps {
  onFileChange: (file: FileData | null) => void;
  selectedFile: FileData | null;
}

const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);

const FileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
);

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];


export const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, selectedFile }) => {
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file) return;

    setError(null);

    // 1. Validate File Type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError("Invalid file type. Please upload a supported document (e.g., PDF, DOCX, TXT).");
      onFileChange(null);
      return;
    }
    
    // 2. Validate File Size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large. Please upload a file smaller than ${MAX_FILE_SIZE_MB}MB.`);
      onFileChange(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      const [, base64Data] = base64String.split(',');

      onFileChange({
        name: file.name,
        data: base64Data,
        mimeType: file.type,
      });
    };
    reader.onerror = () => {
      setError("Failed to read the file.");
      onFileChange(null);
    };
    reader.readAsDataURL(file);
  }, [onFileChange]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleFile(event.target.files[0]);
    }
  };
  
  const handleClearFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onFileChange(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  }

  return (
    <div>
      <label
        htmlFor="file-upload"
        className="relative block w-full p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-center cursor-pointer hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
      >
        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center">
            <UploadIcon className="w-8 h-8 mx-auto text-slate-400 mb-2"/>
            <span className="font-semibold text-text-primary dark:text-dark-text-primary">Click to upload a document</span>
            <span className="text-xs text-text-secondary dark:text-dark-text-secondary">PDF, DOCX, TXT, etc. (Max 10MB)</span>
          </div>
        ) : (
          <div className="flex items-center justify-center text-left">
              <FileIcon className="w-8 h-8 text-primary flex-shrink-0 mr-4"/>
              <div className="flex-grow">
                  <p className="font-semibold text-text-primary dark:text-dark-text-primary truncate">{selectedFile.name}</p>
                  <p className="text-xs text-text-secondary dark:text-dark-text-secondary">File ready to be analyzed</p>
              </div>
              <button onClick={handleClearFile} className="ml-4 p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700">
                  <XIcon className="w-5 h-5"/>
              </button>
          </div>
        )}
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          onChange={handleInputChange}
          accept=".pdf,.txt,.md,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        />
      </label>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};