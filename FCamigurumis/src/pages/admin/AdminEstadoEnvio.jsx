// src/pages/admin/AdminEstadoEnvio.jsx
import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { estadoEnvioApi } from '../../services/api';
import { Spinner, ErrorMsg, EmptyState, Modal, FormField, ActionBar } from '../../components/UI';

const EMPTY = { idEstadoEnvio: '', nombre: '', descripcion: '' };

export default function AdminEstadoEnvio() {
  const { data, loading, error, reload } = useFetch(estadoEnvioApi.listar);
  const [form, setForm] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  function openNew() { setForm({ ...EMPTY }); setIsNew(true); }
  function openEdit(e) { setForm({ ...e }); setIsNew(false); }
  function setField(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSave(e) {
    e.preventDefault(); setSaving(true);
    try {
      if (isNew) await estadoEnvioApi.guardar(form); else await estadoEnvioApi.actualizar(form);
      reload(); setForm(null);
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar?')) return;
    await estadoEnvioApi.eliminar(id); reload();
  }

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;

  return (
    <section>
      <ActionBar>
        <h3>Estados de Envío</h3>
        <button className="btn-primary" onClick={openNew}>+ Nuevo</button>
      </ActionBar>
      {!data?.length ? <EmptyState /> : (
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Nombre</th><th>Descripción</th><th>Acciones</th></tr></thead>
          <tbody>
            {data.map(e => (
              <tr key={e.idEstadoEnvio}>
                <td><code>{e.idEstadoEnvio}</code></td>
                <td>{e.nombre}</td>
                <td>{e.descripcion}</td>
                <td>
                  <button className="btn-sm btn-outline" onClick={() => openEdit(e)}>Editar</button>
                  <button className="btn-sm btn-danger" onClick={() => handleDelete(e.idEstadoEnvio)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {form && (
        <Modal title={isNew ? 'Nuevo estado' : 'Editar estado'} onClose={() => setForm(null)}>
          <form onSubmit={handleSave} className="admin-form">
            <FormField label="ID"><input required value={form.idEstadoEnvio} onChange={e => setField('idEstadoEnvio', e.target.value)} disabled={!isNew} /></FormField>
            <FormField label="Nombre"><input required value={form.nombre} onChange={e => setField('nombre', e.target.value)} /></FormField>
            <FormField label="Descripción"><textarea value={form.descripcion} onChange={e => setField('descripcion', e.target.value)} rows={2} /></FormField>
            <div className="modal-actions">
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? <Spinner /> : 'Guardar'}</button>
              <button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancelar</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
