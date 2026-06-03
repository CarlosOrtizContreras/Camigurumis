// src/pages/admin/AdminColores.jsx
import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { colorApi } from '../../services/api';
import { Spinner, ErrorMsg, EmptyState, Modal, FormField, ActionBar } from '../../components/UI';

const EMPTY_COLOR = { idColor: '', nombre: '', codigoColor: '#ff0000', descripcion: '', isActivo: true };

function validateColorForm(form, isNew) {
  const errors = {};
  if (isNew) {
    if (!form.idColor.trim()) errors.idColor = 'El ID es obligatorio';
    else if (!/^\d+$/.test(form.idColor.trim())) errors.idColor = 'El ID debe ser numérico';
  }
  if (!form.nombre.trim()) errors.nombre = 'El nombre es obligatorio';
  if (!form.codigoColor) errors.codigoColor = 'El código de color es obligatorio';
  return errors;
}

export default function AdminColores() {
  const { data, loading, error, reload } = useFetch(colorApi.listar);
  const [form, setForm] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveError, setSaveError] = useState('');

  function openNew() { setForm({ ...EMPTY_COLOR }); setIsNew(true); setFieldErrors({}); setSaveError(''); }
  function openEdit(c) { setForm({ ...c }); setIsNew(false); setFieldErrors({}); setSaveError(''); }

  function setField(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    if (fieldErrors[k]) setFieldErrors(p => ({ ...p, [k]: '' }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaveError('');

    const errors = validateColorForm(form, isNew);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    // Check duplicate ID
    if (isNew) {
      const exists = (data || []).some(c => c.idColor === form.idColor.trim());
      if (exists) { setFieldErrors({ idColor: 'Ya existe un color con este ID' }); return; }
    }

    setSaving(true);
    try {
      const payload = { ...form, idColor: form.idColor.trim(), nombre: form.nombre.trim() };
      if (isNew) await colorApi.guardar(payload);
      else await colorApi.actualizar(payload);
      reload();
      setForm(null);
    } catch {
      setSaveError('Error al guardar. Intenta de nuevo.');
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este color?')) return;
    await colorApi.eliminar(id);
    reload();
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
          <thead><tr><th>ID</th><th>Nombre</th><th>Color</th><th>Descripción</th><th>Activo</th><th>Acciones</th></tr></thead>
          <tbody>
            {data.map(c => (
              <tr key={c.idColor}>
                <td><code>{c.idColor}</code></td>
                <td>{c.nombre}</td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ background: c.codigoColor, width: 20, height: 20, borderRadius: 4, border: '1px solid rgba(0,0,0,0.15)', display: 'inline-block' }} />
                    <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{c.codigoColor}</span>
                  </span>
                </td>
                <td style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{c.descripcion || '—'}</td>
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
          <form onSubmit={handleSave} className="admin-form" noValidate>
            <FormField label="ID (solo números)">
              <input
                required
                value={form.idColor}
                onChange={e => setField('idColor', e.target.value)}
                disabled={!isNew}
                placeholder="Ej: 101"
                inputMode="numeric"
              />
              {fieldErrors.idColor && <span style={{ color: '#c0364f', fontSize: '0.82rem' }}>{fieldErrors.idColor}</span>}
            </FormField>
            <FormField label="Nombre">
              <input
                required
                value={form.nombre}
                onChange={e => setField('nombre', e.target.value)}
                placeholder="Ej: Rojo carmín"
              />
              {fieldErrors.nombre && <span style={{ color: '#c0364f', fontSize: '0.82rem' }}>{fieldErrors.nombre}</span>}
            </FormField>
            <FormField label="Color">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="color"
                  value={form.codigoColor}
                  onChange={e => setField('codigoColor', e.target.value)}
                  style={{ width: 48, height: 40, padding: 2, borderRadius: 6, cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>{form.codigoColor}</span>
              </div>
            </FormField>
            <FormField label="Descripción">
              <input
                value={form.descripcion}
                onChange={e => setField('descripcion', e.target.value)}
                placeholder="Opcional"
              />
            </FormField>
            <FormField label="Activo">
              <select
                value={form.isActivo ? 'true' : 'false'}
                onChange={e => setField('isActivo', e.target.value === 'true')}
              >
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </FormField>
            {saveError && <div className="error-msg" style={{ marginBottom: '0.75rem' }}>{saveError}</div>}
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
