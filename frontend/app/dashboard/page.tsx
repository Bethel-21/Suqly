'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getUser, logout } from '../../lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState('');

  // business form
  const [bizForm, setBizForm] = useState({
    name: '', address: '', logo: '', motto: '', description: '', phone: '',
  });

  // category form
  const [catName, setCatName] = useState('');

  // product form
  const [prodForm, setProdForm] = useState({
    name: '', description: '', image: '', price: '', stock: '', categoryId: '',
  });

  useEffect(() => {
    const user = getUser();
    if (!user) { router.push('/'); return; }
    loadBusiness();
  }, []);

  async function loadBusiness() {
    try {
      const b = await api('/business/me');
      setBusiness(b);
      const cats = await api(`/categories?businessId=${b.id}`);
      setCategories(cats);
      const prods = await api('/products/mine');
      setProducts(prods);
      const ords = await api('/orders');
      setOrders(ords);
    } catch {
      setBusiness(null); // no business yet
    }
  }

  async function createBusiness(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const b = await api('/business', { method: 'POST', body: JSON.stringify(bizForm) });
      setBusiness(b);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api('/categories', { method: 'POST', body: JSON.stringify({ name: catName }) });
      setCatName('');
      const cats = await api(`/categories?businessId=${business.id}`);
      setCategories(cats);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function createProduct(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api('/products', {
        method: 'POST',
        body: JSON.stringify({
          ...prodForm,
          price: Number(prodForm.price),
          stock: Number(prodForm.stock),
          categoryId: Number(prodForm.categoryId),
        }),
      });
      setProdForm({ name: '', description: '', image: '', price: '', stock: '', categoryId: '' });
      const prods = await api('/products/mine');
      setProducts(prods);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function togglePublish(product: any) {
    setError('');
    try {
      const path = product.published ? `/products/${product.id}/unpublish` : `/products/${product.id}/publish`;
      await api(path, { method: 'PATCH' });
      const prods = await api('/products/mine');
      setProducts(prods);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function updateOrderStatus(orderId: number, status: string) {
    setError('');
    try {
      await api(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      const ords = await api('/orders');
      setOrders(ords);
    } catch (err: any) {
      setError(err.message);
    }
  }

  const NEXT_STATUS: Record<string, string[]> = {
    PENDING: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['READY', 'CANCELLED'],
    READY: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  };

  return (
    <main>
      <button onClick={() => { logout(); router.push('/'); }}>Logout</button>
      <h1>Owner Dashboard</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!business ? (
        <>
          <h2>Create your business</h2>
          <form onSubmit={createBusiness}>
            {['name', 'address', 'logo', 'motto', 'description', 'phone'].map((field) => (
              <div key={field}>
                <label>{field}</label>
                <br />
                <input
                  value={(bizForm as any)[field]}
                  onChange={(e) => setBizForm({ ...bizForm, [field]: e.target.value })}
                  required
                />
              </div>
            ))}
            <br />
            <button type="submit">Create Business</button>
          </form>
        </>
      ) : (
        <>
          <h2>{business.name}</h2>
          <p>{business.motto}</p>

          <h3>Categories</h3>
          <ul>
            {categories.map((c) => <li key={c.id}>{c.name}</li>)}
          </ul>
          <form onSubmit={createCategory}>
            <input
              placeholder="New category name"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              required
            />
            <button type="submit">Add Category</button>
          </form>

          <h3>Products</h3>
          <form onSubmit={createProduct}>
            <input placeholder="Name" value={prodForm.name}
              onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })} required /><br />
            <input placeholder="Description" value={prodForm.description}
              onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })} required /><br />
            <input placeholder="Image URL" value={prodForm.image}
              onChange={(e) => setProdForm({ ...prodForm, image: e.target.value })} required /><br />
            <input placeholder="Price" type="number" value={prodForm.price}
              onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })} required /><br />
            <input placeholder="Stock" type="number" value={prodForm.stock}
              onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })} required /><br />
            <select value={prodForm.categoryId}
              onChange={(e) => setProdForm({ ...prodForm, categoryId: e.target.value })} required>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select><br />
            <button type="submit">Add Product</button>
          </form>

          <ul>
            {products.map((p) => (
              <li key={p.id}>
                {p.name} — ${p.price} — stock: {p.stock} —{' '}
                {p.published ? 'Published' : 'Draft'}{' '}
                <button onClick={() => togglePublish(p)}>
                  {p.published ? 'Unpublish' : 'Publish'}
                </button>
              </li>
            ))}
          </ul>

          <h3>Orders</h3>
          <ul>
            {orders.map((o) => (
              <li key={o.id} style={{ marginBottom: 8 }}>
                Order #{o.id} — status: {o.status} — items: {o.items.length}
                {' '}
                {NEXT_STATUS[o.status]?.map((next) => (
                  <button key={next} onClick={() => updateOrderStatus(o.id, next)}>
                    Mark {next}
                  </button>
                ))}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
