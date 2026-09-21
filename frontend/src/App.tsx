import { useProducts } from './hooks/useProducts'
import CartItem from './components/cart/CartItem'
import CartSummary from './components/cart/CartSummary'
import CartEmpty from './components/cart/CartEmpty'
import ProductList from './components/products/ProductList'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { useCart } from './context/useCart'
import './App.css'

function HomePage() {
  const { itemCount } = useCart()

  return (
    <main>
      <section className="hero-section">
        <div>
          <p className="eyebrow">NEXUS STORE</p>
          <h1>Everything you need, in one place.</h1>
          <p className="hero-text">
            Browse quality products, add them to your cart, and checkout with
            Mobile Money or Card.
          </p>

          <Link to="/products" className="primary-button">
            Shop Now
          </Link>
        </div>

        <div className="hero-card">
          <span>🛒</span>
          <strong>{itemCount}</strong>
          <p>items in your cart</p>
        </div>
      </section>
    </main>
  )
}

function ProductsPage() {
  const { products, loading, error } = useProducts()

  return (
    <main className="page-container">
      <div className="products-header">
        <div>
          <p className="eyebrow">OUR COLLECTION</p>
          <h1>Products</h1>
          <p>Find something you'll love.</p>
        </div>
      </div>

      {loading && (
        <div className="products-message">
          <p>Loading products...</p>
        </div>
      )}

      {error && (
        <div className="products-message error-message">
          <p>{error}</p>
          <small>
            The backend may not be running yet. We'll add development data
            shortly.
          </small>
        </div>
      )}

      {!loading && !error && <ProductList products={products} />}
    </main>
  )
}

function CartPage() {
  const { items } = useCart()

  if (items.length === 0) {
    return (
      <main className="page-container">
        <CartEmpty />
      </main>
    )
  }

  return (
    <main className="page-container">
      <div className="cart-header">
        <div>
          <p className="eyebrow">YOUR SHOPPING CART</p>
          <h1>Your Cart</h1>
        </div>
      </div>

      <div className="cart-layout">
        <section className="cart-items">
          {items.map((item) => (
            <CartItem key={item.productId} item={item} />
          ))}
        </section>

        <CartSummary />
      </div>
    </main>
  )
}

function CheckoutPage() {
  return (
    <main className="page-container">
      <h1>Checkout</h1>
      <p>Checkout form coming next.</p>
    </main>
  )
}

function App() {
  const { itemCount } = useCart()

  return (
    <BrowserRouter>
      <header className="navbar">
        <Link to="/" className="logo">
          Nexus Store
        </Link>

        <nav>
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/cart" className="cart-link">
  🛒
  <span>Cart</span>

  {itemCount > 0 && (
    <span className="cart-count">{itemCount}</span>
  )}
</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App