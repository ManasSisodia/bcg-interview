/**
 * LoginPage.jsx
 * -------------
 * Refined login page — w-96, softer card bg, focus:ring inputs.
 */
import React, { useState } from 'react';
import authService from '../services/authService';
import { Lock, AlertCircle, Loader } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';

const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#111827] to-[#0F172A] flex items-center justify-center px-8">
      <Card className="w-[480px] p-10 bg-card border-border">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-background rounded-xl flex items-center justify-center mx-auto mb-4 border border-border">
            <Lock size={24} className="text-accent" />
          </div>
          <h1 className="text-xl font-semibold text-[#E5E7EB] mb-1">Price Optimization Tool</h1>
          <p className="text-[#9CA3AF] text-sm">Sign in to manage your products</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 rounded-lg px-4 py-3 mb-6">
            <AlertCircle size={15} className="text-danger shrink-0" />
            <span className="text-danger text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <Button type="submit" variant="primary" disabled={loading || !username || !password} className="w-full mt-2">
            {loading ? (
              <><Loader size={15} className="animate-spin" /> Signing in...</>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

      </Card>
    </div>
  );
};

export default LoginPage;
