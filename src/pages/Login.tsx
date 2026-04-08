// src/pages/Login.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert, Input, Button, ThemeToggle } from '../components';
import { validateEmail } from '../utils/validation';

export default function Login() {
  const { login, isLoading, error, clearError, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    if (!formData.email || !validateEmail(formData.email)) {
      errors.email = 'Valid email required';
      isValid = false;
    }

    if (!formData.password || formData.password.length < 8) {
      errors.password = 'password must be a 8 characters log';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch {
      // Error is handled by context
    }
  };

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl">
        <section className="glass-panel-strong w-full rounded-[36px] border p-8 sm:p-10 animate-slide-up">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold theme-text">Sign in to TaskFlow</h1>
              <p className="mt-3 text-base theme-text-soft">
              Manage your tasks in a workspace that feels modern and easy from the first screen.
              </p>
            </div>
            <ThemeToggle compact />
          </div>

          {error && (
            <Alert 
              type="error" 
              message={error} 
              onClose={clearError}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              error={formErrors.email}
              required
            />

            <div>
              <label className="mb-2 block text-sm font-semibold theme-text-soft">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`theme-input glass-panel-strong w-full rounded-2xl border px-4 py-3.5 pr-12 outline-none transition-all duration-200 ${
                    formErrors.password
                      ? 'border-red-300 bg-red-50/80 focus:border-red-400 focus:ring-4 focus:ring-red-100'
                      : 'focus:border-primary-400 focus:ring-4 focus:ring-primary-100'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 theme-text-muted transition-colors duration-200 hover:text-primary-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-2 text-sm font-medium text-red-600">{formErrors.password}</p>
              )}
            </div>

            <Button type="submit" loading={isLoading} className="mt-2 w-full" size="lg">
              Sign in
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm theme-text-soft">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-primary-700 transition-colors duration-200 hover:text-primary-800">
                Create one
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
