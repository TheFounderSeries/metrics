import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import App from '../App';

const CORRECT_PASSWORD = 'ConsumerSocial@2025';
const ADMIN_PASSWORD = 'BigPod@2025';
const AUTH_STORAGE_KEY = 'series_metrics_auth';

interface StoredAuth {
  authenticated: boolean;
  isAdmin?: boolean;
  timestamp: number;
}

const AuthWrapper: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedAuth) {
          const authData = JSON.parse(storedAuth) as StoredAuth;
          // Check if authentication is still valid (within 24 hours)
          const isValid = authData.timestamp && (Date.now() - authData.timestamp) < 24 * 60 * 60 * 1000;
          if (isValid && authData.authenticated) {
            setIsAuthenticated(true);
            setIsAdmin(Boolean(authData.isAdmin));
          } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
      } catch (error) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        console.error('Auth check failed:', error);
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const handleLogin = (password: string) => {
    setAuthError('');

    const isAdminLogin = password === ADMIN_PASSWORD;
    if (password === CORRECT_PASSWORD || isAdminLogin) {
      setIsAuthenticated(true);
      setIsAdmin(isAdminLogin);

      const authData: StoredAuth = {
        authenticated: true,
        isAdmin: isAdminLogin,
        timestamp: Date.now(),
      };

      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      } catch (error) {
        console.error('Failed to store auth state:', error);
      }
    } else {
      setAuthError('Incorrect password. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} error={authError} />;
  }

  return (
    <div>
      <App onLogout={handleLogout} isAdmin={isAdmin} />
    </div>
  );
};

export default AuthWrapper;
