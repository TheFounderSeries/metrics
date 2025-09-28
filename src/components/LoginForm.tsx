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
    onLogin(password);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 border border-black rounded-xl focus:outline-none focus:ring-0 focus:border-gray-300 transition-colors appearance-none placeholder:text-gray-400 ${
                  error ? 'border-red-500' : 'border-black'
                }`}
                placeholder="Enter"
                aria-label="Password"
                autoFocus
                autoComplete="off"
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>
            {/* No button: press Enter to submit */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
