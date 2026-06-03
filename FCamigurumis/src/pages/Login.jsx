// src/pages/Login.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usuarioApi } from '../services/api';
import { Spinner, FormField } from '../components/UI';

// ── Validation helpers ─────────────────────────────────────────────────────
function validateLoginForm({ loginId, loginPass }) {
  const errors = {};
  if (!loginId.trim()) errors.loginId = 'El ID de usuario es obligatorio';
  else if (!/^\d+$/.test(loginId.trim())) errors.loginId = 'El ID debe ser numérico';
  if (!loginPass) errors.loginPass = 'La contraseña es obligatoria';
  else if (loginPass.length < 6) errors.loginPass = 'Mínimo 6 caracteres';
  return errors;
}

function validateRegisterForm(reg) {
  const errors = {};
  if (!reg.idUsuario.trim()) errors.idUsuario = 'El ID es obligatorio';
  else if (!/^\d+$/.test(reg.idUsuario.trim())) errors.idUsuario = 'El ID debe ser numérico (ej: cédula)';
  if (!reg.nombre.trim()) errors.nombre = 'El nombre es obligatorio';
  else if (reg.nombre.trim().length < 2) errors.nombre = 'Mínimo 2 caracteres';
  if (!reg.primerApellido.trim()) errors.primerApellido = 'El primer apellido es obligatorio';
  if (!reg.Telefono.trim()) errors.Telefono = 'El teléfono es obligatorio';
  else if (!/^\d{7,15}$/.test(reg.Telefono.trim())) errors.Telefono = 'Teléfono inválido (solo números, 7-15 dígitos)';
  if (!reg.Correo.trim()) errors.Correo = 'El correo es obligatorio';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reg.Correo.trim())) errors.Correo = 'Correo electrónico inválido';
  if (!reg.password) errors.password = 'La contraseña es obligatoria';
  else if (reg.password.length < 6) errors.password = 'Mínimo 6 caracteres';
  return errors;
}

export default function Login({ setPage }) {
  const { login } = useAuth();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Login state
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Register state
  const [reg, setReg] = useState({
    idUsuario: '', nombre: '', primerApellido: '', segundoApellido: '',
    Telefono: '', Correo: '', password: '',
    fechaCreacion: new Date().toISOString().slice(0, 10),
    isAdmin: false, isActivo: true,
  });

  function clearErrors() { setError(''); setFieldErrors({}); }

  async function handleLogin(e) {
    e.preventDefault();
    clearErrors();

    const errors = validateLoginForm({ loginId, loginPass });
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    setLoading(true);
    try {
      const user = await usuarioApi.buscar(loginId.trim());
      if (!user) { setError('Usuario no encontrado'); return; }
      if (!user.isActivo) { setError('Este usuario está desactivado. Contacta al administrador.'); return; }
      // Password check (plain comparison — backend should hash in production)
      if (user.password && user.password !== loginPass) {
        setError('Contraseña incorrecta');
        return;
      }
      login(user);
      setPage('catalogo');
    } catch {
      setError('Usuario no encontrado o error de conexión');
    } finally { setLoading(false); }
  }

  async function handleRegister(e) {
    e.preventDefault();
    clearErrors();

    const errors = validateRegisterForm(reg);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    setLoading(true);
    try {
      await usuarioApi.guardar({
        ...reg,
        idUsuario: reg.idUsuario.trim(),
        nombre: reg.nombre.trim(),
        primerApellido: reg.primerApellido.trim(),
        segundoApellido: reg.segundoApellido.trim(),
        Telefono: reg.Telefono.trim(),
        Correo: reg.Correo.trim(),
      });
      const user = await usuarioApi.buscar(reg.idUsuario.trim());
      login(user);
      setPage('catalogo');
    } catch {
      setError('Error al registrarse. Es posible que el ID ya exista.');
    } finally { setLoading(false); }
  }

  const fields = [
    { label: 'ID / Cédula', key: 'idUsuario', ph: 'Número de documento', inputMode: 'numeric' },
    { label: 'Nombre', key: 'nombre', ph: 'Tu nombre' },
    { label: 'Primer apellido', key: 'primerApellido', ph: 'Apellido 1' },
    { label: 'Segundo apellido', key: 'segundoApellido', ph: 'Apellido 2 (opcional)', required: false },
    { label: 'Teléfono', key: 'Telefono', ph: '3001234567', inputMode: 'numeric' },
    { label: 'Correo', key: 'Correo', ph: 'tu@correo.com', type: 'email' },
    { label: 'Contraseña', key: 'password', ph: '••••••', type: 'password' },
  ];

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🧶</div>
        <div className="auth-tabs">
          <button className={tab === 'login' ? 'active' : ''} onClick={() => { setTab('login'); clearErrors(); }}>
            Iniciar sesión
          </button>
          <button className={tab === 'register' ? 'active' : ''} onClick={() => { setTab('register'); clearErrors(); }}>
            Registrarse
          </button>
        </div>

        {error && <p className="auth-error">{error}</p>}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="auth-form" noValidate>
            <FormField label="ID de usuario">
              <input
                value={loginId}
                onChange={e => { setLoginId(e.target.value); setFieldErrors(p => ({ ...p, loginId: '' })); }}
                required
                placeholder="Tu cédula / ID"
                inputMode="numeric"
                autoComplete="username"
              />
              {fieldErrors.loginId && <span style={{ color: '#c0364f', fontSize: '0.82rem' }}>{fieldErrors.loginId}</span>}
            </FormField>
            <FormField label="Contraseña">
              <input
                type="password"
                value={loginPass}
                onChange={e => { setLoginPass(e.target.value); setFieldErrors(p => ({ ...p, loginPass: '' })); }}
                required
                placeholder="••••••"
                autoComplete="current-password"
              />
              {fieldErrors.loginPass && <span style={{ color: '#c0364f', fontSize: '0.82rem' }}>{fieldErrors.loginPass}</span>}
            </FormField>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <Spinner /> : 'Entrar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="auth-form" noValidate>
            {fields.map(f => (
              <FormField key={f.key} label={f.label}>
                <input
                  type={f.type || 'text'}
                  value={reg[f.key]}
                  onChange={e => {
                    setReg(r => ({ ...r, [f.key]: e.target.value }));
                    setFieldErrors(p => ({ ...p, [f.key]: '' }));
                  }}
                  required={f.required !== false}
                  placeholder={f.ph}
                  inputMode={f.inputMode}
                  autoComplete={f.type === 'password' ? 'new-password' : undefined}
                />
                {fieldErrors[f.key] && (
                  <span style={{ color: '#c0364f', fontSize: '0.82rem' }}>{fieldErrors[f.key]}</span>
                )}
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
