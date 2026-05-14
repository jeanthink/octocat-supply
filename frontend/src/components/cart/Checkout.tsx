import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/config';

export default function Checkout() {
  const { items, itemCount, total, clear } = useCart();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);

  const containerBg = darkMode ? 'bg-dark' : 'bg-gray-100';
  const cardBg = darkMode ? 'bg-gray-800 text-light' : 'bg-white text-gray-800';
  const muted = darkMode ? 'text-gray-300' : 'text-gray-600';
  const inputCls = `w-full px-3 py-2 rounded-md border ${darkMode ? 'bg-gray-700 text-light border-gray-600' : 'bg-white text-gray-800 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary`;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError('Please enter your name.');
    if (!email.trim()) return setError('Please enter your email.');
    if (!acceptTerms) return setError('You must accept the Terms & Conditions to checkout.');
    if (items.length === 0) return setError('Your cart is empty.');

    setSubmitting(true);
    try {
      const summary = items
        .map((i) => `${i.quantity} × ${i.name} ($${(i.price * i.quantity).toFixed(2)})`)
        .join('; ');
      const payload = {
        branchId: 1,
        orderDate: new Date().toISOString(),
        name: `Order for ${name.trim()}`,
        description: `Email: ${email.trim()} | Items: ${summary} | Total: $${total.toFixed(2)}`,
        status: 'pending',
      };
      const { data } = await axios.post(`${api.baseURL}${api.endpoints.orders}`, payload, {
        timeout: 15000,
      });
      setOrderId(data?.orderId ?? null);
      clear();
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : 'Unknown error';
      setError(`Checkout failed: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (orderId !== null) {
    return (
      <div className={`min-h-screen ${containerBg} pt-20 pb-16 px-4 transition-colors duration-300`}>
        <div className="max-w-2xl mx-auto">
          <div className={`${cardBg} rounded-lg shadow p-8 text-center`} data-testid="order-confirmation">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold mb-2">Order placed!</h1>
            <p className={muted}>
              Thank you{name ? `, ${name}` : ''}. Your order{' '}
              <span data-testid="order-id" className="font-mono font-semibold">
                #{orderId}
              </span>{' '}
              has been created.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="mt-6 bg-primary hover:bg-accent text-white px-6 py-2 rounded-md text-sm font-semibold transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${containerBg} pt-20 pb-16 px-4 transition-colors duration-300`}>
      <div className="max-w-3xl mx-auto">
        <h1 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-light' : 'text-gray-900'}`}>
          Checkout
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          <form
            onSubmit={submit}
            className={`${cardBg} rounded-lg shadow p-6 md:col-span-2 space-y-4`}
          >
            <div>
              <label htmlFor="checkout-name" className="block text-sm font-medium mb-1">
                Name
              </label>
              <input
                id="checkout-name"
                data-testid="checkout-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label htmlFor="checkout-email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="checkout-email"
                data-testid="checkout-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                placeholder="jane@example.com"
              />
            </div>
            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                id="accept-terms"
                data-testid="accept-terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-primary focus:ring-primary rounded"
              />
              <span className={`text-sm ${muted}`}>
                I have read and accept the Terms &amp; Conditions
              </span>
            </label>

            {error && (
              <div
                role="alert"
                data-testid="checkout-error"
                className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              data-testid="place-order"
              disabled={submitting || items.length === 0}
              className="w-full bg-primary hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-md text-base font-semibold transition-colors"
            >
              {submitting ? 'Placing order…' : `Place order — $${total.toFixed(2)}`}
            </button>
          </form>

          <aside className={`${cardBg} rounded-lg shadow p-6 h-fit`}>
            <h2 className="font-semibold mb-3">Order summary</h2>
            <div className="space-y-2 text-sm">
              {items.length === 0 ? (
                <p className={muted}>Cart is empty.</p>
              ) : (
                items.map((i) => (
                  <div key={i.productId} className="flex justify-between">
                    <span>
                      {i.quantity} × {i.name}
                    </span>
                    <span>${(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-400/30 flex justify-between font-semibold">
              <span>Total ({itemCount} items)</span>
              <span data-testid="checkout-total">${total.toFixed(2)}</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
