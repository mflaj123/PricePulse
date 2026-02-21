import React from 'react';
import { LogOut, BarChart3, Plus, ChevronDown } from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  activeTab: 'dashboard' | 'new';
  onNavigate: (tab: 'dashboard' | 'new') => void;
  user: User | null;
}

export const Layout: React.FC<LayoutProps> = ({ children, onLogout, activeTab, onNavigate, user }) => {
  return (
    <div className="min-h-screen flex font-sans bg-brand-bg">
      {/* Sidebar - Deep Purple */}
      <aside className="w-64 bg-brand-purple flex flex-col fixed h-full z-10 shadow-xl">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-brand-purple font-bold text-xl">
            P
          </div>
          <span className="text-xl font-bold text-white tracking-tight">PricePulse</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'dashboard' 
                ? 'bg-white/10 text-white' 
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-5 h-5 mr-3" />
            Project Dashboard
          </button>
          <button
            onClick={() => onNavigate('new')}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'new' 
                ? 'bg-white/10 text-white' 
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Plus className="w-5 h-5 mr-3" />
            New Project
          </button>
        </nav>

        <div className="p-4 mt-auto space-y-1">
           <button 
            onClick={onLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors mt-4 border-t border-white/10 pt-4"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-brand-border flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center text-sm text-brand-muted">
            <span className="hover:text-brand-purple cursor-pointer">Main Account</span>
            <span className="mx-2">/</span>
            <span className="font-semibold text-brand-text">Price Comparison Projects</span>
          </div>

          {user && (
            <div className="flex items-center space-x-6">
              <div className="flex items-center cursor-pointer">
                <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full border border-gray-200" />
                <span className="ml-3 text-sm font-medium text-brand-text">{user.name}</span>
                <ChevronDown className="w-4 h-4 ml-2 text-brand-muted" />
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};