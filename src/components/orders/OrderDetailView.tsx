import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Check, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatPrice } from '@/lib/utils';
import { formatDateTime } from '@/utils/formatDate';
import { orderStatusLabel } from '@/utils/labels';
import { sizeNoun } from '@/utils/productOptions';
import type { Order, OrderStatus } from '@/models/order';

const TIMELINE: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered'];

interface OrderDetailViewProps {
  order: Order;
  /** Affiche le client (vue administrateur) */
  showCustomer?: boolean;
  /** Boutons d'action (annuler, changer le statut...) affichés en haut à droite */
  actions?: ReactNode;
}

const InfoRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="font-medium sm:text-right">{children}</dd>
  </div>
);

/**
 * Détail d'une commande : suivi du statut, informations, articles et total.
 * Utilisé par la page client (/orders/:id) et la page administrateur (/admin/orders/:id).
 */
export function OrderDetailView({ order, showCustomer = false, actions }: OrderDetailViewProps) {
  const subtotal = order.subtotal ?? order.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = order.deliveryFee ?? 0;
  const total = order.total ?? subtotal + deliveryFee;
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const cancelled = order.status === 'Cancelled';
  const currentStep = TIMELINE.indexOf(order.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Commande {order.orderNumber}</h1>
          <p className="mt-1 text-muted-foreground">Passée le {formatDateTime(order.orderDate)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={cancelled ? 'destructive' : 'secondary'} className="text-sm">
            {orderStatusLabel(order.status)}
          </Badge>
          {actions}
        </div>
      </div>

      {/* Suivi */}
      <Card>
        <CardHeader>
          <CardTitle>Suivi de la commande</CardTitle>
        </CardHeader>
        <CardContent>
          {cancelled ? (
            <p className="text-sm text-destructive">Cette commande a été annulée.</p>
          ) : (
            <ol className="grid grid-cols-4 gap-2">
              {TIMELINE.map((step, index) => {
                const done = index <= currentStep;
                return (
                  <li key={step} className="flex flex-col items-center gap-2 text-center">
                    <span
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold',
                        done
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/30 text-muted-foreground'
                      )}
                    >
                      {done ? <Check className="h-4 w-4" /> : index + 1}
                    </span>
                    <span className={cn('text-xs sm:text-sm', done ? 'font-medium' : 'text-muted-foreground')}>
                      {orderStatusLabel(step)}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              {showCustomer && (
                <>
                  <InfoRow label="Client">{order.customerName || `Utilisateur #${order.userId}`}</InfoRow>
                  {order.customerEmail && <InfoRow label="E-mail">{order.customerEmail}</InfoRow>}
                  {order.customerPhone && order.customerPhone !== '-' && (
                    <InfoRow label="Téléphone">{order.customerPhone}</InfoRow>
                  )}
                </>
              )}
              <InfoRow label="Livreur">
                {order.deliveryPersonName ? (
                  <>
                    {order.deliveryPersonName}
                    {order.deliveryPersonPhone && order.deliveryPersonPhone !== '-' && (
                      <span className="block text-xs font-normal text-muted-foreground">{order.deliveryPersonPhone}</span>
                    )}
                    {showCustomer && order.deliveryAssignment === 'Pending' && (
                      <span className="block text-xs font-medium text-amber-600">En attente de réponse du livreur</span>
                    )}
                    {showCustomer && order.deliveryAssignment === 'Accepted' && (
                      <span className="block text-xs font-medium text-emerald-600">Livraison acceptée</span>
                    )}
                    {showCustomer && order.deliveryAssignment === 'Refused' && (
                      <span className="block text-xs font-medium text-destructive">
                        Refusée par le livreur : choisissez un autre livreur
                      </span>
                    )}
                  </>
                ) : (
                  <span className="font-normal text-muted-foreground">Pas encore affecté</span>
                )}
              </InfoRow>
              <InfoRow label="Adresse de livraison">{order.shippingAddress}</InfoRow>
              <InfoRow label="Date de commande">{formatDateTime(order.orderDate)}</InfoRow>
              <InfoRow label="Date d'expédition">
                {order.shippedDate ? formatDateTime(order.shippedDate) : '—'}
              </InfoRow>
              <InfoRow label="Date de livraison">
                {order.deliveredDate ? formatDateTime(order.deliveredDate) : '—'}
              </InfoRow>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <InfoRow label="Nombre d'articles">{itemCount}</InfoRow>
              <InfoRow label="Statut">{orderStatusLabel(order.status)}</InfoRow>
              <InfoRow label="Paiement">Espèces à la livraison</InfoRow>
              <InfoRow label="Sous-total">{formatPrice(subtotal)}</InfoRow>
              <InfoRow label="Frais de livraison">{formatPrice(deliveryFee)}</InfoRow>
              <div className="flex justify-between border-t pt-3 text-lg font-semibold">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Articles */}
      <Card>
        <CardHeader>
          <CardTitle>Articles ({order.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-3">
                <Link
                  to={`/product/${item.productId}`}
                  className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border bg-white"
                >
                  {item.productImageUrl ? (
                    <img src={item.productImageUrl} alt={item.productName} className="h-full w-full object-contain p-1" />
                  ) : (
                    <Package className="h-6 w-6 text-muted-foreground" />
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/product/${item.productId}`} className="font-medium hover:text-primary">
                    {item.productName}
                  </Link>
                  {item.size && (
                    <p className="mt-0.5 inline-block rounded bg-muted px-1.5 py-0.5 text-xs font-semibold">
                      {sizeNoun(item.size)} : {item.size}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(item.unitPrice)} × {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">{formatPrice(item.totalPrice)}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
