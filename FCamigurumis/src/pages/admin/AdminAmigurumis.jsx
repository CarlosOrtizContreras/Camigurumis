// src/pages/admin/AdminAmigurumis.jsx
import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { amigurumiApi, parteApi } from '../../services/api';
import { Spinner, ErrorMsg, EmptyState, Modal, FormField, ActionBar } from '../../components/UI';

const EMPTY = {
  idAmigurumi: '', nombre: '', descripcion: '', precioBase: 0,
  disponibilidad: true, partesModificables: [], imagen: '',
};

function validateForm(form, isNew) {
  const errors = {};
  if (isNew) {
    if (!form.idAmigurumi.trim()) errors.idAmigurumi = 'El ID es obligatorio';
    else if (!/^\d+$/.test(form.idAmigurumi.trim())) errors.idAmigurumi = 'El ID debe ser numérico';
  }
  if (!form.nombre.trim()) errors.nombre = 'El nombre es obligatorio';
  if (form.precioBase < 0) errors.precioBase = 'El precio no puede ser negativo';
  if (form.precioBase === '' || form.precioBase === null) errors.precioBase = 'El precio es obligatorio';
  return errors;
}

export default function AdminAmigurumis() {
  const { data, loading, error, reload } = useFetch(amigurumiApi.listar);
  // Cargar las partes habilitadas para el selector
  const { data: partesDisponibles } = useFetch(parteApi.listar);

  const [form, setForm] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imgFile, setImgFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [saveError, setSaveError] = useState('');

  // Solo partes activas
  const partesActivas = (partesDisponibles || []).filter(p => p.isActivo);

  function openNew() {
    setForm({ ...EMPTY, partesModificables: [] });
    setIsNew(true);
    setImgFile(null);
    setFormErrors({});
    setSaveError('');
  }

  function openEdit(a) {
    setForm({
      ...a,
      partesModificables: Array.isArray(a.partesModificables) ? a.partesModificables : [],
    });
    setIsNew(false);
    setImgFile(null);
    setFormErrors({});
    setSaveError('');
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaveError('');

    const errors = validateForm(form, isNew);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    if (isNew) {
      const exists = (data || []).some(a => a.idAmigurumi === form.idAmigurumi.trim());
      if (exists) {
        setFormErrors({ idAmigurumi: 'Ya existe un amigurumi con este ID' });
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        idAmigurumi: form.idAmigurumi.trim(),
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        precioBase: Number(form.precioBase),
        // partesModificables ya es array de idParte strings
        partesModificables: Array.isArray(form.partesModificables)
          ? form.partesModificables.filter(Boolean)
          : [],
      };

      if (isNew) {
        await amigurumiApi.guardar(payload);
      } else {
        await amigurumiApi.actualizar(payload);
      }

      if (imgFile) {
        await amigurumiApi.subirImagen(payload.idAmigurumi, imgFile);
      }
      reload();
      setForm(null);
    } catch {
      setSaveError('Error al guardar. Verifica los datos e intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este amigurumi?')) return;
    await amigurumiApi.eliminar(id);
    reload();
  }

  function setField(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    if (formErrors[k]) setFormErrors(prev => ({ ...prev, [k]: '' }));
  }

  // Toggle una parte en la lista de partesModificables (guarda el idParte)
  function toggleParte(idParte) {
    setForm(f => {
      const current = Array.isArray(f.partesModificables) ? f.partesModificables : [];
      const updated = current.includes(idParte)
        ? current.filter(id => id !== idParte)
        : [...current, idParte];
      return { ...f, partesModificables: updated };
    });
  }

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
              <tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Partes</th><th>Disponible</th><th>Activo</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {data.map(a => (
                <tr key={a.idAmigurumi}>
                  <td><code>{a.idAmigurumi.slice(0, 10)}</code></td>
                  <td>{a.nombre}</td>
                  <td>${a.precioBase?.toLocaleString()}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    {Array.isArray(a.partesModificables) && a.partesModificables.length > 0
                      ? a.partesModificables.filter(Boolean).map(idP => {
                          const p = (partesDisponibles || []).find(x => x.idParte === idP);
                          return p ? p.nombre : idP;
                        }).join(', ')
                      : '—'}
                  </td>
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
            <FormField label="ID (solo números)">
              <input
                required
                value={form.idAmigurumi}
                onChange={e => setField('idAmigurumi', e.target.value)}
                disabled={!isNew}
                placeholder="Ej: 1001"
                inputMode="numeric"
              />
              {formErrors.idAmigurumi && <span style={{ color: '#c0364f', fontSize: '0.82rem' }}>{formErrors.idAmigurumi}</span>}
            </FormField>

            <FormField label="Nombre">
              <input
                required
                value={form.nombre}
                onChange={e => setField('nombre', e.target.value)}
                placeholder="Nombre del amigurumi"
              />
              {formErrors.nombre && <span style={{ color: '#c0364f', fontSize: '0.82rem' }}>{formErrors.nombre}</span>}
            </FormField>

            <FormField label="Descripción">
              <textarea
                value={form.descripcion}
                onChange={e => setField('descripcion', e.target.value)}
                rows={3}
                placeholder="Descripción del amigurumi"
              />
            </FormField>

            <FormField label="Precio base ($)">
              <input
                type="number"
                min={0}
                step={100}
                required
                value={form.precioBase}
                onChange={e => setField('precioBase', Number(e.target.value))}
              />
              {formErrors.precioBase && <span style={{ color: '#c0364f', fontSize: '0.82rem' }}>{formErrors.precioBase}</span>}
            </FormField>

            {/* Selector de partes habilitadas mediante checkboxes */}
            <FormField label="Partes modificables">
              {partesActivas.length === 0 ? (
                <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                  No hay partes activas. Crea partes primero en la sección "Partes".
                </span>
              ) : (
                <div className="color-checkboxes" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                  {partesActivas.map(parte => {
                    const checked = (form.partesModificables || []).includes(parte.idParte);
                    return (
                      <label key={parte.idParte} className="color-check" style={{ alignItems: 'flex-start' }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleParte(parte.idParte)}
                          style={{ marginTop: 2 }}
                        />
                        <span>
                          <strong style={{ color: 'var(--plum)' }}>{parte.nombre}</strong>
                          {parte.descripcion && (
                            <span style={{ color: 'var(--muted)', fontSize: '0.8rem', marginLeft: 6 }}>
                              — {parte.descripcion}
                            </span>
                          )}
                          {parte.precioExtra > 0 && (
                            <span style={{ color: 'var(--rose)', fontSize: '0.8rem', marginLeft: 6 }}>
                              +${parte.precioExtra.toLocaleString()}
                            </span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
              {/* Vista previa de las partes seleccionadas */}
              {(form.partesModificables || []).filter(Boolean).length > 0 && (
                <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                  {(form.partesModificables || []).filter(Boolean).map(idP => {
                    const p = partesActivas.find(x => x.idParte === idP);
                    return p ? (
                      <span key={idP} style={{
                        background: 'var(--cream-dark)', padding: '2px 8px',
                        borderRadius: 99, fontSize: '0.78rem', color: 'var(--plum)'
                      }}>
                        {p.nombre}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </FormField>

            <FormField label="Disponible">
              <select
                value={form.disponibilidad ? 'true' : 'false'}
                onChange={e => setField('disponibilidad', e.target.value === 'true')}
              >
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </FormField>

            <FormField label="Imagen (archivo)">
              <input type="file" accept="image/*" onChange={e => setImgFile(e.target.files[0])} />
              {imgFile && <span style={{ fontSize: '0.82rem', color: 'var(--sage)' }}>✓ {imgFile.name}</span>}
              {!isNew && form.imagen && !imgFile && (
                <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Imagen actual: {form.imagen}</span>
              )}
            </FormField>

            {saveError && (
              <div className="error-msg" style={{ marginBottom: '0.75rem' }}>{saveError}</div>
            )}

            <div className="modal-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? <Spinner /> : 'Guardar'}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancelar</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
