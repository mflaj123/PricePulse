import React, { useState } from 'react';
import { Button } from '../components/Button';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = () => {
    setIsLoading(true);
    // Simulate OAuth delay
    setTimeout(() => {
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
      
      <div className="z-10 w-full max-w-md p-10 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="mb-10 text-center">
          <div className="w-12 h-12 bg-brand-purple rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">P</div>
          <h1 className="text-3xl font-extrabold text-brand-text tracking-tight mb-2">
            PricePulse
          </h1>
          <p className="text-brand-muted text-sm">Enterprise Market Intelligence</p>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg text-sm text-brand-purple">
            <p className="mb-2 font-semibold">Secure Access</p>
            <p className="text-purple-700">Please log in using your organization's Google Workspace account to access BigQuery resources.</p>
          </div>

          <button 
            onClick={handleAuth} 
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-3 px-6 py-3 rounded-full bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple"
          >
            {isLoading ? (
               <svg className="animate-spin h-5 w-5 text-brand-purple" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.536-6.033-5.655s2.701-5.655,6.033-5.655c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <span className="text-xs text-brand-muted">© 2024 PricePulse Analytics</span>
        </div>
      </div>
    </div>
  );
};