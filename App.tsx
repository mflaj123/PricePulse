import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Login } from './screens/Login';
import { Dashboard } from './screens/Dashboard';
import { NewScrape } from './screens/NewScrape';
import { ScrapeConfig } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'new'>('dashboard');
  const [scrapes, setScrapes] = useState<ScrapeConfig[]>([]);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  const handleCreateScrape = (config: Partial<ScrapeConfig>) => {
    const newScrape: ScrapeConfig = {
      id: `job_${Math.random().toString(36).substr(2, 9)}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      ...config as any
    };
    
    // Simulate backend delay for dataset creation
    setTimeout(() => {
      setScrapes([newScrape, ...scrapes]);
      setActiveTab('dashboard');
    }, 1000);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      onNavigate={setActiveTab}
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