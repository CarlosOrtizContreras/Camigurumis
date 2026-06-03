// src/pages/admin/AdminUsuarios.jsx
import { useFetch } from '../../hooks/useFetch';
import { usuarioApi } from '../../services/api';
import { Spinner, ErrorMsg, EmptyState, ActionBar } from '../../components/UI';

export default function AdminUsuarios() {
  const { data, loading, error, reload } = useFetch(usuarioApi.listar);

  async function handleDeactivate(id) {
    if (!confirm('¿Desactivar este usuario?')) return;
    try {
      await usuarioApi.eliminar(id);
      reload();
    } catch {
      alert('Error al desactivar el usuario.');
    }
  }

  async function handleReactivate(usuario) {
    if (!confirm(`¿Reactivar al usuario ${usuario.nombre}?`)) return;
    try {
      // Send full user data with isActivo = true, password empty (backend preserves it)
      await usuarioApi.actualizarDatos({ ...usuario, isActivo: true, password: '' });
      reload();
    } catch {
      alert('Error al reactivar el usuario.');
    }
  }

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;

  const activos = (data || []).filter(u => u.isActivo);
  const inactivos = (data || []).filter(u => !u.isActivo);

  return (
    <section>
      <ActionBar>
        <h3>Usuarios</h3>
        <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
          {activos.length} activos · {inactivos.length} inactivos
        </span>
      </ActionBar>

      {!data?.length ? (
        <EmptyState icon="👥" msg="No hay usuarios" />
      ) : (
        <>
          {/* Active users */}
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Admin</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(data || []).map(u => (
                <tr key={u.idUsuario} style={!u.isActivo ? { opacity: 0.6 } : {}}>
                  <td><code>{u.idUsuario}</code></td>
                  <td>{u.nombre} {u.primerApellido}</td>
                  <td>{u.Correo}</td>
                  <td>{u.Telefono}</td>
                  <td>{u.isAdmin ? '⭐' : '—'}</td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: 99,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      background: u.isActivo ? '#d4edda' : '#fde0e5',
                      color: u.isActivo ? '#2e7d32' : '#c0364f',
                    }}>
                      {u.isActivo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    {u.isActivo ? (
                      <button
                        className="btn-sm btn-danger"
                        onClick={() => handleDeactivate(u.idUsuario)}
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        className="btn-sm btn-outline"
                        style={{ borderColor: 'var(--sage)', color: 'var(--sage)' }}
                        onClick={() => handleReactivate(u)}
                      >
                        ✓ Reactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}
