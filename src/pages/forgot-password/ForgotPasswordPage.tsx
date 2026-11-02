/**
 * Forgot Password Page
 * 1) saisie de l'e-mail  2) saisie du code reçu par e-mail  3) nouveau mot de passe + confirmation
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '@/services/api/authService';
import { getErrorMessage } from '@/utils/errorHandler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Step = 'email' | 'code' | 'password';

const RESEND_DELAY_SECONDS = 60;
const MIN_PASSWORD_LENGTH = 8;

const STEP_NUMBER: Record<Step, number> = { email: 1, code: 2, password: 3 };
const STEP_TITLE: Record<Step, string> = {
  email: 'Mot de passe oublié',
  code: 'Vérification du code',
  password: 'Nouveau mot de passe',
};

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const sendCode = async () => {
    await authService.forgotPassword(email.trim());
    setCooldown(RESEND_DELAY_SECONDS);
    setInfo(`Un code de vérification a été envoyé à ${email.trim()}. Il est valable 10 minutes.`);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await sendCode();
      setCode('');
      setStep('code');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setLoading(true);
    try {
      await sendCode();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { resetToken: token } = await authService.verifyResetCode({
        email: email.trim(),
        code,
      });
      setResetToken(token);
      setInfo(null);
      setStep('password');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({ email: email.trim(), resetToken, newPassword });
      navigate('/login', {
        replace: true,
        state: { message: 'Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter.' },
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const backToEmail = () => {
    setStep('email');
    setCode('');
    setError(null);
    setInfo(null);
  };

  return (
    <div className="container mx-auto flex justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-sm text-muted-foreground">Étape {STEP_NUMBER[step]} sur 3</p>
          <CardTitle>{STEP_TITLE[step]}</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {info && (
            <div className="mb-4 rounded-md border border-green-600/30 bg-green-50 p-3 text-sm text-green-800">
              {info}
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Saisissez l&apos;adresse e-mail de votre compte. Nous vous enverrons un code de
                vérification.
              </p>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Envoi en cours...' : 'Envoyer le code'}
              </Button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code de vérification</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="\d{6}"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  autoFocus
                  disabled={loading}
                  className="text-center text-xl tracking-[0.5em]"
                />
              </div>
              <Button type="submit" disabled={loading || code.length !== 6} className="w-full">
                {loading ? 'Vérification...' : 'Vérifier le code'}
              </Button>
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={backToEmail}
                  className="text-muted-foreground underline hover:text-primary"
                >
                  Modifier l&apos;e-mail
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading || cooldown > 0}
                  className="text-primary underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
                >
                  {cooldown > 0 ? `Renvoyer le code (${cooldown} s)` : 'Renvoyer le code'}
                </button>
              </div>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">
                  Nouveau mot de passe ({MIN_PASSWORD_LENGTH} caractères minimum)
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoFocus
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Enregistrement...' : 'Réinitialiser le mot de passe'}
              </Button>
            </form>
          )}

          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary underline">
              Retour à la connexion
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
