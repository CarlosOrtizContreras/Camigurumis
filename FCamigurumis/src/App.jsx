// src/App.jsx
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import Login from './pages/Login';
import Carrito from './pages/Carrito';
import Perfil from './pages/Perfil';
import MisPedidos from './pages/MisPedidos';
import Admin from './pages/Admin';

function AppContent() {
  const [page, setPage] = useState('home');
  const { user, isAdmin } = useAuth();

  // Guard: redirect to login for protected routes
  const protectedPage = (requiredAdmin, Component) => {
    if (!user) return <Login setPage={setPage} />;
    if (requiredAdmin && !isAdmin) return <Home setPage={setPage} />;
    return <Component setPage={setPage} />;
  };

  const renderPage = () => {
    switch (page) {
      case 'home':       return <Home setPage={setPage} />;
      case 'catalogo':   return <Catalogo setPage={setPage} />;
      case 'login':      return <Login setPage={setPage} />;
      case 'carrito':    return <Carrito setPage={setPage} />;
      case 'perfil':     return protectedPage(false, Perfil);
      case 'misPedidos': return protectedPage(false, MisPedidos);
      case 'admin':      return protectedPage(true, Admin);
      default:           return <Home setPage={setPage} />;
    }
  };

  return (
    <div className="app">
      <Navbar page={page} setPage={setPage} />
      {renderPage()}
      <footer className="footer">
        <p>🧶 Camigurumis · Hecho con amor · {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
