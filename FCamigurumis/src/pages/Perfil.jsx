// src/pages/Perfil.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usuarioApi } from '../services/api';
import { FormField, Spinner } from '../components/UI';

export default function Perfil() {
  const { user, login } = useAuth();
  const [tab, setTab] = useState('datos');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const [datos, setDatos] = useState({
    ...user,
    password: '',
  });
  const [newPass, setNewPass] = useState('');

  async function handleSaveDatos(e) {
    e.preventDefault();
    setLoading(true); setMsg(''); setError('');
    try {
      await usuarioApi.actualizarDatos({ ...datos, password: '' });
      const updated = await usuarioApi.buscar(user.idUsuario);
      login(updated);
      setMsg('Datos actualizados correctamente');
    } catch {
      setError('Error al actualizar datos');
    } finally { setLoading(false); }
  }

  async function handleSavePass(e) {
    e.preventDefault();
    setLoading(true); setMsg(''); setError('');
    try {
      await usuarioApi.actualizarPassword(user.idUsuario, newPass);
      setMsg('Contraseña actualizada');
      setNewPass('');
    } catch {
      setError('Error al cambiar contraseña');
    } finally { setLoading(false); }
  }

  return (
    <main className="perfil-page">
      <h2>Mi perfil</h2>

      <div className="auth-tabs" style={{ marginBottom: '1.5rem' }}>
        <button className={tab === 'datos' ? 'active' : ''} onClick={() => setTab('datos')}>Mis datos</button>
        <button className={tab === 'pass' ? 'active' : ''} onClick={() => setTab('pass')}>Contraseña</button>
      </div>

      {msg && <p className="success-msg">{msg}</p>}
      {error && <p className="auth-error">{error}</p>}

      {tab === 'datos' && (
        <form onSubmit={handleSaveDatos} className="perfil-form">
          {[
            { label: 'Nombre', key: 'nombre' },
            { label: 'Primer apellido', key: 'primerApellido' },
            { label: 'Segundo apellido', key: 'segundoApellido' },
            { label: 'Teléfono', key: 'Telefono' },
            { label: 'Correo', key: 'Correo', type: 'email' },
          ].map(f => (
            <FormField key={f.key} label={f.label}>
              <input
                type={f.type || 'text'}
                value={datos[f.key] || ''}
                onChange={e => setDatos(d => ({ ...d, [f.key]: e.target.value }))}
              />
            </FormField>
          ))}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Spinner /> : 'Guardar cambios'}
          </button>
        </form>
      )}

      {tab === 'pass' && (
        <form onSubmit={handleSavePass} className="perfil-form">
          <FormField label="Nueva contraseña">
            <input
              type="password"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              required
              placeholder="••••••"
            />
          </FormField>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Spinner /> : 'Cambiar contraseña'}
          </button>
        </form>
      )}
    </main>
  );
}
