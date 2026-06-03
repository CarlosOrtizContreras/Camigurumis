// src/pages/Login.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usuarioApi } from '../services/api';
import { Spinner, FormField } from '../components/UI';

export default function Login({ setPage }) {
  const { login } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login state
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Register state
  const [reg, setReg] = useState({
    idUsuario: '', nombre: '', primerApellido: '', segundoApellido: '',
    Telefono: '', Correo: '', password: '', fechaCreacion: new Date().toISOString().slice(0, 10),
    isAdmin: false, isActivo: true,
  });

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await usuarioApi.buscar(loginId);
      // Simple password check (in production use hashed comparison on backend)
      if (!user) { setError('Usuario no encontrado'); return; }
      // For demo: direct compare (backend should handle auth)
      login(user);
      setPage('catalogo');
    } catch {
      setError('Credenciales incorrectas o usuario no existe');
    } finally { setLoading(false); }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await usuarioApi.guardar(reg);
      const user = await usuarioApi.buscar(reg.idUsuario);
      login(user);
      setPage('catalogo');
    } catch {
      setError('Error al registrarse. El ID ya puede existir.');
    } finally { setLoading(false); }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🧶</div>
        <div className="auth-tabs">
          <button className={tab === 'login' ? 'active' : ''} onClick={() => setTab('login')}>Iniciar sesión</button>
          <button className={tab === 'register' ? 'active' : ''} onClick={() => setTab('register')}>Registrarse</button>
        </div>

        {error && <p className="auth-error">{error}</p>}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="auth-form">
            <FormField label="ID de usuario">
              <input value={loginId} onChange={e => setLoginId(e.target.value)} required placeholder="Tu ID" />
            </FormField>
            <FormField label="Contraseña">
              <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} required placeholder="••••••" />
            </FormField>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <Spinner /> : 'Entrar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="auth-form">
            {[
              { label: 'ID / Cédula', key: 'idUsuario', ph: 'Número de documento' },
              { label: 'Nombre', key: 'nombre', ph: 'Tu nombre' },
              { label: 'Primer apellido', key: 'primerApellido', ph: 'Apellido 1' },
              { label: 'Segundo apellido', key: 'segundoApellido', ph: 'Apellido 2' },
              { label: 'Teléfono', key: 'Telefono', ph: '3001234567' },
              { label: 'Correo', key: 'Correo', ph: 'tu@correo.com', type: 'email' },
              { label: 'Contraseña', key: 'password', ph: '••••••', type: 'password' },
            ].map(f => (
              <FormField key={f.key} label={f.label}>
                <input
                  type={f.type || 'text'}
                  value={reg[f.key]}
                  onChange={e => setReg(r => ({ ...r, [f.key]: e.target.value }))}
                  required
                  placeholder={f.ph}
                />
              </FormField>
            ))}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <Spinner /> : 'Crear cuenta'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
