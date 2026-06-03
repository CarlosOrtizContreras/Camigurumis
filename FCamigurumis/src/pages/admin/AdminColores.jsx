// src/pages/admin/AdminColores.jsx
import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { colorApi } from '../../services/api';
import { Spinner, ErrorMsg, EmptyState, Modal, FormField, ActionBar } from '../../components/UI';

const EMPTY_COLOR = { idColor: '', nombre: '', codigoColor: '#ff0000', descripcion: '', isActivo: true };

export default function AdminColores() {
  const { data, loading, error, reload } = useFetch(colorApi.listar);
  const [form, setForm] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  function openNew() { setForm({ ...EMPTY_COLOR }); setIsNew(true); }
  function openEdit(c) { setForm({ ...c }); setIsNew(false); }
  function setField(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSave(e) {
    e.preventDefault(); setSaving(true);
    try {
      if (isNew) await colorApi.guardar(form); else await colorApi.actualizar(form);
      reload(); setForm(null);
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar?')) return;
    await colorApi.eliminar(id); reload();
  }

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;

  return (
    <section>
      <ActionBar>
        <h3>Colores</h3>
        <button className="btn-primary" onClick={openNew}>+ Nuevo</button>
      </ActionBar>
      {!data?.length ? <EmptyState /> : (
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Nombre</th><th>Código</th><th>Activo</th><th>Acciones</th></tr></thead>
          <tbody>
            {data.map(c => (
              <tr key={c.idColor}>
                <td><code>{c.idColor}</code></td>
                <td>{c.nombre}</td>
                <td><span style={{ background: c.codigoColor, padding: '2px 10px', borderRadius: 4, color: '#fff', fontSize: 12 }}>{c.codigoColor}</span></td>
                <td>{c.isActivo ? '✅' : '❌'}</td>
                <td>
                  <button className="btn-sm btn-outline" onClick={() => openEdit(c)}>Editar</button>
                  <button className="btn-sm btn-danger" onClick={() => handleDelete(c.idColor)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {form && (
        <Modal title={isNew ? 'Nuevo color' : 'Editar color'} onClose={() => setForm(null)}>
          <form onSubmit={handleSave} className="admin-form">
            <FormField label="ID"><input required value={form.idColor} onChange={e => setField('idColor', e.target.value)} disabled={!isNew} /></FormField>
            <FormField label="Nombre"><input required value={form.nombre} onChange={e => setField('nombre', e.target.value)} /></FormField>
            <FormField label="Código de color"><input type="color" value={form.codigoColor} onChange={e => setField('codigoColor', e.target.value)} /></FormField>
            <FormField label="Descripción"><input value={form.descripcion} onChange={e => setField('descripcion', e.target.value)} /></FormField>
            <FormField label="Activo">
              <select value={form.isActivo ? 'true' : 'false'} onChange={e => setField('isActivo', e.target.value === 'true')}>
                <option value="true">Sí</option><option value="false">No</option>
              </select>
            </FormField>
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
