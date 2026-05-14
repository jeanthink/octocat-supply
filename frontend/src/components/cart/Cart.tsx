import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

export default function Cart() {
  const { items, itemCount, total, updateQuantity, removeItem, clear } = useCart();
  const { darkMode } = useTheme();

  const containerBg = darkMode ? 'bg-dark' : 'bg-gray-100';
  const cardBg = darkMode ? 'bg-gray-800 text-light' : 'bg-white text-gray-800';
  const muted = darkMode ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className={`min-h-screen ${containerBg} pt-20 pb-16 px-4 transition-colors duration-300`}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-900'}`}>
            Your Cart
          </h1>
          <span
            id="cart-item-count"
            data-testid="cart-item-count"
            className={`text-sm font-medium ${muted}`}
          >
            {itemCount} item{itemCount === 1 ? '' : 's'}
          </span>
        </div>

        {items.length === 0 ? (
          <div className={`${cardBg} rounded-lg shadow p-8 text-center`}>
            <p className={muted}>Your cart is empty.</p>
            <Link
              to="/products"
              className="inline-block mt-4 bg-primary hover:bg-accent text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <div
                key={item.productId}
                data-testid={`cart-row-${item.productId}`}
                className={`${cardBg} rounded-lg shadow p-4 flex items-center justify-between`}
              >
                <div className="flex-1">
                  <div className="font-semibold">{item.name}</div>
                  <div className={`text-sm ${muted}`}>${item.price.toFixed(2)} each</div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    aria-label={`Decrease ${item.name}`}
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-8 h-8 rounded-full border border-gray-400 hover:bg-primary hover:text-white transition-colors"
                  >
                    −
                  </button>
                  <span data-testid={`cart-qty-${item.productId}`} className="w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    aria-label={`Increase ${item.name}`}
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-8 h-8 rounded-full border border-gray-400 hover:bg-primary hover:text-white transition-colors"
                  >
                    +
                  </button>
                  <div className="w-20 text-right font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button
                    aria-label={`Remove ${item.name}`}
                    onClick={() => removeItem(item.productId)}
                    className="text-red-500 hover:text-red-700 text-sm ml-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div
              className={`${cardBg} rounded-lg shadow p-4 flex items-center justify-between mt-2`}
            >
              <button
                onClick={clear}
                className={`${muted} hover:text-red-500 text-sm transition-colors`}
              >
                Clear cart
              </button>
              <div className="text-right">
                <div className={`text-sm ${muted}`}>Total</div>
                <div
                  data-testid="cart-total"
                  className="text-2xl font-bold"
                >
                  ${total.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                to="/checkout"
                id="checkout-button"
                data-testid="checkout-button"
                className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-md text-base font-semibold transition-colors"
              >
                Proceed to Checkout →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
