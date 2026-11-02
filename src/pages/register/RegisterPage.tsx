/**
 * Register Page
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Loader2, Lock, Mail, MapPin, Phone, Store, Truck, TriangleAlert, User, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { clearError } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { AuthShell } from '@/components/auth/AuthShell';
import { AuthField } from '@/components/auth/AuthField';
import { cn } from '@/lib/utils';
import { PHONE_ERROR, PHONE_LENGTH, isValidPhoneNumber, sanitizePhone } from '@/lib/phone';

/** Niveau de robustesse du mot de passe, de 0 à 4 (longueur, majuscule, chiffre, symbole) */
function passwordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

const STRENGTH_LABELS = ['Trop court', 'Faible', 'Moyen', 'Bon', 'Excellent'];
const STRENGTH_COLORS = ['bg-border', 'bg-red-500', 'bg-amber-500', 'bg-lime-500', 'bg-emerald-500'];

const ACCOUNT_OPTIONS = [
  { value: 'seller', icon: Store, title: 'Devenir vendeur', description: 'Gérer votre propre catalogue de produits.' },
  { value: 'delivery', icon: Truck, title: 'Devenir livreur', description: 'Recevoir des livraisons et suivre vos gains.' },
] as const;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  // Type de compte : client par defaut ; vendeur et livreur sont exclusifs
  const [accountType, setAccountType] = useState<'customer' | 'seller' | 'delivery'>('customer');
  const isSeller = accountType === 'seller';
  const isDelivery = accountType === 'delivery';
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Téléphone : 8 chiffres exactement (lettres et symboles tapés ou collés sont retirés)
    setFormData((prev) => ({ ...prev, [name]: name === 'phoneNumber' ? sanitizePhone(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (formData.password.length < 8) {
      setLocalError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (isDelivery && !formData.phoneNumber.trim()) {
      setLocalError('Le numéro de téléphone est obligatoire pour un compte livreur.');
      return;
    }
    if (formData.phoneNumber && !isValidPhoneNumber(formData.phoneNumber)) {
      setLocalError(PHONE_ERROR);
      return;
    }
    const { confirmPassword: _confirm, ...payload } = formData;
    try {
      await register({ ...payload, isSeller, isDelivery });
      navigate('/login', { state: { message: 'Compte créé avec succès : vous pouvez maintenant vous connecter.' } });
    } catch {
      // L'erreur est exposée par le hook (error)
    }
  };

  const message = localError ?? error;
  const strength = passwordStrength(formData.password);
  const mismatch = formData.confirmPassword !== '' && formData.confirmPassword !== formData.password;

  return (
    <AuthShell
      wide
      icon={<UserPlus className="h-6 w-6" />}
      title="Créer un compte"
      subtitle="Rejoignez TounsiBuy en quelques secondes."
      footer={
        <>
          Déjà inscrit ?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Se connecter
          </Link>
        </>
      }
    >
      {message && (
        <div
          key={message}
          role="alert"
          className="mb-5 flex animate-fade-in items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <AuthField
            id="firstName"
            name="firstName"
            label="Prénom"
            icon={<User />}
            autoComplete="given-name"
            value={formData.firstName}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <AuthField
            id="lastName"
            name="lastName"
            label="Nom"
            icon={<User />}
            autoComplete="family-name"
            value={formData.lastName}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <AuthField
          id="email"
          name="email"
          type="email"
          label="Adresse e-mail"
          icon={<Mail />}
          placeholder="vous@exemple.com"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <AuthField
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            label={isDelivery ? 'Téléphone' : 'Téléphone (facultatif)'}
            icon={<Phone />}
            autoComplete="tel"
            inputMode="numeric"
            maxLength={PHONE_LENGTH}
            placeholder="12345678"
            value={formData.phoneNumber}
            onChange={handleChange}
            required={isDelivery}
            disabled={loading}
          />
          <AuthField
            id="address"
            name="address"
            label="Adresse (facultatif)"
            icon={<MapPin />}
            autoComplete="street-address"
            value={formData.address}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="grid items-start gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <AuthField
            id="password"
            name="password"
            type="password"
            label="Mot de passe"
            icon={<Lock />}
            placeholder="8 caractères minimum"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
          {formData.password && (
            <div className="animate-fade-in" aria-live="polite">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((level) => (
                  <span
                    key={level}
                    className={cn(
                      'h-1.5 flex-1 rounded-full transition-colors duration-300',
                      strength >= level ? STRENGTH_COLORS[strength] : 'bg-border'
                    )}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Robustesse : <span className="font-medium text-foreground">{STRENGTH_LABELS[strength]}</span>
              </p>
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <AuthField
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirmer le mot de passe"
            icon={<Lock />}
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
            className={mismatch ? 'border-destructive focus:border-destructive focus:ring-destructive/10' : undefined}
          />
          {mismatch && <p className="animate-fade-in text-xs text-destructive">Les mots de passe ne correspondent pas.</p>}
        </div>
        </div>

        <fieldset className="grid gap-3 sm:grid-cols-2" disabled={loading}>
          <legend className="mb-2 text-sm font-medium">Type de compte <span className="font-normal text-muted-foreground">(facultatif : sans choix, compte client)</span></legend>
          {ACCOUNT_OPTIONS.map(({ value, icon: Icon, title, description }) => (
            <label
              key={value}
              className={cn(
                'relative flex cursor-pointer flex-col gap-1 rounded-xl border p-3.5 text-sm transition-all focus-within:ring-2 focus-within:ring-ring',
                accountType === value ? 'border-primary bg-primary/5' : 'hover:border-primary/40'
              )}
            >
              <input
                type="checkbox"
                name="accountType"
                value={value}
                checked={accountType === value}
                onChange={() => setAccountType(accountType === value ? 'customer' : value)}
                className="sr-only"
              />
              <span className="flex items-center gap-1.5 font-semibold">
                <Icon className="h-4 w-4 text-primary" />
                {title}
              </span>
              <span className="text-xs leading-snug text-muted-foreground">{description}</span>
            </label>
          ))}
        </fieldset>

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="h-12 w-full rounded-xl text-base shadow-lg shadow-primary/25"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Inscription en cours...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Créer mon compte
            </>
          )}
        </Button>
      </form>
    </AuthShell>
  );
};

export default RegisterPage;
