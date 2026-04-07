import React, { useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { LogIn } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/api/auth/login', { email, password });
      login(response.data.token);
      window.location.href = '/admin';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary font-headline italic mb-2">Admin Portal</h1>
          <p className="text-stone-500 dark:text-stone-400">Manage your restaurant menu</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2 uppercase tracking-widest">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
              placeholder="admin@spicymatka.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2 uppercase tracking-widest">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center font-bold">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-primary/30 hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Logging in...' : <><LogIn size={20} /> Sign In</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
