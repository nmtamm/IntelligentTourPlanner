import { useState, React } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Mail, Lock, User, Globe, MapPin, Compass, Flower2, Waves, Sun, Palmtree, Eye, EyeOff } from "lucide-react";
import { useThemeColors } from "../hooks/useThemeColors";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { loginUser, fetchUserProfile, registerUser } from '../api.js';
interface IntroScreenProps {
  onContinue: (user: any) => void;
  language: 'EN' | 'VI';
  onLanguageChange: (lang: 'EN' | 'VI') => void;
}

export function IntroScreen({ onContinue, language, onLanguageChange }: IntroScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginBtnHovered, setIsLoginBtnHovered] = useState(false);
  const [isLoginBtnPressed, setIsLoginBtnPressed] = useState(false);
  const [isRegisterBtnHovered, setIsRegisterBtnHovered] = useState(false);
  const [isRegisterBtnPressed, setIsRegisterBtnPressed] = useState(false);

  const { primary } = useThemeColors();

  const t = {
    en: {
      appName: 'Intelligent Tour Planner',
      tagline: 'Discover the Beauty of Vietnam',
      login: 'Login',
      register: 'Register',
      registration: 'Create Account',
      welcomeTitle: 'Welcome to Vietnam',
      welcomeSubtitle: 'Start Your Journey',
      registerTitle: 'Join Our Community',
      registerSubtitle: 'Explore Vietnam Together',
      dontHaveAccount: "Don't have an account?",
      alreadyHaveAccount: 'Already have an account?',
      username: 'Username',
      email: 'Email Address',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      continueAsGuest: 'Continue as Guest',
      startExploring: 'Start Exploring',
    },
    vi: {
      appName: 'Intelligent Tour Planner',
      tagline: 'Khám phá vẻ đẹp Việt Nam',
      login: 'Đăng nhập',
      register: 'Đăng ký',
      registration: 'Tạo tài khoản',
      welcomeTitle: 'Chào mừng đến Việt Nam',
      welcomeSubtitle: 'Bắt đầu hành trình',
      registerTitle: 'Tham gia cộng đồng',
      registerSubtitle: 'Khám phá Việt Nam cùng nhau',
      dontHaveAccount: 'Chưa có tài khoản?',
      alreadyHaveAccount: 'Đã có tài khoản?',
      username: 'Tên đăng nhập',
      email: 'Địa chỉ Email',
      password: 'Mật khẩu',
      forgotPassword: 'Quên mật khẩu?',
      continueAsGuest: 'Tiếp tục với tư cách khách',
      startExploring: 'Bắt đầu khám phá',
    },
  };

  const lang = language.toLowerCase() as 'en' | 'vi';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Use username as email if email is not provided (for login form)
    const loginEmail = email || `${username}@temp.com`;

    try {
      // Call backend login
      const response = await loginUser({
        username: username,
        password: password,
      });
      localStorage.setItem("token", response.access_token);

      // Fetch user profile after login
      const userProfile = await fetchUserProfile(response.access_token);

      // Pass user profile to parent (update your onContinue to accept user object if needed)
      onContinue(userProfile); // or just onContinue(userProfile)
    } catch (error) {
      // Handle login error (optional: show error message)
      alert("Login failed. Please check your credentials.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Call backend register
      await registerUser({
        username,
        email,
        password,
      });

      // After registration, log in the user to get the token
      const response = await loginUser({
        username,
        password,
      });
      localStorage.setItem("token", response.access_token);

      // Fetch user profile after login
      const userProfile = await fetchUserProfile(response.access_token);

      // Pass user profile to parent
      onContinue(userProfile);
    } catch (error) {
      alert("Registration failed. Please try again.");
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #FFE5D9 0%, #FFC9A8 25%, #FFB5C5 50%, #C5A3D6 75%, #9ECDE8 100%)',
      }}
    >
      {/* Decorative Floating Lotus and Vietnamese Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Lotus flowers */}
        <div className="absolute top-16 left-12 animate-bounce" style={{ animationDuration: '4s' }}>
          <Flower2 className="w-14 h-14" style={{ color: '#FF69B4', opacity: 0.3 }} />
        </div>
        <div className="absolute top-32 right-24 animate-pulse" style={{ animationDuration: '5s' }}>
          <Flower2 className="w-12 h-12" style={{ color: '#FFB5C5', opacity: 0.35 }} />
        </div>
        <div className="absolute bottom-24 left-24 animate-bounce" style={{ animationDuration: '4.5s' }}>
          <Flower2 className="w-16 h-16" style={{ color: '#FFC1CC', opacity: 0.25 }} />
        </div>
        <div className="absolute bottom-32 right-16 animate-pulse" style={{ animationDuration: '6s' }}>
          <Flower2 className="w-13 h-13" style={{ color: '#FFB347', opacity: 0.3 }} />
        </div>

        {/* Water waves */}
        <div className="absolute top-1/4 left-1/4 animate-pulse" style={{ animationDuration: '5s' }}>
          <Waves className="w-10 h-10" style={{ color: '#5B9BD5', opacity: 0.25 }} />
        </div>
        <div className="absolute bottom-1/3 right-1/3 animate-pulse" style={{ animationDuration: '5.5s' }}>
          <Waves className="w-12 h-12" style={{ color: '#4A90E2', opacity: 0.2 }} />
        </div>

        {/* Sun and palm trees */}
        <div className="absolute top-20 right-12 animate-pulse" style={{ animationDuration: '7s' }}>
          <Sun className="w-14 h-14" style={{ color: '#FFD700', opacity: 0.3 }} />
        </div>
        <div className="absolute bottom-20 left-1/3 animate-bounce" style={{ animationDuration: '4s' }}>
          <Palmtree className="w-11 h-11" style={{ color: '#7CB342', opacity: 0.3 }} />
        </div>

        {/* Map pins for locations */}
        <div className="absolute top-1/3 right-1/4 animate-bounce" style={{ animationDuration: '3.5s' }}>
          <MapPin className="w-9 h-9" style={{ color: '#FF6B6B', opacity: 0.3 }} />
        </div>
      </div>

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-30">
        <button
          onClick={() => onLanguageChange(language === 'EN' ? 'VI' : 'EN')}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/90 hover:bg-white backdrop-blur-md rounded-full transition-all duration-300 shadow-lg hover:shadow-xl border-2"
          style={{
            borderColor: '#FFB347',
            color: '#2B7BA8'
          }}
        >
          <Globe className="w-5 h-5" />
          <span className="font-semibold">{language === 'EN' ? 'Tiếng Việt' : 'English'}</span>
        </button>
      </div>

      {/* Continue as Guest Button */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={() => onContinue()}
          className="px-8 py-3.5 bg-white/95 hover:bg-white backdrop-blur-md rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 font-semibold border-2"
          style={{
            borderColor: '#FFB347',
            color: '#2B7BA8'
          }}
        >
          {t[lang].continueAsGuest}
        </button>
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-6xl">
        <div
          className="relative bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border-2"
          style={{
            minHeight: '600px',
            borderColor: '#FFB347'
          }}
        >
          {/* Beautiful Background Image Panel */}
          <div
            className="absolute inset-0 w-1/2 z-10 transition-all duration-700 ease-in-out overflow-hidden"
            style={{
              transform: isLogin ? 'translateX(0%)' : 'translateX(100%)',
            }}
          >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <ImageWithFallback
                src="assets\thumbnail.jpeg"
                alt="Vietnam Tourism"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(42, 123, 168, 0.85) 0%, rgba(255, 179, 71, 0.75) 100%)'
                }}
              />
            </div>

            {/* Content on Image */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-white z-10">
              {/* App Logo */}
              <div className="mb-8 text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center border-4 border-white/50 shadow-xl">
                  <Flower2 className="w-12 h-12 text-white animate-pulse" style={{ animationDuration: '3s' }} />
                </div>
                <h1 className="text-4xl font-bold mb-3 drop-shadow-lg">
                  {t[lang].appName}
                </h1>
                <p className="text-xl text-white/95 drop-shadow-md italic">
                  {t[lang].tagline}
                </p>
              </div>

              {/* Decorative Lotus Icon */}
              <div className="mb-6 relative">
                <div className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/40">
                  <Compass className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full animate-bounce"
                  style={{
                    background: '#FFD700',
                    animationDuration: '2s'
                  }}
                />
              </div>

              <h2 className="text-3xl font-bold mb-3 drop-shadow-lg">
                {isLogin ? t[lang].welcomeTitle : t[lang].registerTitle}
              </h2>
              <p className="text-lg text-white/90 mb-8 text-center drop-shadow-md">
                {isLogin ? t[lang].welcomeSubtitle : t[lang].registerSubtitle}
              </p>

              <p className="text-white/85 mb-6 text-center">
                {isLogin ? t[lang].dontHaveAccount : t[lang].alreadyHaveAccount}
              </p>

              <button
                onClick={toggleMode}
                className="px-10 py-3.5 border-3 border-white text-white rounded-full font-semibold hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
                style={{
                  borderWidth: '2px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#2B7BA8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'white';
                }}
              >
                {isLogin ? t[lang].register : t[lang].login}
              </button>
            </div>
          </div>

          {/* Login Form */}
          <div
            className={`absolute inset-0 w-1/2 transition-all duration-700 ease-in-out ${isLogin ? 'opacity-100 translate-x-full' : 'opacity-0 pointer-events-none translate-x-0'
              }`}
          >
            <div className="h-full flex flex-col items-center justify-center p-10 md:p-14">
              {/* Form Header */}
              <div className="mb-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #2B7BA8 0%, #5B9BD5 100%)'
                  }}>
                  <Flower2 className="w-9 h-9 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: '#2B7BA8' }}>
                  {t[lang].login}
                </h2>
                <p className="text-gray-600">{t[lang].welcomeSubtitle}</p>
              </div>

              <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
                {/* Username Input */}
                <div className="relative">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#FF8C69' }}>
                    {t[lang].username}
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full h-12 pr-12 rounded-xl border-2 focus:ring-2 transition-all"
                      style={{
                        borderColor: '#FFD9CC',
                        focusBorderColor: '#FFB347'
                      }}
                      required
                    />
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#FF8C69' }} />
                  </div>
                </div>

                {/* Password Input */}
                <div className="relative">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#FF8C69' }}>
                    {t[lang].password}
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 pr-12 rounded-xl border-2 focus:ring-2 transition-all"
                      style={{
                        borderColor: '#FFD9CC',
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: '#FF8C69' }}
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

                {/* Login Button */}
                <button
                  type="submit"
                  onMouseEnter={() => setIsLoginBtnHovered(true)}
                  onMouseLeave={() => {
                    setIsLoginBtnHovered(false);
                    setIsLoginBtnPressed(false);
                  }}
                  onMouseDown={() => setIsLoginBtnPressed(true)}
                  onMouseUp={() => setIsLoginBtnPressed(false)}
                  className="w-full text-white rounded-xl font-semibold text-lg mt-6"
                  style={{
                    background: 'linear-gradient(135deg, #2B7BA8 0%, #5B9BD5 100%)',
                    padding: '14px',
                    boxShadow: isLoginBtnPressed
                      ? '0 4px 12px rgba(43, 123, 168, 0.4)'
                      : (isLoginBtnHovered ? '0 8px 24px rgba(43, 123, 168, 0.3)' : '0 4px 12px rgba(43, 123, 168, 0.2)'),
                    transform: isLoginBtnPressed ? 'scale(0.97)' : (isLoginBtnHovered ? 'scale(1.02)' : 'scale(1.00)'),
                    transition: isLoginBtnPressed ? 'all 120ms ease-out' : 'all 150ms cubic-bezier(0.16,1,0.3,1)',
                  }}
                >
                  {t[lang].login}
                </button>
              </form>
            </div>
          </div>

          {/* Register Form */}
          <div
            className={`absolute inset-0 w-1/2 transition-all duration-700 ease-in-out ${!isLogin ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none translate-x-full'
              }`}
          >
            <div className="h-full flex flex-col items-center justify-center p-10 md:p-14">
              {/* Form Header */}
              <div className="mb-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #FF8C69 0%, #FFB347 100%)'
                  }}>
                  <Compass className="w-9 h-9 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: '#2B7BA8' }}>
                  {t[lang].registration}
                </h2>
                <p className="text-gray-600">{t[lang].registerSubtitle}</p>
              </div>

              <form onSubmit={handleRegister} className="w-full max-w-sm space-y-5">
                {/* Username Input */}
                <div className="relative">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#FF8C69' }}>
                    {t[lang].username}
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full h-12 pr-12 rounded-xl border-2 focus:ring-2 transition-all"
                      style={{
                        borderColor: '#FFD9CC',
                      }}
                      required
                    />
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#FF8C69' }} />
                  </div>
                </div>

                {/* Email Input */}
                <div className="relative">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#FF8C69' }}>
                    {t[lang].email}
                  </label>
                  <div className="relative">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 pr-12 rounded-xl border-2 focus:ring-2 transition-all"
                      style={{
                        borderColor: '#FFD9CC',
                      }}
                      required
                    />
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#FF8C69' }} />
                  </div>
                </div>

                {/* Password Input */}
                <div className="relative">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#FF8C69' }}>
                    {t[lang].password}
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 pr-12 rounded-xl border-2 focus:ring-2 transition-all"
                      style={{
                        borderColor: '#FFD9CC',
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: '#FF8C69' }}
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

                {/* Register Button */}
                <button
                  type="submit"
                  onMouseEnter={() => setIsRegisterBtnHovered(true)}
                  onMouseLeave={() => {
                    setIsRegisterBtnHovered(false);
                    setIsRegisterBtnPressed(false);
                  }}
                  onMouseDown={() => setIsRegisterBtnPressed(true)}
                  onMouseUp={() => setIsRegisterBtnPressed(false)}
                  className="w-full text-white rounded-xl font-semibold text-lg mt-6"
                  style={{
                    background: 'linear-gradient(135deg, #FF8C69 0%, #FFB347 100%)',
                    padding: '14px',
                    boxShadow: isRegisterBtnPressed
                      ? '0 4px 12px rgba(255, 140, 105, 0.4)'
                      : (isRegisterBtnHovered ? '0 8px 24px rgba(255, 140, 105, 0.3)' : '0 4px 12px rgba(255, 140, 105, 0.2)'),
                    transform: isRegisterBtnPressed ? 'scale(0.97)' : (isRegisterBtnHovered ? 'scale(1.02)' : 'scale(1.00)'),
                    transition: isRegisterBtnPressed ? 'all 120ms ease-out' : 'all 150ms cubic-bezier(0.16,1,0.3,1)',
                  }}
                >
                  {t[lang].startExploring}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}