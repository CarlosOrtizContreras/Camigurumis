// src/pages/admin/AdminUsuarios.jsx
import { useFetch } from '../../hooks/useFetch';
import { usuarioApi } from '../../services/api';
import { Spinner, ErrorMsg, EmptyState, ActionBar } from '../../components/UI';

export default function AdminUsuarios() {
  const { data, loading, error, reload } = useFetch(usuarioApi.listar);

  async function handleDelete(id) {
    if (!confirm('¿Desactivar usuario?')) return;
    await usuarioApi.eliminar(id);
    reload();
  }

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;

  return (
    <section>
      <ActionBar><h3>Usuarios</h3></ActionBar>
      {!data?.length ? <EmptyState icon="👥" msg="No hay usuarios" /> : (
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Admin</th><th>Activo</th><th>Acciones</th></tr></thead>
          <tbody>
            {data.map(u => (
              <tr key={u.idUsuario}>
                <td><code>{u.idUsuario}</code></td>
                <td>{u.nombre} {u.primerApellido}</td>
                <td>{u.Correo}</td>
                <td>{u.Telefono}</td>
                <td>{u.isAdmin ? '⭐' : '—'}</td>
                <td>{u.isActivo ? '✅' : '❌'}</td>
                <td>
                  {u.isActivo && (
                    <button className="btn-sm btn-danger" onClick={() => handleDelete(u.idUsuario)}>Desactivar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
