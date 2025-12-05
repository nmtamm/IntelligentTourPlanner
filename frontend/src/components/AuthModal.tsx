import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { loginUser, registerUser } from '../api.js';
import { t } from '../utils/translations';

export function AuthModal({ isOpen, onClose, onLogin, language, }) {
  const lang = language.toLowerCase() as 'en' | 'vi';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isLoginMode) {
      // Login
      if (!username.trim() || !password.trim()) {
        const msg = t('enterNameAndPass', lang);
        setErrorMessage(msg);
        toast.error(msg);
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
      } catch (error: any) {
        console.error('Login error:', error);

        // If backend returns 401 for wrong credentials
        if (error?.response?.status === 401) {
          setErrorMessage(t('wrongNameOrPass', lang));
          toast.error(t('wrongNameOrPass', lang));
        } else {
          setErrorMessage(t('loginFailedCheckCredentials', lang));
          toast.error(t('loginFailedCheckCredentials', lang));
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Register
      if (!username.trim() || !email.trim() || !password.trim()) {
        const msg = t('pleaseFillInAllFields', lang);
        setErrorMessage(msg);
        toast.error(msg);
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
        setErrorMessage(null);
      } catch (error: any) {
        console.error('Registration error:', error);
        if (error.response?.status === 400) {
          setErrorMessage(t('userNameorEmailExists', lang));
          toast.error(t('userNameorEmailExists', lang));
        } else {
          setErrorMessage(t('registationFailed', lang));
          toast.error(t('registationFailed', lang));
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
          <DialogTitle>
            {isLoginMode ? t('login', lang) : t('createAccount', lang)}
          </DialogTitle>
          <DialogDescription>
            {isLoginMode
              ? t('signupToStart', lang)
              : t('loginToAccount', lang)}
          </DialogDescription>
        </DialogHeader>

        {/* Error message UI */}
        {errorMessage && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">{t('userName', lang)}</Label>
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
            <div className="space-y-4">
              <Label htmlFor="email">{t('email', lang)}</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>)}

          <div className="space-y-2">
            <Label htmlFor="password">{t('password', lang)}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              {t('cancel', lang)}
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Please wait...' : (isLoginMode ? t('login', lang) : t('signUp', lang))}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setErrorMessage(null);
              }}
              className="text-sm text-[#004DB6] hover:underline"
            >
              {isLoginMode
                ? t('dontHaveAccount', lang)
                : t('alreadyHaveAccount', lang)}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}