// src/pages/admin/AdminPartes.jsx
import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { parteApi, colorApi } from '../../services/api';
import { Spinner, ErrorMsg, EmptyState, Modal, FormField, ActionBar } from '../../components/UI';

const EMPTY = { idParte: '', nombre: '', descripcion: '', color: [], precioExtra: 0, isActivo: true };

function validateParteForm(form, isNew) {
  const errors = {};
  if (isNew) {
    if (!form.idParte.trim()) errors.idParte = 'El ID es obligatorio';
    else if (!/^\d+$/.test(form.idParte.trim())) errors.idParte = 'El ID debe ser numérico';
  }
  if (!form.nombre.trim()) errors.nombre = 'El nombre es obligatorio';
  if (form.precioExtra < 0) errors.precioExtra = 'El precio extra no puede ser negativo';
  return errors;
}

export default function AdminPartes() {
  const { data, loading, error, reload } = useFetch(parteApi.listar);
  const { data: colores } = useFetch(colorApi.listar);
  const [form, setForm] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveError, setSaveError] = useState('');

  function openNew() { setForm({ ...EMPTY, color: [] }); setIsNew(true); setFieldErrors({}); setSaveError(''); }
  function openEdit(p) { setForm({ ...p, color: Array.isArray(p.color) ? [...p.color] : [] }); setIsNew(false); setFieldErrors({}); setSaveError(''); }

  function setField(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    if (fieldErrors[k]) setFieldErrors(p => ({ ...p, [k]: '' }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaveError('');

    const errors = validateParteForm(form, isNew);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    if (isNew) {
      const exists = (data || []).some(p => p.idParte === form.idParte.trim());
      if (exists) { setFieldErrors({ idParte: 'Ya existe una parte con este ID' }); return; }
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        idParte: form.idParte.trim(),
        nombre: form.nombre.trim(),
        precioExtra: Number(form.precioExtra),
      };
      if (isNew) await parteApi.guardar(payload);
      else await parteApi.actualizar(payload);
      reload();
      setForm(null);
    } catch {
      setSaveError('Error al guardar. Intenta de nuevo.');
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta parte?')) return;
    await parteApi.eliminar(id);
    reload();
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
          <thead>
            <tr><th>ID</th><th>Nombre</th><th>Precio extra</th><th>Colores</th><th>Activo</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {data.map(p => (
              <tr key={p.idParte}>
                <td><code>{p.idParte}</code></td>
                <td>{p.nombre}</td>
                <td>${p.precioExtra?.toLocaleString()}</td>
                <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                  {Array.isArray(p.color) && p.color.length > 0 ? p.color.join(', ') : '—'}
                </td>
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
          <form onSubmit={handleSave} className="admin-form" noValidate>
            <FormField label="ID (solo números)">
              <input
                required
                value={form.idParte}
                onChange={e => setField('idParte', e.target.value)}
                disabled={!isNew}
                placeholder="Ej: 201"
                inputMode="numeric"
              />
              {fieldErrors.idParte && <span style={{ color: '#c0364f', fontSize: '0.82rem' }}>{fieldErrors.idParte}</span>}
            </FormField>
            <FormField label="Nombre">
              <input
                required
                value={form.nombre}
                onChange={e => setField('nombre', e.target.value)}
                placeholder="Ej: Orejas"
              />
              {fieldErrors.nombre && <span style={{ color: '#c0364f', fontSize: '0.82rem' }}>{fieldErrors.nombre}</span>}
            </FormField>
            <FormField label="Descripción">
              <textarea
                value={form.descripcion}
                onChange={e => setField('descripcion', e.target.value)}
                rows={2}
                placeholder="Opcional"
              />
            </FormField>
            <FormField label="Precio extra ($)">
              <input
                type="number"
                min={0}
                step={100}
                value={form.precioExtra}
                onChange={e => setField('precioExtra', Number(e.target.value))}
              />
              {fieldErrors.precioExtra && <span style={{ color: '#c0364f', fontSize: '0.82rem' }}>{fieldErrors.precioExtra}</span>}
            </FormField>
            <FormField label="Colores disponibles">
              <div className="color-checkboxes">
                {(colores || []).filter(c => c.isActivo).map(c => (
                  <label key={c.idColor} className="color-check">
                    <input
                      type="checkbox"
                      checked={(form.color || []).includes(c.idColor)}
                      onChange={() => toggleColor(c.idColor)}
                    />
                    <span style={{ background: c.codigoColor }} className="color-dot" />
                    {c.nombre}
                  </label>
                ))}
                {(colores || []).filter(c => c.isActivo).length === 0 && (
                  <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No hay colores activos</span>
                )}
              </div>
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
