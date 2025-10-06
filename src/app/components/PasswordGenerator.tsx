'use client';
import { useState } from 'react';
import CopyButton from './CopyButton';

interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeLookalikes: boolean;
}

export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeLookalikes: true,
  });

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnpqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%^&*';
    
    const lookalikes = 'O0lI1';
    let charset = '';
    
    if (options.uppercase) charset += options.excludeLookalikes 
      ? uppercase.split('').filter(c => !lookalikes.includes(c)).join('')
      : uppercase;
    if (options.lowercase) charset += options.excludeLookalikes
      ? lowercase.split('').filter(c => !lookalikes.includes(c)).join('')
      : lowercase;
    if (options.numbers) charset += numbers;
    if (options.symbols) charset += symbols;

    if (!charset) {
      setPassword('Select at least one character type');
      return;
    }

    let generated = '';
    for (let i = 0; i < options.length; i++) {
      generated += charset[Math.floor(Math.random() * charset.length)];
    }
    setPassword(generated);
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={password}
          readOnly
          className="flex-1 px-3 py-2 border rounded"
          placeholder="Generated password"
        />
        <CopyButton text={password} />
        <button
          onClick={generatePassword}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Generate
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Length: {options.length}
          </label>
          <input
            title='len'
            type="range"
            min="8"
            max="64"
            value={options.length}
            onChange={(e) => setOptions({...options, length: parseInt(e.target.value)})}
            className="w-full"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'uppercase', label: 'Uppercase' },
            { key: 'lowercase', label: 'Lowercase' },
            { key: 'numbers', label: 'Numbers' },
            { key: 'symbols', label: 'Symbols' },
            { key: 'excludeLookalikes', label: 'Exclude Lookalikes' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options[key as keyof PasswordOptions] as boolean}
                onChange={(e) => setOptions({...options, [key]: e.target.checked})}
                className="rounded"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}