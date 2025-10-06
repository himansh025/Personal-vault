'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Copy, RefreshCw, Check } from 'lucide-react';

export default function Home() {
  const [generatedPassword, setGeneratedPassword] = useState('••••••••••••••••');
  const [isCopied, setIsCopied] = useState(false);

  const generatePassword = () => {
    const length = 16;
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnpqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%^&*';
    
    const charset = uppercase + lowercase + numbers + symbols;
    let password = '';
    
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }
    console.log(password);
    setGeneratedPassword(password);
    setIsCopied(false);
  };

  const copyToClipboard = async () => {
    if (generatedPassword === '••••••••••••••••') return;
    
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleGetStarted = () => {
    window.location.href = '/signup';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-lg p-4 mb-8">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-900">🔒 SecurePass</div>
          <div className="flex gap-4">
            <Link 
              href="/login" 
              className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/signup" 
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Your Passwords, 
            <span className="text-blue-600"> Secure & Private</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A privacy-first password manager with client-side encryption
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={handleGetStarted}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
            >
              Get Started Free
            </button>
            <Link 
              href="/login"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors text-lg font-semibold"
            >
              I have an account
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-2xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Client-Side Encryption</h3>
            <p className="text-gray-600">Your data is encrypted on your device before syncing</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-2xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast & Secure</h3>
            <p className="text-gray-600">Generate and manage passwords effortlessly</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-2xl mb-4">🌙</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Cross-Platform</h3>
            <p className="text-gray-600">Access your vault from any device</p>
          </div>
        </div>

        {/* Password Generator Preview */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Try Our Password Generator</h2>
          <div className="flex gap-4">
            <input
              placeholder='password'
              name="password" 
              type="text" 
              value={generatedPassword} 
              readOnly 
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-950 bg-gray-50 font-mono text-center"
            />
            <button 
              onClick={copyToClipboard}
              disabled={generatedPassword === '••••••••••••••••'}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                isCopied 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isCopied ? <Check size={20} /> : <Copy size={20} />}
              {isCopied ? 'Copied!' : 'Copy'}
            </button>
            <button 
              onClick={generatePassword}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw size={20} />
              Generate
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-3 text-center">
            Try our password generator - no account needed!
          </p>
        </div>

        {/* Security Features */}
        <div className="mt-12 bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">How We Protect Your Data</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">🔒 Zero-Knowledge Architecture</h3>
              <p className="text-gray-600">We never see your passwords. Everything is encrypted on your device before it reaches our servers.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">🛡️ Military-Grade Encryption</h3>
              <p className="text-gray-600">Your data is protected with AES-256 encryption, the same standard used by banks and governments.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">⚡ Instant Access</h3>
              <p className="text-gray-600">Access your passwords anywhere, anytime, with automatic sync across all your devices.</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">🔑 Master Password</h3>
              <p className="text-gray-600">Only you hold the key to your encrypted data. We cannot access or recover your passwords.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-gray-600">
        <p>© 2025 SecurePass. All rights reserved.</p>
        <p className="text-sm mt-2">Your privacy and security are our top priority.</p>
      </footer>
    </div>
  )
}