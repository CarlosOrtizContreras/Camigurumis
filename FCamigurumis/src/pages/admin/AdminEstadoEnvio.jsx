// src/pages/admin/AdminEstadoEnvio.jsx
import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { estadoEnvioApi } from '../../services/api';
import { Spinner, ErrorMsg, EmptyState, Modal, FormField, ActionBar } from '../../components/UI';

const EMPTY = { idEstadoEnvio: '', nombre: '', descripcion: '' };

function validateForm(form, isNew) {
  const errors = {};
  if (isNew) {
    if (!form.idEstadoEnvio.trim()) errors.idEstadoEnvio = 'El ID es obligatorio';
    else if (!/^\d+$/.test(form.idEstadoEnvio.trim())) errors.idEstadoEnvio = 'El ID debe ser numérico';
  }
  if (!form.nombre.trim()) errors.nombre = 'El nombre es obligatorio';
  return errors;
}

export default function AdminEstadoEnvio() {
  const { data, loading, error, reload } = useFetch(estadoEnvioApi.listar);
  const [form, setForm] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveError, setSaveError] = useState('');

  function openNew() { setForm({ ...EMPTY }); setIsNew(true); setFieldErrors({}); setSaveError(''); }
  function openEdit(e) { setForm({ ...e }); setIsNew(false); setFieldErrors({}); setSaveError(''); }

  function setField(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    if (fieldErrors[k]) setFieldErrors(p => ({ ...p, [k]: '' }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaveError('');

    const errors = validateForm(form, isNew);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    if (isNew) {
      const exists = (data || []).some(s => s.idEstadoEnvio === form.idEstadoEnvio.trim());
      if (exists) { setFieldErrors({ idEstadoEnvio: 'Ya existe un estado con este ID' }); return; }
    }

    setSaving(true);
    try {
      const payload = { ...form, idEstadoEnvio: form.idEstadoEnvio.trim(), nombre: form.nombre.trim() };
      if (isNew) await estadoEnvioApi.guardar(payload);
      else await estadoEnvioApi.actualizar(payload);
      reload();
      setForm(null);
    } catch {
      setSaveError('Error al guardar. Intenta de nuevo.');
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este estado?')) return;
    await estadoEnvioApi.eliminar(id);
    reload();
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
          <thead>
            <tr><th>ID</th><th>Nombre</th><th>Descripción</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {data.map(e => (
              <tr key={e.idEstadoEnvio}>
                <td><code>{e.idEstadoEnvio}</code></td>
                <td>{e.nombre}</td>
                <td style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{e.descripcion || '—'}</td>
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
          <form onSubmit={handleSave} className="admin-form" noValidate>
            <FormField label="ID (solo números)">
              <input
                required
                value={form.idEstadoEnvio}
                onChange={e => setField('idEstadoEnvio', e.target.value)}
                disabled={!isNew}
                placeholder="Ej: 301"
                inputMode="numeric"
              />
              {fieldErrors.idEstadoEnvio && <span style={{ color: '#c0364f', fontSize: '0.82rem' }}>{fieldErrors.idEstadoEnvio}</span>}
            </FormField>
            <FormField label="Nombre">
              <input
                required
                value={form.nombre}
                onChange={e => setField('nombre', e.target.value)}
                placeholder="Ej: En tránsito"
              />
              {fieldErrors.nombre && <span style={{ color: '#c0364f', fontSize: '0.82rem' }}>{fieldErrors.nombre}</span>}
            </FormField>
            <FormField label="Descripción">
              <textarea
                value={form.descripcion}
                onChange={e => setField('descripcion', e.target.value)}
                rows={2}
                placeholder="Descripción visible para el cliente"
              />
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
