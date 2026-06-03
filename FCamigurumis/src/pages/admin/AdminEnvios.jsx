// src/pages/admin/AdminEnvios.jsx
import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { envioApi, estadoEnvioApi } from '../../services/api';
import { Spinner, ErrorMsg, EmptyState, ActionBar, Modal, FormField } from '../../components/UI';

export default function AdminEnvios() {
  const { data, loading, error, reload } = useFetch(envioApi.listar);
  const { data: estadosCat } = useFetch(estadoEnvioApi.listar);
  const [selected, setSelected] = useState(null);
  const [newEstado, setNewEstado] = useState({ idEstadoEnvio: '', novedad: '' });
  const [saving, setSaving] = useState(false);

  async function handleAgregarEstado(e) {
    e.preventDefault(); setSaving(true);
    try {
      await envioApi.agregarEstado(selected.idEnvio, newEstado.idEstadoEnvio, newEstado.novedad);
      const updated = await envioApi.buscar(selected.idEnvio);
      setSelected(updated);
      setNewEstado({ idEstadoEnvio: '', novedad: '' });
      reload();
    } finally { setSaving(false); }
  }

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;

  return (
    <section>
      <ActionBar><h3>Envíos</h3></ActionBar>
      {!data?.length ? <EmptyState icon="🚚" msg="No hay envíos" /> : (
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Dirección</th><th>Costo</th><th>Estados</th><th>Acciones</th></tr></thead>
          <tbody>
            {data.map(e => (
              <tr key={e.idEnvio}>
                <td><code>{e.idEnvio.slice(0, 8)}</code></td>
                <td>{e.direccion || '—'}</td>
                <td>${e.costoEnvio?.toLocaleString()}</td>
                <td>{e.estadoEnvio?.length || 0} estados</td>
                <td>
                  <button className="btn-sm btn-outline" onClick={() => setSelected(e)}>Gestionar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {selected && (
        <Modal title={`Envío #${selected.idEnvio.slice(0, 8)}`} onClose={() => setSelected(null)}>
          <p><strong>Dirección:</strong> {selected.direccion || 'Sin definir'}</p>
          <h4>Historial</h4>
          {!selected.estadoEnvio?.length
            ? <p className="muted">Sin estados aún</p>
            : (
              <ul className="timeline">
                {selected.estadoEnvio.map((st, i) => (
                  <li key={i} className="timeline-item">
                    <span className="timeline-dot" />
                    <div>
                      <strong>{st.idEstadoEnvio}</strong>
                      <span className="muted"> · {st.fecha}</span>
                      {st.novedad && <p>{st.novedad}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          <h4 style={{ marginTop: '1rem' }}>Agregar estado</h4>
          <form onSubmit={handleAgregarEstado}>
            <FormField label="Estado">
              <select required value={newEstado.idEstadoEnvio} onChange={e => setNewEstado(s => ({ ...s, idEstadoEnvio: e.target.value }))}>
                <option value="">Seleccionar…</option>
                {(estadosCat || []).map(st => (
                  <option key={st.idEstadoEnvio} value={st.idEstadoEnvio}>{st.nombre}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Novedad">
              <input value={newEstado.novedad} onChange={e => setNewEstado(s => ({ ...s, novedad: e.target.value }))} placeholder="Descripción del estado…" />
            </FormField>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? <Spinner /> : 'Agregar'}</button>
          </form>
        </Modal>
      )}
    </section>
  );
}
