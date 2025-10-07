'use client';
import { useState, useEffect, useRef } from 'react';

interface CopyButtonProps {
  text: string;
  timeout?: number;
}

export default function CopyButton({ text, timeout = 15000 }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const clearClipboardSafely = async () => {
    try {
      // Check if document is focused before trying to clear clipboard
      if (document.hasFocus()) {
        await navigator.clipboard.writeText('');
        console.log('📋 Clipboard cleared for security');
      } else {
        console.log('⚠️ Document not focused, skipping clipboard clear');
      }
    } catch (error) {
      console.log('⚠️ Could not clear clipboard (may be expected behavior)');
    }
  };

  const copyToClipboard = async () => {
    if (!text) return;
    
    try {
      // Clear any existing timers
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);

      // Copy the text to clipboard
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeLeft(Math.floor(timeout / 1000));
      
      // Start visual countdown
      countdownRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Set timer to automatically clear clipboard after timeout
      timerRef.current = setTimeout(async () => {
        await clearClipboardSafely();
        setCopied(false);
        if (countdownRef.current) clearInterval(countdownRef.current);
      }, timeout);
      
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Manual clear function that user can trigger
  const manualClearClipboard = async () => {
    await clearClipboardSafely();
    setCopied(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  // Cleanup timers on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={copyToClipboard}
        disabled={!text}
        className={`px-3 py-2 rounded border transition-colors ${
          copied 
            ? 'bg-green-600 text-white border-green-600' 
            : 'bg-gray-100 text-blue-950 hover:bg-gray-200 border-gray-300'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={copied ? `Auto-clears in ${timeLeft}s` : 'Copy to clipboard'}
      >
        {copied ? `Copied (${timeLeft}s)` : 'Copy'}
      </button>
      
      {copied && (
        <button
          onClick={manualClearClipboard}
          className="px-2 py-2 text-xs text-red-600 hover:text-red-700"
          title="Clear clipboard now"
        >
          🗑️
        </button>
      )}
    </div>
  );
}