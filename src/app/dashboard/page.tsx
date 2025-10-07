'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { encryptionService } from '@/lib/crypto';
import { Plus, Search, LogOut, Eye, EyeOff, Copy, Trash2, Loader2, Key } from 'lucide-react';

interface VaultItem {
  id: string;
  title: string;
  username: string;
  password: string; // This is the encrypted password
  url?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswordId, setShowPasswordId] = useState<string | null>(null);
  const [decryptedPasswords, setDecryptedPasswords] = useState<{[key: string]: string}>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [newItem, setNewItem] = useState({
    title: '',
    username: '',
    password: '',
    url: '',
    notes: ''
  });

  // Fetch vault items on component mount
  useEffect(() => {
    if (user) {
      fetchVaultItems();
    }
  }, [user]);

  const fetchVaultItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/vault');
      
      if (!response.ok) {
        throw new Error('Failed to fetch vault items');
      }
      
      const data = await response.json();
      setVaultItems(data.items || []);
    } catch (error) {
      console.error('Error fetching vault items:', error);
      alert('Failed to load vault items');
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on search
  const filteredItems = vaultItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.url?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!masterPassword) {
      alert('Please enter your master password to encrypt the password');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/auth/vault', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newItem,
          masterPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setVaultItems([data.item, ...vaultItems]);
        setNewItem({ title: '', username: '', password: '', url: '', notes: '' });
        setMasterPassword('');
        setShowAddForm(false);
        alert('Password saved successfully!');
      } else {
        alert(data.error || 'Failed to save password');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to save password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this password?')) {
      return;
    }

    try {
      const response = await fetch(`/api/auth/vault/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setVaultItems(vaultItems.filter(item => item.id !== id));
        // Remove from decrypted passwords cache
        setDecryptedPasswords(prev => {
          const newCache = { ...prev };
          delete newCache[id];
          return newCache;
        });
        alert('Password deleted successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete password');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete password');
    }
  };

  const handleViewPassword = async (itemId: string, encryptedPassword: string) => {
    try {
      let currentMasterPassword = masterPassword;
      
      // If no master password is stored, prompt the user
      if (!currentMasterPassword) {
        const userInput = prompt('Enter your master password to view this password:');
        if (!userInput) return; // User cancelled
        currentMasterPassword = userInput;
        setMasterPassword(userInput);
      }

      // Check if we already decrypted this password
      if (decryptedPasswords[itemId]) {
        setShowPasswordId(showPasswordId === itemId ? null : itemId);
        return;
      }

      // Decrypt the password
      const decryptedPassword = encryptionService.decrypt(encryptedPassword, currentMasterPassword);
      
      // Store in cache
      setDecryptedPasswords(prev => ({
        ...prev,
        [itemId]: decryptedPassword
      }));

      // Show the password
      setShowPasswordId(itemId);
      
      // Auto-hide after 30 seconds
      setTimeout(() => {
        setShowPasswordId(null);
      }, 30000);

    } catch (error) {
      console.error('Decryption error:', error);
      alert('Failed to decrypt password. Please check your master password.');
      setMasterPassword(''); // Clear invalid master password
    }
  };

  const handleCopyPassword = async (itemId: string, encryptedPassword: string) => {
    try {
      let currentMasterPassword = masterPassword;
      
      // If no master password is stored, prompt the user
      if (!currentMasterPassword) {
        const userInput = prompt('Enter your master password to copy this password:');
        if (!userInput) return; // User cancelled
        currentMasterPassword = userInput;
        setMasterPassword(userInput);
      }

      let decryptedPassword = decryptedPasswords[itemId];
      
      // If not in cache, decrypt it
      if (!decryptedPassword) {
        decryptedPassword = encryptionService.decrypt(encryptedPassword, currentMasterPassword);
        // Store in cache
        setDecryptedPasswords(prev => ({
          ...prev,
          [itemId]: decryptedPassword
        }));
      }

      // Copy to clipboard
      await navigator.clipboard.writeText(decryptedPassword);
      alert('Password copied to clipboard!');
      
    } catch (error) {
      console.error('Decryption error:', error);
      alert('Failed to decrypt password. Please check your master password.');
      setMasterPassword(''); // Clear invalid master password
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const generateStrongPassword = () => {
    const strongPassword = encryptionService.generateStrongPassword();
    setNewItem(prev => ({ ...prev, password: strongPassword }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="text-xl font-bold text-gray-900">🔒 SecurePass</div>
              <span className="text-sm text-gray-500">Welcome, {user?.email}</span>
            </div>
            <button 
              onClick={logout}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Vault</h1>
            <p className="text-gray-600 mt-2">Manage your passwords securely</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Add Item</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search passwords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Add Item Form */}
        {showAddForm && (
          <div className="bg-white p-6 text-blue-950 rounded-lg shadow-sm border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Password</h3>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={newItem.title}
                    onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Gmail, GitHub"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username/Email *</label>
                  <input
                    type="text"
                    required
                    value={newItem.username}
                    onChange={(e) => setNewItem({...newItem, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="username or email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      required
                      value={newItem.password}
                      onChange={(e) => setNewItem({...newItem, password: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={generateStrongPassword}
                      className="flex items-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      title="Generate strong password"
                    >
                      <Key size={16} />
                      <span>Generate</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                  <input
                    type="url"
                    value={newItem.url}
                    onChange={(e) => setNewItem({...newItem, url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newItem.notes}
                  onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Master Password *
                  <span className="text-xs text-gray-500 ml-1">(Used to encrypt this password)</span>
                </label>
                <input
                  type="password"
                  required
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your master password"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  <span>{submitting ? 'Saving...' : 'Save Password'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Vault Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading your passwords...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No matching passwords' : 'No passwords yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try a different search term' : 'Add your first password to get started'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Your First Password
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                        {item.url && (
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Visit
                          </a>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Username: </span>
                          <span className="text-gray-900">{item.username}</span>
                          <button
                            onClick={() => copyToClipboard(item.username)}
                            className="ml-2 text-blue-600 hover:text-blue-700"
                            title="Copy username"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                        <div>
                          <span className="text-gray-500">Password: </span>
                          <span className="text-gray-900 font-mono">
                            {showPasswordId === item.id ? 
                              (decryptedPasswords[item.id] || 'Decrypting...') 
                              : '••••••••'
                            }
                          </span>
                          <button
                            onClick={() => handleViewPassword(item.id, item.password)}
                            className="ml-2 text-blue-600 hover:text-blue-700"
                            title={showPasswordId === item.id ? "Hide password" : "View password"}
                          >
                            {showPasswordId === item.id ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button
                            onClick={() => handleCopyPassword(item.id, item.password)}
                            className="ml-2 text-blue-600 hover:text-blue-700"
                            title="Copy password"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                      {item.notes && (
                        <div className="mt-2">
                          <span className="text-gray-500">Notes: </span>
                          <span className="text-gray-900">{item.notes}</span>
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        Created: {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        {!loading && vaultItems.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{vaultItems.length}</div>
              <div className="text-sm text-gray-600">Total Passwords</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {vaultItems.filter(item => item.url).length}
              </div>
              <div className="text-sm text-gray-600">With Website URLs</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {new Date().toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-600">Last Updated</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}