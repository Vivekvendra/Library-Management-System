import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Phone,
  MapPin,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LibraXLogo, BotanicalCornerSvg } from '../components/common/LibraXLogo';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5c-.2 1.2-1 2.3-2.1 3v2.5h3.4c2-1.8 3-4.5 3-7.3z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.7-2.4l-3.4-2.5c-.9.6-2.1 1-3.3 1-2.6 0-4.8-1.7-5.6-4.1H2.9v2.6C4.6 19.9 8 22 12 22z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H2.9C2.3 8.8 2 10.4 2 12s.3 3.2.9 4.6L6.4 14z"
      />
      <path
        fill="#EA4335"
        d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9C16.9 2.9 14.7 2 12 2 8 2 4.6 4.1 2.9 7.4L6.4 10c.8-2.4 3-4.1 5.6-4.1z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <rect x="3" y="3" width="8.5" height="8.5" fill="#F25022" />
      <rect x="12.5" y="3" width="8.5" height="8.5" fill="#7FBA00" />
      <rect x="3" y="12.5" width="8.5" height="8.5" fill="#00A4EF" />
      <rect x="12.5" y="12.5" width="8.5" height="8.5" fill="#FFB900" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#181717">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export default function AuthPage({ mode = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    login,
    register: registerUser,
    resetPassword,
    socialLogin,
    authLoading,
    getRememberedIdentifier,
  } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeNavModal, setActiveNavModal] = useState(null);
  const [resetSuccessInfo, setResetSuccessInfo] = useState(null);

  const fromPath = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      identifier: getRememberedIdentifier() || '',
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'Chief Librarian',
      rememberMe: Boolean(getRememberedIdentifier()),
    },
  });

  const onSubmit = async (data) => {
    if (mode === 'login') {
      const res = await login({
        identifier: data.identifier,
        password: data.password,
        rememberMe: data.rememberMe,
      });
      if (res.success) {
        navigate(fromPath, { replace: true });
      }
    } else if (mode === 'register') {
      const res = await registerUser({
        fullName: data.fullName,
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      if (res.success) {
        navigate('/dashboard', { replace: true });
      }
    } else if (mode === 'forgot') {
      const res = await resetPassword({
        email: data.email,
        newPassword: data.password,
      });
      if (res.success) {
        setResetSuccessInfo(res.email);
      }
    }
  };

  const handleSocialClick = async (provider) => {
    const res = await socialLogin(provider);
    if (res.success) {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleFillDemo = () => {
    setValue('identifier', 'admin@librax.com', { shouldValidate: true });
    setValue('password', 'password123', { shouldValidate: true });
    setValue('rememberMe', true);
  };

  return (
    <div
      className="h-screen w-full bg-cover bg-center bg-no-repeat relative flex flex-col justify-between overflow-hidden select-none"
      style={{
        backgroundImage: `url('/library-bg.png')`,
      }}
    >
      {/* Subtle warm radial vignette for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/10 pointer-events-none" />

      {/* Top Navigation Bar — Proportioned for 100% browser zoom */}
      <header className="relative z-20 w-full max-w-[1280px] mx-auto px-6 sm:px-12 lg:px-20 pt-4 sm:pt-5 pb-1 flex items-center justify-between">
        <Link to="/login" className="focus:outline-none lg:ml-4">
          <LibraXLogo size="md" />
        </Link>

        <nav className="hidden md:flex items-center gap-7 lg:gap-9">
          <button
            type="button"
            onClick={() => {
              setActiveNavModal(null);
              navigate('/login');
            }}
            className="relative py-1 text-[14px] font-medium text-[#5A3618] cursor-pointer transition"
          >
            Home
            {!activeNavModal && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-[#6E4420] rounded-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveNavModal('collections')}
            className={`relative py-1 text-[14px] font-medium transition cursor-pointer ${
              activeNavModal === 'collections'
                ? 'text-[#5A3618]'
                : 'text-[#6D5D4F] hover:text-[#3E2512]'
            }`}
          >
            Collections
            {activeNavModal === 'collections' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-[#6E4420] rounded-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveNavModal('about')}
            className={`relative py-1 text-[14px] font-medium transition cursor-pointer ${
              activeNavModal === 'about'
                ? 'text-[#5A3618]'
                : 'text-[#6D5D4F] hover:text-[#3E2512]'
            }`}
          >
            About
            {activeNavModal === 'about' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-[#6E4420] rounded-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveNavModal('contact')}
            className={`relative py-1 text-[14px] font-medium transition cursor-pointer ${
              activeNavModal === 'contact'
                ? 'text-[#5A3618]'
                : 'text-[#6D5D4F] hover:text-[#3E2512]'
            }`}
          >
            Contact
            {activeNavModal === 'contact' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-[#6E4420] rounded-full" />
            )}
          </button>

          <Link
            to={mode === 'login' ? '/register' : '/login'}
            className="bg-[#764B24] hover:bg-[#613C1B] text-white font-serif-display font-semibold text-[14.5px] px-7 py-2 rounded-full shadow-[0_4px_12px_rgba(92,54,24,0.32)] transition"
          >
            {mode === 'login' ? 'Login' : 'Sign In'}
          </Link>
        </nav>
      </header>

      {/* Main Content Area — Card aligned to right half and scaled cleanly for 100% zoom */}
      <main className="relative z-10 flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-10 lg:px-16 flex items-center justify-center lg:justify-end">
        <div className="w-full max-w-[385px] lg:mr-2 xl:mr-4 bg-[#FBF7F2]/96 backdrop-blur-md rounded-[22px] shadow-[0_20px_50px_rgba(32,18,8,0.24)] border border-[#EFE6DC] px-6 sm:px-7 py-5 sm:py-6 relative overflow-hidden">
          {/* Top-right decorative botanical leaf sprig */}
          <BotanicalCornerSvg className="absolute -top-1 -right-1 w-28 h-36 pointer-events-none select-none" />

          {/* Card Brand & Heading */}
          <div className="relative z-10">
            <LibraXLogo size="sm" />

            {mode === 'login' && (
              <>
                <h1 className="font-serif-display text-[25px] sm:text-[27px] font-bold text-[#1A120B] mt-2 tracking-tight leading-tight">
                  Login to Library
                </h1>
                <p className="text-[#6E6259] text-[13px] mt-0.5 mb-4">
                  Enter your credentials to continue
                </p>
              </>
            )}

            {mode === 'register' && (
              <>
                <h1 className="font-serif-display text-[23px] sm:text-[25px] font-bold text-[#1A120B] mt-2 tracking-tight leading-tight">
                  Join LibraX Library
                </h1>
                <p className="text-[#6E6259] text-[12.5px] mt-0.5 mb-3.5">
                  Register your librarian or member account
                </p>
              </>
            )}

            {mode === 'forgot' && (
              <>
                <h1 className="font-serif-display text-[23px] sm:text-[25px] font-bold text-[#1A120B] mt-2 tracking-tight leading-tight">
                  Reset Password
                </h1>
                <p className="text-[#6E6259] text-[12.5px] mt-0.5 mb-3.5">
                  Enter your registered email or username to set a new password
                </p>
              </>
            )}
          </div>

          {/* FORM SECTION */}
          {mode === 'forgot' && resetSuccessInfo ? (
            <div className="relative z-10 bg-[#F3ECE3] border border-[#DFD1C2] rounded-xl p-4 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#764B24]/15 text-[#764B24] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif-display font-bold text-base text-[#231710]">
                  Password Updated Successfully
                </h3>
                <p className="text-xs text-[#6E6259] mt-1">
                  Your password for{' '}
                  <span className="font-semibold text-[#231710]">
                    {resetSuccessInfo}
                  </span>{' '}
                  has been saved to Local Storage.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full bg-gradient-to-b from-[#7E522B] to-[#6B421E] hover:from-[#6E4623] hover:to-[#5A3617] text-white font-serif-display font-semibold text-sm py-2.5 rounded-xl shadow-md transition"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="relative z-10 space-y-3"
            >
              {/* LOGIN FIELDS */}
              {mode === 'login' && (
                <div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#6E6259] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Email or Username"
                      autoComplete="username"
                      {...register('identifier', {
                        required: 'Email or Username is required',
                        minLength: {
                          value: 3,
                          message: 'Must be at least 3 characters',
                        },
                      })}
                      className={`w-full bg-[#FAF8F5] border ${
                        errors.identifier
                          ? 'border-red-500 focus:border-red-600'
                          : 'border-[#E2DAD0] focus:border-[#764B24]'
                      } focus:bg-white rounded-xl pl-10 pr-3.5 py-2.5 text-[13.5px] text-[#231710] placeholder-[#786D63] outline-none transition`}
                    />
                  </div>
                  {errors.identifier && (
                    <p className="text-[11px] text-red-600 mt-0.5 pl-1 font-medium">
                      {errors.identifier.message}
                    </p>
                  )}
                </div>
              )}

              {/* REGISTER FIELDS */}
              {mode === 'register' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#6E6259] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Full Name"
                          {...register('fullName', {
                            required: 'Full name is required',
                            minLength: {
                              value: 2,
                              message: 'At least 2 characters',
                            },
                          })}
                          className={`w-full bg-[#FAF8F5] border ${
                            errors.fullName
                              ? 'border-red-500'
                              : 'border-[#E2DAD0] focus:border-[#764B24]'
                          } focus:bg-white rounded-xl pl-9 pr-2.5 py-2 text-[13px] text-[#231710] placeholder-[#786D63] outline-none transition`}
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-[11px] text-red-600 mt-0.5 pl-1">
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-[#6E6259] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Username"
                          {...register('username', {
                            required: 'Username is required',
                            minLength: {
                              value: 3,
                              message: 'Min 3 characters',
                            },
                          })}
                          className={`w-full bg-[#FAF8F5] border ${
                            errors.username
                              ? 'border-red-500'
                              : 'border-[#E2DAD0] focus:border-[#764B24]'
                          } focus:bg-white rounded-xl pl-9 pr-2.5 py-2 text-[13px] text-[#231710] placeholder-[#786D63] outline-none transition`}
                        />
                      </div>
                      {errors.username && (
                        <p className="text-[11px] text-red-600 mt-0.5 pl-1">
                          {errors.username.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#6E6259] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        placeholder="Email Address"
                        {...register('email', {
                          required: 'Email address is required',
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Please enter a valid email address',
                          },
                        })}
                        className={`w-full bg-[#FAF8F5] border ${
                          errors.email
                            ? 'border-red-500'
                            : 'border-[#E2DAD0] focus:border-[#764B24]'
                        } focus:bg-white rounded-xl pl-10 pr-3.5 py-2 text-[13px] text-[#231710] placeholder-[#786D63] outline-none transition`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-[11px] text-red-600 mt-0.5 pl-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* FORGOT PASSWORD EMAIL FIELD */}
              {mode === 'forgot' && (
                <div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#6E6259] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Registered Email or Username"
                      {...register('email', {
                        required: 'Please enter your registered email or username',
                      })}
                      className={`w-full bg-[#FAF8F5] border ${
                        errors.email
                          ? 'border-red-500'
                          : 'border-[#E2DAD0] focus:border-[#764B24]'
                      } focus:bg-white rounded-xl pl-10 pr-3.5 py-2.5 text-[13.5px] text-[#231710] placeholder-[#786D63] outline-none transition`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-red-600 mt-0.5 pl-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              )}

              {/* PASSWORD FIELD */}
              <div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6E6259] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={
                      mode === 'forgot' ? 'New Password (min 6 chars)' : 'Password'
                    }
                    autoComplete={
                      mode === 'login' ? 'current-password' : 'new-password'
                    }
                    {...register('password', {
                      required:
                        mode === 'forgot'
                          ? 'New password is required'
                          : 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    className={`w-full bg-[#FAF8F5] border ${
                      errors.password
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-[#E2DAD0] focus:border-[#764B24]'
                    } focus:bg-white rounded-xl pl-10 pr-10 py-2.5 text-[13.5px] text-[#231710] placeholder-[#786D63] outline-none transition`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E6259] hover:text-[#231710] p-1 cursor-pointer transition"
                  >
                    {showPassword ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-red-600 mt-0.5 pl-1 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* CONFIRM PASSWORD FIELD */}
              {(mode === 'register' || mode === 'forgot') && (
                <div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#6E6259] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (val) =>
                          val === getValues('password') || 'Passwords do not match',
                      })}
                      className={`w-full bg-[#FAF8F5] border ${
                        errors.confirmPassword
                          ? 'border-red-500'
                          : 'border-[#E2DAD0] focus:border-[#764B24]'
                      } focus:bg-white rounded-xl pl-10 pr-10 py-2 text-[13px] text-[#231710] placeholder-[#786D63] outline-none transition`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={
                        showConfirmPassword
                          ? 'Hide confirm password'
                          : 'Show confirm password'
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E6259] hover:text-[#231710] p-1 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[11px] text-red-600 mt-0.5 pl-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              )}

              {/* REMEMBER ME & FORGOT PASSWORD ROW (Login mode) */}
              {mode === 'login' && (
                <div className="flex items-center justify-between py-0.5">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      {...register('rememberMe')}
                      className="w-4 h-4 rounded border-2 border-[#764B24] accent-[#764B24] cursor-pointer"
                    />
                    <span className="text-[13px] font-medium text-[#241810]">
                      Remember me
                    </span>
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-[13px] font-medium text-[#6B4422] hover:text-[#482C14] hover:underline transition"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              {/* PRIMARY SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-b from-[#82552D] to-[#6B421E] hover:from-[#724824] hover:to-[#593516] disabled:opacity-60 text-white font-serif-display font-semibold text-[16px] py-2.5 rounded-xl shadow-[0_6px_16px_rgba(110,68,32,0.3)] transition cursor-pointer"
              >
                {authLoading
                  ? 'Please wait...'
                  : mode === 'login'
                  ? 'Login'
                  : mode === 'register'
                  ? 'Create Account'
                  : 'Update Password'}
              </button>

              {/* SOCIAL LOGIN SECTION (Login mode — matches screenshot) */}
              {mode === 'login' && (
                <>
                  <div className="flex items-center gap-3 pt-1 pb-0.5">
                    <div className="flex-1 h-px bg-[#E3DBD1]" />
                    <span className="text-[12px] text-[#6E6259]">
                      or continue with
                    </span>
                    <div className="flex-1 h-px bg-[#E3DBD1]" />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSocialClick('Google')}
                      title="Continue with Google"
                      className="bg-white hover:bg-[#FAF6F0] border border-[#EDE6DD] rounded-xl py-2 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-sm transition cursor-pointer"
                    >
                      <GoogleIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSocialClick('Microsoft')}
                      title="Continue with Microsoft"
                      className="bg-white hover:bg-[#FAF6F0] border border-[#EDE6DD] rounded-xl py-2 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-sm transition cursor-pointer"
                    >
                      <MicrosoftIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSocialClick('GitHub')}
                      title="Continue with GitHub"
                      className="bg-white hover:bg-[#FAF6F0] border border-[#EDE6DD] rounded-xl py-2 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-sm transition cursor-pointer"
                    >
                      <GitHubIcon />
                    </button>
                  </div>
                </>
              )}

              {/* COMPACT SWITCH AUTH MODE & DEMO FILL */}
              <div className="pt-1.5 border-t border-[#EAE2D8]/80 flex items-center justify-between gap-2 text-[12px]">
                {mode === 'login' ? (
                  <>
                    <span className="text-[#6E6259]">
                      New here?{' '}
                      <Link
                        to="/register"
                        className="font-semibold text-[#764B24] hover:underline"
                      >
                        Register
                      </Link>
                    </span>
                    <button
                      type="button"
                      onClick={handleFillDemo}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#764B24] bg-[#F2E9DF] hover:bg-[#E7D8C7] px-2 py-0.5 rounded-md transition cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      Demo Fill
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 font-semibold text-[#764B24] hover:underline mx-auto"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Login to Library
                  </Link>
                )}
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Top Navbar Info Modal */}
      {activeNavModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBF7F2] border border-[#E5DACB] rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setActiveNavModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#EFE7DC] hover:bg-[#E2D4C3] flex items-center justify-center text-[#3D2715] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <LibraXLogo size="sm" />

            {activeNavModal === 'collections' && (
              <div className="mt-3 space-y-2.5">
                <h2 className="font-serif-display text-xl font-bold text-[#1A120B]">
                  Curated Library Collections
                </h2>
                <p className="text-xs text-[#6E6259] leading-relaxed">
                  LibraX houses scholarly and literary categories synced dynamically via third-party APIs and local archival records:
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-medium text-[#3D2715]">
                  <div className="bg-white p-2.5 rounded-xl border border-[#EAE0D5] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#764B24]" />
                    Classic Literature
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#EAE0D5] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#764B24]" />
                    Science & Tech
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#EAE0D5] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#764B24]" />
                    History & Philosophy
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#EAE0D5] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#764B24]" />
                    Art & Design
                  </div>
                </div>
              </div>
            )}

            {activeNavModal === 'about' && (
              <div className="mt-3 space-y-2.5">
                <h2 className="font-serif-display text-xl font-bold text-[#1A120B]">
                  About LibraX LMS
                </h2>
                <p className="text-xs text-[#6E6259] leading-relaxed">
                  LibraX is a Library Management System engineered with React.js, Tailwind CSS, Context API, React Hook Form, and live Third-Party API synchronization.
                </p>
                <div className="bg-white p-3.5 rounded-xl border border-[#EAE0D5] flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#764B24] shrink-0 mt-0.5" />
                  <div className="text-xs text-[#5A4D41] space-y-1">
                    <p className="font-semibold text-[#231710]">Default Librarian Credentials:</p>
                    <p>Email / Username: <code className="bg-[#F4EFEA] px-1.5 py-0.5 rounded">admin@librax.com</code></p>
                    <p>Password: <code className="bg-[#F4EFEA] px-1.5 py-0.5 rounded">password123</code></p>
                  </div>
                </div>
              </div>
            )}

            {activeNavModal === 'contact' && (
              <div className="mt-3 space-y-2.5">
                <h2 className="font-serif-display text-xl font-bold text-[#1A120B]">
                  Contact Central Archive
                </h2>
                <p className="text-xs text-[#6E6259]">
                  Need assistance with your library membership or catalog access?
                </p>
                <div className="space-y-2 text-xs text-[#3D2715] bg-white p-3.5 rounded-xl border border-[#EAE0D5]">
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#764B24]" />
                    archive-desk@librax.org
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#764B24]" />
                    +1 (555) 234-8910
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#764B24]" />
                    42 Heritage Square, Grand Reading Hall
                  </p>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveNavModal(null)}
                className="bg-[#764B24] hover:bg-[#5E3A1B] text-white text-xs font-medium px-4 py-2 rounded-xl cursor-pointer transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom breathing room so wooden desk is clearly visible below the card */}
      <div className="h-4 sm:h-6 shrink-0" />
    </div>
  );
}
