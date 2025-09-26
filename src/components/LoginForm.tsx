import React, { useState } from 'react';

interface LoginFormProps {
  onLogin: (password: string) => void;
  error?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, error }) => {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    
    setIsSubmitting(true);
    
    // Add a small delay to prevent immediate feedback
    setTimeout(() => {
      onLogin(password);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-black mb-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}>
            Data Room Access
          </h1>
          <p className="text-gray-600 text-sm">Enter password to view metrics</p>
        </div>

        <div className="bg-white border-2 border-black rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none focus:ring-0 focus:border-gray-400 transition-colors ${
                  error ? 'border-red-500' : 'border-black'
                }`}
                placeholder="Enter password"
                disabled={isSubmitting}
                autoComplete="current-password"
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="w-full bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Authenticating...' : 'Access Data Room'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Secure access to Series metrics dashboard
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
