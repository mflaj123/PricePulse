import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Login } from './screens/Login';
import { Dashboard } from './screens/Dashboard';
import { NewScrape } from './screens/NewScrape';
import { ScrapeConfig, User } from './types';
import { getCurrentUser } from './services/userService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'new'>('dashboard');
  const [scrapes, setScrapes] = useState<ScrapeConfig[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('loggedIn') === 'true') {
      if (window.opener) {
        window.opener.postMessage({ type: 'LOGIN_SUCCESS' }, '*');
        window.close();
        return;
      }
      setIsAuthenticated(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'LOGIN_SUCCESS') {
        setIsAuthenticated(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      getCurrentUser().then(user => {
        if (user) {
          setCurrentUser(user);
        } else {
          setIsAuthenticated(false);
        }
      });
    }
  }, [isAuthenticated]);

  const handleLogin = () => setIsAuthenticated(true);
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    window.location.href = 'https://shopping-backend-635452941137.europe-west2.run.app/logout';
  };

  const handleCreateScrape = (config: Partial<ScrapeConfig>) => {
    const newScrape: ScrapeConfig = {
      id: `job_${Math.random().toString(36).substr(2, 9)}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      ...config as any
    };
    
    setTimeout(() => {
      setScrapes([newScrape, ...scrapes]);
      setActiveTab('dashboard');
    }, 1000);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (isAuthenticated && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-brand-purple font-semibold text-lg tracking-wide">
          Loading your workspace...
        </div>
      </div>
    );
  }

  // --- CRITICAL FIX: The Safe Fallback User ---
  // This guarantees that Layout NEVER receives undefined, preventing the WSOD crash.
  const safeUser: User = currentUser || {
    id: 'loading',
    name: 'Loading...',
    email: '',
    avatar: ''
  };

  return (
    <Layout 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      onNavigate={setActiveTab}
      user={safeUser}               // Passes the prop for the old Layout style
      currentUser={safeUser}        // Passes the prop for the new Layout style
      onOpenUserManagement={() => console.log('User management')}
    >
      {activeTab === 'dashboard' ? (
        <Dashboard scrapes={scrapes} />
      ) : (
        <NewScrape 
          onCancel={() => setActiveTab('dashboard')} 
          onSubmit={handleCreateScrape} 
        />
      )}
    </Layout>
  );
}

export default App;