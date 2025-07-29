import React, { useState } from 'react';
import { AppUser } from '../types';
import { useLanguage } from '../contexts/languageContext';

interface LoginProps {
  users: AppUser[];
  onLogin: (user: AppUser) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError(t('loginError'));
    }
  };

  if (users.length === 0) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center p-8 bg-ui-dark-gray shadow-lg">
                <h1 className="text-2xl font-bold text-white">Error</h1>
                <p className="mt-2 text-gray-400">No application users found. Please configure users.</p>
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto bg-ui-dark-gray p-8 shadow-md">
        <div className="text-center">
            <h1 className="text-2xl font-bold text-white">{t('defectReportForm')}</h1>
            <p className="mt-2 text-gray-400">{t('loginPrompt')}</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">{t('username')}</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="form-input"
                />
            </div>
            <div>
                 <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">{t('password')}</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-input"
                />
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <div>
                <button
                    type="submit"
                    className="w-full btn"
                >
                    {t('login')}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default Login;