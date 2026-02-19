/**
 * LoginPage.jsx
 * -------------
 * Login + Registration page — toggle between sign-in and sign-up.
 * Uses the authService for login and productService API for registration.
 */
import React, { useState } from 'react';
import authService from '../services/authService';
import api from '../services/api';
import { Lock, UserPlus, AlertCircle, Loader, CheckCircle2 } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';

const LoginPage = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setUsername(''); setEmail(''); setPassword(''); setRole('buyer');
    setError(''); setSuccess('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const user = await authService.login(username, password);
      onLoginSuccess(user);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid username or password');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Unable to connect. Is the backend running?');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await api.post('/auth/register/', { username, email, password, role });
      setSuccess('Account created! You can now sign in.');
      setTimeout(() => { resetForm(); setMode('login'); }, 1500);
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const messages = Object.values(data).flat().join('. ');
        setError(messages || 'Registration failed');
      } else {
        setError('Unable to connect. Is the backend running?');
      }
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center px-8">
      <Card className="w-[480px] p-10 bg-card border-border">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-background rounded-xl flex items-center justify-center mx-auto mb-4 border border-border">
            {isLogin ? <Lock size={24} className="text-accent" /> : <UserPlus size={24} className="text-accent" />}
          </div>
          <h1 className="text-xl font-semibold text-[#E5E7EB] mb-1">Price Optimization Tool</h1>
          <p className="text-[#9CA3AF] text-sm">{isLogin ? 'Sign in to manage your products' : 'Create a new account'}</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 rounded-lg px-4 py-3 mb-6">
            <AlertCircle size={15} className="text-danger shrink-0" />
            <span className="text-danger text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 mb-6">
            <CheckCircle2 size={15} className="text-green-400 shrink-0" />
            <span className="text-green-400 text-sm">{success}</span>
          </div>
        )}

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[#9CA3AF] text-xs font-medium">Username</label>
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-[#9CA3AF] text-xs font-medium">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[#9CA3AF] text-xs font-medium">Password</label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-[#9CA3AF] text-xs font-medium">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm text-[#E5E7EB] transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="buyer">Buyer (Read-only)</option>
                <option value="supplier">Supplier (Read + Update)</option>
                <option value="admin">Admin (Full Access)</option>
              </select>
            </div>
          )}

          <Button type="submit" variant="primary" disabled={loading || !username || !password || (!isLogin && !email)} className="w-full mt-2">
            {loading ? (
              <><Loader size={15} className="animate-spin" /> {isLogin ? 'Signing in...' : 'Creating account...'}</>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <span className="text-[#9CA3AF] text-sm">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <button
            onClick={() => { resetForm(); setMode(isLogin ? 'register' : 'login'); }}
            className="text-accent text-sm font-medium hover:underline transition-all duration-200"
          >
            {isLogin ? 'Create one' : 'Sign in'}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
