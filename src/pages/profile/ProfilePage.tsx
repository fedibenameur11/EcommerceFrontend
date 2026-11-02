/**
 * Profile Page
 */

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import userService from '@/services/api/userService';
import { setUser } from '@/services/storage/tokenService';
import { login } from '@/store/slices/authSlice';
import { getErrorMessage } from '@/utils/errorHandler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PHONE_ERROR, PHONE_LENGTH, isValidPhoneNumber, sanitizePhone, toLocalPhone } from '@/lib/phone';
import type { UpdateUserProfile } from '@/models/user';

const fields = [
  { name: 'firstName', label: 'Prénom', required: true },
  { name: 'lastName', label: 'Nom', required: true },
  { name: 'phoneNumber', label: 'Téléphone', required: false },
  { name: 'address', label: 'Adresse', required: false },
] as const;

export const ProfilePage = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [form, setForm] = useState<UpdateUserProfile>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    userService
      .getCurrentUser()
      .then((u) => {
        setEmail(u.email);
        setForm({
          firstName: u.firstName,
          lastName: u.lastName,
          phoneNumber: toLocalPhone(u.phoneNumber),
          address: u.address ?? '',
        });
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.phoneNumber && !isValidPhoneNumber(form.phoneNumber)) {
      setError(PHONE_ERROR);
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await userService.updateProfile(form);
      // PUT renvoie 204 : on recharge le profil pour garder store et localStorage à jour
      const profile = await userService.getCurrentUser();
      setUser(profile);
      dispatch(login(profile));
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto flex justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Mon profil</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              {saved && <p className="text-sm text-green-600">Profil mis à jour.</p>}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} disabled readOnly />
              </div>
              {fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Input
                    id={field.name}
                    value={form[field.name]}
                    required={field.required}
                    {...(field.name === 'phoneNumber' && { type: 'tel', inputMode: 'numeric', maxLength: PHONE_LENGTH, placeholder: '12345678' })}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        [field.name]: field.name === 'phoneNumber' ? sanitizePhone(e.target.value) : e.target.value,
                      }))
                    }
                  />
                </div>
              ))}
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
