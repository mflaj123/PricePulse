import React, { useState } from 'react';
import { Button } from '../components/Button';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = () => {
    setIsLoading(true);
    // 3. UPDATED LOGIN BUTTON: Open popup for OAuth flow
    // We pass the current origin as a redirect_uri so the backend knows where to return
    // (Assuming the backend supports this parameter)
    const backendUrl = 'https://shopping-backend-635452941137.europe-west2.run.app/login';
    const redirectUri = encodeURIComponent(window.location.origin);
    const authUrl = `${backendUrl}?redirect_uri=${redirectUri}`;

    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      authUrl,
      'oauth_popup',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
    // Reset loading state after a delay (popup handles the rest)
    setTimeout(() => setIsLoading(false), 2000);
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
            <p className="opacity-90">Please sign in with your authorized Google workspace account to access the dashboard.</p>
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
                  <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};