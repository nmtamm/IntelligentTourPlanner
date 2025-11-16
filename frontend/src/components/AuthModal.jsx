import React from 'react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog.jsx';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Label } from './ui/label.jsx';
import { toast } from 'sonner';
import { loginUser, registerUser } from '../api.js';

export function AuthModal({ isOpen, onClose, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoginMode) {
      // Login
      if (!username.trim() || !password.trim()) {
        toast.error('Please enter username and password');
        return;
      }

      setLoading(true);
      try {
        const response = await loginUser({
          username: username,
          password: password
        });

        // Store token
        localStorage.setItem('token', response.access_token);

        // Call parent onLogin with username
        onLogin(username);
        toast.success('Logged in successfully!');

        // Reset form
        setEmail('');
        setPassword('');
        setUsername('');
      } catch (error) {
        console.error('Login error:', error);
        toast.error('Login failed. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    } else {
      // Register
      if (!username.trim() || !email.trim() || !password.trim()) {
        toast.error('Please fill in all fields');
        return;
      }

      setLoading(true);
      try {
        await registerUser({
          username: username,
          email: email,
          password: password
        });

        toast.success('Registration successful! Please login.');
        setIsLoginMode(true);
      } catch (error) {
        console.error('Registration error:', error);
        if (error.response?.status === 400) {
          toast.error('Username or email already exists');
        } else {
          toast.error('Registration failed. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isLoginMode ? 'Login' : 'Register'} to Save Your Plans</DialogTitle>
          <DialogDescription>
            {isLoginMode
              ? 'Sign in to save and manage multiple trip plans'
              : 'Create an account to start saving your trips'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          {!isLoginMode && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Please wait...' : (isLoginMode ? 'Login' : 'Register')}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-sm text-[#004DB6] hover:underline"
              disabled={loading}
            >
              {isLoginMode
                ? "Don't have an account? Register"
                : "Already have an account? Login"
              }
            </button>
          </div>

          {isLoginMode && (
            <p className="text-xs text-gray-500 text-center">
               Demo mode: Use any email/password to login
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
