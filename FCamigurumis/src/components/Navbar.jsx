// src/components/Navbar.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ page, setPage }) {
  const { user, logout, isAdmin } = useAuth();
  const { items } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const count = items.reduce((s, i) => s + i.cantidad, 0);

  const nav = (p) => { setPage(p); setMenuOpen(false); };

  return (
    <header className="navbar">
      <button className="brand" onClick={() => nav('home')}>
        <span className="brand-icon">🧶</span>
        <span className="brand-name">Camigurumis</span>
      </button>

      <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <button onClick={() => nav('catalogo')} className={page === 'catalogo' ? 'active' : ''}>Catálogo</button>
        {user && <button onClick={() => nav('perfil')} className={page === 'perfil' ? 'active' : ''}>Mi perfil</button>}
        {user && <button onClick={() => nav('misPedidos')} className={page === 'misPedidos' ? 'active' : ''}>Mis pedidos</button>}
        {isAdmin && <button onClick={() => nav('admin')} className={page === 'admin' ? 'active' : ''}>Admin</button>}
        {!user && <button onClick={() => nav('login')} className="btn-accent">Iniciar sesión</button>}
        {user && <button onClick={logout} className="btn-ghost">Salir</button>}
      </nav>

      <button className="cart-btn" onClick={() => nav('carrito')}>
        🛒 {count > 0 && <span className="cart-badge">{count}</span>}
      </button>

      <button className="hamburger" onClick={() => setMenuOpen(o => !o)}>
        {menuOpen ? '✕' : '☰'}
      </button>
    </header>
  );
}
