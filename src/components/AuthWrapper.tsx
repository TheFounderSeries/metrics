import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import App from '../App';

const CORRECT_PASSWORD = 'ConsumerSocial@2025';
const AUTH_STORAGE_KEY = 'series_metrics_auth';

const AuthWrapper: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);
          // Check if authentication is still valid (within 24 hours)
          const isValid = authData.timestamp && 
                          (Date.now() - authData.timestamp) < 24 * 60 * 60 * 1000;
          
          if (isValid && authData.authenticated) {
            setIsAuthenticated(true);
          } else {
            // Clean up expired authentication
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
      } catch (error) {
        // Clean up corrupted auth data
        localStorage.removeItem(AUTH_STORAGE_KEY);
        console.error('Auth check failed:', error);
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const handleLogin = (password: string) => {
    setAuthError('');
    
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      
      // Store authentication state with timestamp
      const authData = {
        authenticated: true,
        timestamp: Date.now()
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
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  // Show loading state while checking authentication
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

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} error={authError} />;
  }

  // Show main app with logout option if authenticated
  return (
    <div>
      {/* Logout button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm border border-gray-300 transition-colors"
          title="Logout"
        >
          Logout
        </button>
      </div>
      
      {/* Main application */}
      <App />
    </div>
  );
};

export default AuthWrapper;
