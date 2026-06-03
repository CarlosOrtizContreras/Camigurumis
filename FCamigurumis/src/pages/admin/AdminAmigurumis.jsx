// src/pages/admin/AdminAmigurumis.jsx
import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { amigurumiApi } from '../../services/api';
import { Spinner, ErrorMsg, EmptyState, Modal, FormField, ActionBar } from '../../components/UI';

const EMPTY = {
  idAmigurumi: '', nombre: '', descripcion: '', precioBase: 0,
  disponibilidad: true, partesModificables: [], imagen: '',
};

export default function AdminAmigurumis() {
  const { data, loading, error, reload } = useFetch(amigurumiApi.listar);
  const [form, setForm] = useState(null); // null=closed, {}=editing
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imgFile, setImgFile] = useState(null);

  function openNew() { setForm({ ...EMPTY }); setIsNew(true); setImgFile(null); }
  function openEdit(a) { setForm({ ...a }); setIsNew(false); setImgFile(null); }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) {
        await amigurumiApi.guardar(form);
      } else {
        await amigurumiApi.actualizar(form);
      }
      if (imgFile) {
        await amigurumiApi.subirImagen(form.idAmigurumi, imgFile);
      }
      reload();
      setForm(null);
    } catch { /* TODO: show error */ }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este amigurumi?')) return;
    await amigurumiApi.eliminar(id);
    reload();
  }

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })); }

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;

  return (
    <section>
      <ActionBar>
        <h3>Amigurumis</h3>
        <button className="btn-primary" onClick={openNew}>+ Nuevo</button>
      </ActionBar>

      {!data?.length
        ? <EmptyState />
        : (
          <table className="admin-table">
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Disponible</th><th>Activo</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {data.map(a => (
                <tr key={a.idAmigurumi}>
                  <td><code>{a.idAmigurumi.slice(0, 8)}</code></td>
                  <td>{a.nombre}</td>
                  <td>${a.precioBase?.toLocaleString()}</td>
                  <td>{a.disponibilidad ? '✅' : '❌'}</td>
                  <td>{a.isActivo ? '✅' : '❌'}</td>
                  <td>
                    <button className="btn-sm btn-outline" onClick={() => openEdit(a)}>Editar</button>
                    <button className="btn-sm btn-danger" onClick={() => handleDelete(a.idAmigurumi)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      {form && (
        <Modal title={isNew ? 'Nuevo amigurumi' : 'Editar amigurumi'} onClose={() => setForm(null)}>
          <form onSubmit={handleSave} className="admin-form">
            <FormField label="ID"><input required value={form.idAmigurumi} onChange={e => setField('idAmigurumi', e.target.value)} disabled={!isNew} /></FormField>
            <FormField label="Nombre"><input required value={form.nombre} onChange={e => setField('nombre', e.target.value)} /></FormField>
            <FormField label="Descripción"><textarea value={form.descripcion} onChange={e => setField('descripcion', e.target.value)} rows={3} /></FormField>
            <FormField label="Precio base"><input type="number" min={0} value={form.precioBase} onChange={e => setField('precioBase', Number(e.target.value))} /></FormField>
            <FormField label="Partes modificables (separadas por coma)">
              <input
                value={Array.isArray(form.partesModificables) ? form.partesModificables.join(',') : ''}
                onChange={e => setField('partesModificables', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              />
            </FormField>
            <FormField label="Disponible">
              <select value={form.disponibilidad ? 'true' : 'false'} onChange={e => setField('disponibilidad', e.target.value === 'true')}>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </FormField>
            <FormField label="Imagen (archivo)">
              <input type="file" accept="image/*" onChange={e => setImgFile(e.target.files[0])} />
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
