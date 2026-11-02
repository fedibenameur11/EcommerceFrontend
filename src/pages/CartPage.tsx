import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCartItems, clearCart } from '@/store/slices/cartSlice';
import { useNotification } from '@/context/NotificationContext';

/**
 * Cart page showing all cart items and summary
 */
export function CartPage() {
  const dispatch = useAppDispatch();
  const { showNotification } = useNotification();
  const cartItems = useAppSelector(selectCartItems);

  const handleClearCart = () => {
    if (window.confirm('Voulez-vous vraiment vider votre panier ?')) {
      dispatch(clearCart());
      showNotification('Votre panier a été vidé', 'info');
    }
  };

  // Empty Cart State
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10">
        <EmptyState
          variant="cart"
          title="Votre panier est vide"
          description="Vous n'avez pas encore ajouté d'article. Parcourez la boutique et trouvez votre bonheur."
        >
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/#produits">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Découvrir la boutique
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-8">
            <Link to="/categories">Voir les catégories</Link>
          </Button>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CheckoutSteps current={1} />

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Mon panier</h1>
          <p className="text-muted-foreground">
            {cartItems.length} {cartItems.length === 1 ? 'article' : 'articles'} dans votre panier
          </p>
        </div>
        <Button variant="ghost" onClick={handleClearCart} className="text-muted-foreground hover:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Vider le panier
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
            {cartItems.map((item) => (
              <CartItem key={`${item.product.id}-${item.size ?? ''}`} item={item} />
            ))}
          </div>

          <div className="mt-4">
            <Button asChild variant="ghost">
              <Link to="/#produits">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continuer vos achats
              </Link>
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-40 lg:self-start">
          <CartSummary />
        </div>
      </div>
    </div>
  );
}
