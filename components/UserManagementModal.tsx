import React, { useState } from 'react';
import { X, UserPlus, Trash2, Mail } from 'lucide-react';
import { Button } from './Button';
import { User } from '../types';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onAddUser: (email: string) => void;
  onRemoveUser: (userId: string) => void;
  currentUser: User;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  onAddUser,
  onRemoveUser,
  currentUser
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    if (users.some(u => u.email === email)) {
      setError('User already exists');
      return;
    }
    
    onAddUser(email);
    setEmail('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Team Management</h3>
            <p className="text-sm text-gray-500">Manage access to your projects</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Add User Form */}
          <form onSubmit={handleAdd} className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Invite New Member</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all"
                />
              </div>
              <Button type="submit" disabled={!email} className="px-4">
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </form>

          {/* User List */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Members ({users.length})</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-gray-200" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                        {user.id === currentUser.id && <span className="ml-2 text-xs text-brand-purple bg-purple-50 px-1.5 py-0.5 rounded-full">You</span>}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  
                  {user.id !== currentUser.id && (
                    <button 
                      onClick={() => onRemoveUser(user.id)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                      title="Remove user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            New members will receive an email invitation to join.
          </p>
        </div>
      </div>
    </div>
  );
};
