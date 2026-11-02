import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OrderDetailView } from './OrderDetailView';
import type { Order } from '@/models/order';

const baseOrder: Order = {
  id: 3,
  userId: 7,
  orderNumber: '#1025',
  customerName: 'Karim Ben',
  customerEmail: 'karim@exemple.com',
  status: 'Shipped',
  shippingAddress: '12 rue de Tunis, 1000 Tunis',
  paymentMethod: 'CashOnDelivery',
  currency: 'TND',
  subtotal: 52,
  deliveryFee: 10,
  discountAmount: 0,
  total: 62,
  orderDate: '2026-10-21T10:00:00Z',
  shippedDate: '2026-10-22T09:00:00Z',
  deliveredDate: null,
  items: [
    { id: 1, productId: 9, productName: 'Casque audio', productImageUrl: '', quantity: 2, unitPrice: 11, totalPrice: 22 },
    { id: 2, productId: 4, productName: 'Clavier', productImageUrl: '', quantity: 1, unitPrice: 30, totalPrice: 30 },
  ],
};

const renderView = (props: Partial<React.ComponentProps<typeof OrderDetailView>> = {}) =>
  render(
    <MemoryRouter>
      <OrderDetailView order={baseOrder} {...props} />
    </MemoryRouter>
  );

describe('OrderDetailView', () => {
  it('shows the order number, the products by name, the delivery fee and the total', () => {
    renderView();
    expect(screen.getByText('Commande #1025')).toBeInTheDocument();
    expect(screen.getByText('Casque audio')).toBeInTheDocument();
    expect(screen.getByText('Clavier')).toBeInTheDocument();
    // 22 + 30 = 52, + 10 TND de livraison = 62 (nombre d'articles : 3)
    expect(screen.getByText(/52,000/)).toBeInTheDocument();
    expect(screen.getByText(/10,000/)).toBeInTheDocument();
    expect(screen.getByText(/62,000/)).toBeInTheDocument();
    expect(screen.getByText('Espèces à la livraison')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('hides the customer for a client but shows the name and e-mail for the admin', () => {
    const { unmount } = renderView();
    expect(screen.queryByText('Karim Ben')).not.toBeInTheDocument();
    unmount();

    renderView({ showCustomer: true });
    expect(screen.getByText('Karim Ben')).toBeInTheDocument();
    expect(screen.getByText('karim@exemple.com')).toBeInTheDocument();
  });

  it('shows a cancelled notice instead of the progress steps', () => {
    renderView({ order: { ...baseOrder, status: 'Cancelled' } });
    expect(screen.getByText('Cette commande a été annulée.')).toBeInTheDocument();
    expect(screen.queryByText('En préparation')).not.toBeInTheDocument();
  });
});
