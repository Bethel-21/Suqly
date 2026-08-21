'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getUser, logout } from '../../lib/api';

export default function StorePage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [carts, setCarts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = getUser();
    if (!user) { router.push('/'); return; }
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [prods, myCarts, myOrders] = await Promise.all([
        api('/products'),        // published only, across all businesses
        api('/carts'),
        api('/orders'),
      ]);
      setProducts(prods);
      setCarts(myCarts);
      setOrders(myOrders);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function addToCart(product: any) {
    setError('');
    try {
      await api(`/carts/${product.businessId}/items`, {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      const myCarts = await api('/carts');
      setCarts(myCarts);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function removeItem(itemId: number, businessId: number) {
    setError('');
    try {
      await api(`/carts/${businessId}/items/${itemId}`, { method: 'DELETE' });
      const myCarts = await api('/carts');
      setCarts(myCarts);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function placeOrder(businessId: number) {
    setError('');
    try {
      await api('/orders', { method: 'POST', body: JSON.stringify({ businessId }) });
      const [myCarts, myOrders] = await Promise.all([api('/carts'), api('/orders')]);
      setCarts(myCarts);
      setOrders(myOrders);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <main>
      <button onClick={() => { logout(); router.push('/'); }}>Logout</button>
      <h1>Suqly Store</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h2>Products</h2>
      <ul>
        {products.map((p) => (
          <li key={p.id} style={{ marginBottom: 8 }}>
            <strong>{p.name}</strong> — ${p.price} — stock: {p.stock}
            <br />
            {p.description}
            <br />
            <button onClick={() => addToCart(p)} disabled={p.stock < 1}>
              Add to Zembil
            </button>
          </li>
        ))}
        {products.length === 0 && <p>No published products yet.</p>}
      </ul>

      <h2>My Zembils (per business)</h2>
      {carts.map((cart) => (
        <div key={cart.id} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
          <strong>{cart.business?.name || `Business #${cart.businessId}`}</strong>
          <ul>
            {cart.items.map((item: any) => (
              <li key={item.id}>
                {item.product.name} x {item.quantity}{' '}
                <button onClick={() => removeItem(item.id, cart.businessId)}>Remove</button>
              </li>
            ))}
          </ul>
          {cart.items.length > 0 && (
            <button onClick={() => placeOrder(cart.businessId)}>Place Order</button>
          )}
        </div>
      ))}
      {carts.length === 0 && <p>Your Zembil is empty.</p>}

      <h2>My Orders</h2>
      <ul>
        {orders.map((o) => (
          <li key={o.id}>
            Order #{o.id} — status: {o.status} — items: {o.items.length}
          </li>
        ))}
      </ul>
    </main>
  );
}
