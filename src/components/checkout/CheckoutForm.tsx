import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, MapPin, Loader2, Banknote, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearCart, selectCartItemCount, selectCartItems, selectCoupon } from '@/store/slices/cartSlice';
import orderService from '@/services/api/orderService';
import { getErrorMessage } from '@/utils/errorHandler';
import { checkoutSchema, type CheckoutFormData } from '@/lib/validations';
import { PHONE_LENGTH, sanitizePhone, toLocalPhone } from '@/lib/phone';
import { cn, formatPrice, PAYMENT_METHOD_LABEL, SHIPPING_FEE } from '@/lib/utils';
import type { Order } from '@/models/order';

const countries = [
  { value: 'TN', label: 'Tunisie' },
  { value: 'US', label: 'États-Unis' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'Royaume-Uni' },
  { value: 'DE', label: 'Allemagne' },
  { value: 'FR', label: 'France' },
  { value: 'TR', label: 'Turquie' },
];

interface CheckoutFormProps {
  /** Appelé avec la commande créée : la page affiche alors l'écran de confirmation */
  onSuccess: (order: Order) => void;
}

function Section({
  step,
  icon: Icon,
  title,
  children,
}: {
  step: number;
  icon: typeof User;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <header className="flex items-center gap-3 border-b bg-gradient-to-r from-primary/5 to-transparent px-6 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Étape {step}</p>
          <h2 className="font-bold leading-tight">{title}</h2>
        </div>
      </header>
      <div className="p-6">{children}</div>
    </section>
  );
}

const fieldClass = (hasError: boolean) =>
  cn('h-11 rounded-xl', hasError && 'border-destructive focus-visible:ring-destructive');

/**
 * Checkout form component with validation
 */
export function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const dispatch = useAppDispatch();
  const itemCount = useAppSelector(selectCartItemCount);
  const cartItems = useAppSelector(selectCartItems);
  const coupon = useAppSelector(selectCoupon);
  const user = useAppSelector((state) => state.auth.user);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phone: toLocalPhone(user?.phoneNumber),
      address: user?.address ?? '',
      city: '',
      zipCode: '',
      country: 'TN',
    },
  });

  const country = useWatch({ control, name: 'country' });

  const onSubmit = async (data: CheckoutFormData) => {
    if (itemCount === 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Paiement en espèces à la livraison uniquement ; le serveur recalcule la remise du code promo
      const order = await orderService.createOrder({
        shippingAddress: `${data.address}, ${data.zipCode} ${data.city}, ${data.country}`,
        couponCode: coupon?.code,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          size: item.size,
        })),
      });

      dispatch(clearCart());
      onSuccess(order);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Personal Information */}
      <Section step={1} icon={User} title="Informations personnelles">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              {...register('firstName')}
              placeholder="Jean"
              className={fieldClass(!!errors.firstName)}
            />
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              {...register('lastName')}
              placeholder="Dupont"
              className={fieldClass(!!errors.lastName)}
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="jean@exemple.com"
              className={fieldClass(!!errors.email)}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              maxLength={PHONE_LENGTH}
              {...register('phone', {
                onChange: (e) => {
                  e.target.value = sanitizePhone(e.target.value);
                },
              })}
              placeholder="12345678"
              className={fieldClass(!!errors.phone)}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>
        </div>
      </Section>

      {/* Shipping Address */}
      <Section step={2} icon={MapPin} title="Adresse de livraison">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="12 rue de la République"
              className={fieldClass(!!errors.address)}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Ville</Label>
            <Input
              id="city"
              {...register('city')}
              placeholder="Tunis"
              className={fieldClass(!!errors.city)}
            />
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipCode">Code postal</Label>
            <Input
              id="zipCode"
              {...register('zipCode')}
              placeholder="1000"
              className={fieldClass(!!errors.zipCode)}
            />
            {errors.zipCode && (
              <p className="text-sm text-destructive">{errors.zipCode.message}</p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="country">Pays</Label>
            <Select
              value={country}
              onValueChange={(value) => setValue('country', value, { shouldValidate: true })}
            >
              <SelectTrigger id="country" className={cn('h-11 rounded-xl', errors.country && 'border-destructive')}>
                <SelectValue placeholder="Sélectionnez un pays" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-sm text-destructive">{errors.country.message}</p>
            )}
          </div>
        </div>
      </Section>

      {/* Payment: cash on delivery only */}
      <Section step={3} icon={Banknote} title="Mode de paiement">
        <div className="flex items-start gap-4 rounded-2xl border-2 border-primary bg-primary/5 p-4">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-primary">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          <div className="space-y-1 text-sm">
            <p className="font-semibold">{PAYMENT_METHOD_LABEL}</p>
            <p className="text-muted-foreground">
              Vous réglez le montant de la commande directement au livreur, en main propre. Frais de livraison :{' '}
              {formatPrice(SHIPPING_FEE)}.
            </p>
          </div>
        </div>
      </Section>

      {submitError && (
        <div role="alert" className="animate-fade-in rounded-xl border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {submitError}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="h-14 w-full rounded-2xl text-base shadow-lg shadow-primary/25"
        disabled={isSubmitting || itemCount === 0}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Valider la commande
          </>
        )}
      </Button>

      {itemCount === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Votre panier est vide. Ajoutez des articles pour passer commande.
        </p>
      )}
    </form>
  );
}
