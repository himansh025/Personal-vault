'use client';
import { useState } from 'react';

interface CopyButtonProps {
  text: string;
  timeout?: number;
}

export default function CopyButton({ text, timeout = 10000 }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={copyToClipboard}
      disabled={!text}
      className={`px-3 py-2 rounded border ${
        copied 
          ? 'bg-green-600 text-white border-green-600' 
          : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}