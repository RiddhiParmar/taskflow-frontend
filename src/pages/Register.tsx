// src/pages/Register.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert, Input, Button, ThemeToggle } from '../components';
import { validateEmail, validatePassword, validateName } from '../utils/validation';

export default function Register() {
  const { register, isLoading, error, clearError, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    if (!formData.firstName || !validateName(formData.firstName)) {
      errors.firstName = 'First name must be 2-50 characters';
      isValid = false;
    }

    if (!formData.lastName || !validateName(formData.lastName)) {
      errors.lastName = 'Last name must be 2-50 characters';
      isValid = false;
    }

    if (!formData.email || !validateEmail(formData.email)) {
      errors.email = 'Valid email required';
      isValid = false;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0];
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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

    if (name === 'password') {
      const validation = validatePassword(value);
      setPasswordStrength(validation.isValid ? 'strong' : value.length >= 6 ? 'medium' : 'weak');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await register(formData.email, formData.firstName, formData.lastName, formData.password);
      navigate('/signin');
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
              <h1 className="text-4xl font-bold theme-text">Create your account</h1>
              <p className="mt-3 text-base theme-text-soft">
              Set up a clean task management workspace with a modern UI that still feels simple.
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
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="First Name"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                error={formErrors.firstName}
                required
              />

              <Input
                label="Last Name"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                error={formErrors.lastName}
              required
            />
            </div>

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

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold theme-text-soft">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`theme-input glass-panel-strong w-full rounded-2xl border px-4 py-3.5 pr-12 outline-none transition ${
                    formErrors.password
                      ? 'border-red-300 bg-red-50/80 focus:border-red-400 focus:ring-4 focus:ring-red-100'
                      : 'focus:border-primary-400 focus:ring-4 focus:ring-primary-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 theme-text-muted transition hover:text-primary-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-2 text-sm font-medium text-red-600">{formErrors.password}</p>
              )}
              {passwordStrength && (
                <div className="mt-2">
                  <div className="mb-2 text-xs font-medium theme-text-soft">
                    Strength: <span className={
                      passwordStrength === 'weak' ? 'text-red-600' :
                      passwordStrength === 'medium' ? 'text-amber-600' :
                      'text-primary-700'
                    }>
                      {passwordStrength.toUpperCase()}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--chip-bg)]">
                    <div
                      className={`h-full transition-all ${
                        passwordStrength === 'weak'
                          ? 'w-1/3 bg-red-500'
                          : passwordStrength === 'medium'
                            ? 'w-2/3 bg-amber-500'
                            : 'w-full bg-primary-600'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              error={formErrors.confirmPassword}
              required
            />

            <Button type="submit" loading={isLoading} className="mt-2 w-full" size="lg">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm theme-text-soft">
            Already have an account?{' '}
            <Link to="/signin" className="font-semibold text-primary-700 hover:text-primary-800">
              Sign In
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
