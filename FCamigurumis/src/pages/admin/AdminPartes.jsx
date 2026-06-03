// src/pages/admin/AdminPartes.jsx
import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { parteApi, colorApi } from '../../services/api';
import { Spinner, ErrorMsg, EmptyState, Modal, FormField, ActionBar } from '../../components/UI';

const EMPTY = { idParte: '', nombre: '', descripcion: '', color: [], precioExtra: 0, isActivo: true };

export default function AdminPartes() {
  const { data, loading, error, reload } = useFetch(parteApi.listar);
  const { data: colores } = useFetch(colorApi.listar);
  const [form, setForm] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  function openNew() { setForm({ ...EMPTY }); setIsNew(true); }
  function openEdit(p) { setForm({ ...p }); setIsNew(false); }
  function setField(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSave(e) {
    e.preventDefault(); setSaving(true);
    try {
      if (isNew) await parteApi.guardar(form); else await parteApi.actualizar(form);
      reload(); setForm(null);
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar?')) return;
    await parteApi.eliminar(id); reload();
  }

  function toggleColor(id) {
    setForm(f => ({
      ...f,
      color: f.color.includes(id) ? f.color.filter(c => c !== id) : [...f.color, id],
    }));
  }

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;

  return (
    <section>
      <ActionBar>
        <h3>Partes</h3>
        <button className="btn-primary" onClick={openNew}>+ Nueva</button>
      </ActionBar>
      {!data?.length ? <EmptyState /> : (
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Nombre</th><th>Precio extra</th><th>Colores</th><th>Activo</th><th>Acciones</th></tr></thead>
          <tbody>
            {data.map(p => (
              <tr key={p.idParte}>
                <td><code>{p.idParte}</code></td>
                <td>{p.nombre}</td>
                <td>${p.precioExtra?.toLocaleString()}</td>
                <td>{p.color?.join(', ')}</td>
                <td>{p.isActivo ? '✅' : '❌'}</td>
                <td>
                  <button className="btn-sm btn-outline" onClick={() => openEdit(p)}>Editar</button>
                  <button className="btn-sm btn-danger" onClick={() => handleDelete(p.idParte)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {form && (
        <Modal title={isNew ? 'Nueva parte' : 'Editar parte'} onClose={() => setForm(null)}>
          <form onSubmit={handleSave} className="admin-form">
            <FormField label="ID"><input required value={form.idParte} onChange={e => setField('idParte', e.target.value)} disabled={!isNew} /></FormField>
            <FormField label="Nombre"><input required value={form.nombre} onChange={e => setField('nombre', e.target.value)} /></FormField>
            <FormField label="Descripción"><textarea value={form.descripcion} onChange={e => setField('descripcion', e.target.value)} rows={2} /></FormField>
            <FormField label="Precio extra"><input type="number" min={0} value={form.precioExtra} onChange={e => setField('precioExtra', Number(e.target.value))} /></FormField>
            <FormField label="Colores disponibles">
              <div className="color-checkboxes">
                {(colores || []).filter(c => c.isActivo).map(c => (
                  <label key={c.idColor} className="color-check">
                    <input type="checkbox" checked={form.color.includes(c.idColor)} onChange={() => toggleColor(c.idColor)} />
                    <span style={{ background: c.codigoColor }} className="color-dot" />
                    {c.nombre}
                  </label>
                ))}
              </div>
            </FormField>
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
