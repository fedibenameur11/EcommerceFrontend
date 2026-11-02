import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, ClipboardList, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps';
import { CartSummary } from '@/components/cart/CartSummary';
import { useAppSelector } from '@/store/hooks';
import { selectCartItems } from '@/store/slices/cartSlice';
import { formatPrice } from '@/lib/utils';
import type { Order } from '@/models/order';

/** Écran affiché une fois la commande enregistrée */
function OrderConfirmation({ order }: { order: Order }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <CheckoutSteps current={3} />
      <div className="mx-auto max-w-xl animate-fade-up rounded-3xl border bg-card p-8 text-center shadow-sm sm:p-12">
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
          <span className="absolute inset-0 animate-ring rounded-full bg-emerald-400/40" />
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/30">
            <Check className="h-12 w-12 animate-pop text-white" strokeWidth={3} />
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Commande confirmée !</h1>
        <p className="mt-2 text-muted-foreground">
          Merci pour votre achat. Nous préparons votre colis.
        </p>

        <dl className="mx-auto mt-8 max-w-sm space-y-3 rounded-2xl bg-muted/50 p-5 text-left text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Numéro de commande</dt>
            <dd className="font-semibold">{order.orderNumber}</dd>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between gap-4 text-emerald-600">
              <dt>Code {order.couponCode}</dt>
              <dd className="font-semibold">-{formatPrice(order.discountAmount)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4 border-t pt-3 text-base">
            <dt className="font-semibold">À payer à la livraison</dt>
            <dd className="font-extrabold text-primary">{formatPrice(order.total)}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/orders">
              <ClipboardList className="mr-2 h-4 w-4" />
              Suivre mes commandes
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-8">
            <Link to="/#produits">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continuer mes achats
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Checkout page with form and order summary
 */
export function CheckoutPage() {
  const cartItems = useAppSelector(selectCartItems);
  // La commande validée est conservée ici : le formulaire vide le panier juste après l'envoi
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (confirmedOrder) {
    return <OrderConfirmation order={confirmedOrder} />;
  }

  // Redirect to cart if empty
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10">
        <EmptyState
          variant="cart"
          title="Votre panier est vide"
          description="Ajoutez des articles à votre panier avant de passer commande."
        >
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/#produits">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continuer vos achats
            </Link>
          </Button>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CheckoutSteps current={2} />

      {/* Header */}
      <div className="mb-8">
        <Button asChild variant="ghost" className="-ml-3 mb-2">
          <Link to="/cart">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au panier
          </Link>
        </Button>
        <h1 className="text-3xl font-extrabold tracking-tight">Passer la commande</h1>
        <p className="text-muted-foreground">
          Finalisez votre commande en renseignant vos informations ci-dessous.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <CheckoutForm onSuccess={setConfirmedOrder} />
        </div>

        {/* Order Summary */}
        <div className="space-y-4 lg:sticky lg:top-40 lg:self-start">
          <CartSummary showCheckoutButton={false} />

          {/* Cart Items Preview */}
          <div className="rounded-3xl border bg-card p-5 shadow-sm">
            <h3 className="mb-4 font-bold">Articles de la commande</h3>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={`${item.product.id}-${item.size ?? ''}`} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 flex-shrink-0 rounded-xl border bg-white">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-full w-full rounded-xl object-contain p-1"
                    />
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                      {item.quantity}
                    </span>
                  </div>
                  <p className="flex-1 truncate text-sm">{item.product.name}</p>
                  <p className="text-sm font-semibold tabular-nums">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
