/**
 * Login Page
 */

import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { CheckCircle2, Loader2, Lock, LogIn, Mail, TriangleAlert } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/context/NotificationContext';
import { clearError } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { AuthShell } from '@/components/auth/AuthShell';
import { AuthField } from '@/components/auth/AuthField';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { login, loading, error } = useAuth();
  const { showNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const locationState = location.state as { from?: string; message?: string } | null;
  const from = locationState?.from ?? '/';
  // Message de succès transmis par la page de réinitialisation du mot de passe
  const successMessage = locationState?.message;

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const profile = await login({ email, password });
      navigate(from === '/' && profile.role === 'Delivery' ? '/delivery' : from, { replace: true });
      showNotification(`Bienvenue, ${profile.firstName} !`, 'success');
    } catch {
      // L'erreur est exposée par le hook (error)
    }
  };

  return (
    <AuthShell
      icon={<LogIn className="h-6 w-6" />}
      title="Bon retour !"
      subtitle="Connectez-vous pour retrouver votre panier, vos favoris et vos commandes."
      footer={
        <>
          Pas encore de compte ?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Créer un compte
          </Link>
        </>
      }
    >
      {successMessage && !error && (
        <div
          role="status"
          className="mb-5 flex animate-fade-in items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {successMessage}
        </div>
      )}
      {error && (
        <div
          key={error}
          role="alert"
          className="mb-5 flex animate-fade-in items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          id="email"
          label="Adresse e-mail"
          type="email"
          icon={<Mail />}
          placeholder="vous@exemple.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <AuthField
          id="password"
          label="Mot de passe"
          type="password"
          icon={<Lock />}
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          labelAside={
            <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
              Mot de passe oublié ?
            </Link>
          }
        />
        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="h-12 w-full rounded-xl text-base shadow-lg shadow-primary/25"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connexion en cours...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Se connecter
            </>
          )}
        </Button>
      </form>
    </AuthShell>
  );
};

export default LoginPage;
