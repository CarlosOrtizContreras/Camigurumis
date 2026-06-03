// src/pages/admin/AdminAmigurumis.jsx
import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { amigurumiApi, parteApi } from '../../services/api';
import { Spinner, ErrorMsg, EmptyState, Modal, FormField, ActionBar } from '../../components/UI';

const EMPTY = {
  idAmigurumi: '', nombre: '', descripcion: '', precioBase: 0,
  disponibilidad: true, partesModificables: [], imagen: '',
};

function validarForm(form) {
  const errores = {};
  if (!form.idAmigurumi.trim())
    errores.idAmigurumi = 'El ID es obligatorio';
  else if (!/^[a-zA-Z0-9_-]{2,40}$/.test(form.idAmigurumi.trim()))
    errores.idAmigurumi = 'Solo letras, números, guión o guión bajo (2-40 caracteres)';
  if (!form.nombre.trim())
    errores.nombre = 'El nombre es obligatorio';
  else if (form.nombre.trim().length < 3 || form.nombre.trim().length > 80)
    errores.nombre = 'Nombre: entre 3 y 80 caracteres';
  if (!form.descripcion.trim())
    errores.descripcion = 'La descripción es obligatoria';
  else if (form.descripcion.trim().length < 10)
    errores.descripcion = 'Descripción: mínimo 10 caracteres';
  if (form.precioBase <= 0)
    errores.precioBase = 'El precio debe ser mayor a 0';
  return errores;
}

export default function AdminAmigurumis() {
  const { data, loading, error, reload } = useFetch(amigurumiApi.listar);
  const { data: partes } = useFetch(parteApi.listar);

  const [form, setForm] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imgFile, setImgFile] = useState(null);
  const [errores, setErrores] = useState({});
  const [serverError, setServerError] = useState('');

  function openNew() { setForm({ ...EMPTY }); setIsNew(true); setImgFile(null); setErrores({}); setServerError(''); }
  function openEdit(a) { setForm({ ...a, partesModificables: a.partesModificables || [] }); setIsNew(false); setImgFile(null); setErrores({}); setServerError(''); }
  function setField(k, v) { setForm(f => ({ ...f, [k]: v })); setErrores(e => { const c = { ...e }; delete c[k]; return c; }); }

  function toggleParte(idParte) {
    setForm(f => ({
      ...f,
      partesModificables: f.partesModificables.includes(idParte)
        ? f.partesModificables.filter(p => p !== idParte)
        : [...f.partesModificables, idParte],
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setServerError('');
    const errs = validarForm(form);
    if (Object.keys(errs).length > 0) { setErrores(errs); return; }
    setSaving(true);
    try {
      if (isNew) await amigurumiApi.guardar(form);
      else await amigurumiApi.actualizar(form);
      if (imgFile) await amigurumiApi.subirImagen(form.idAmigurumi, imgFile);
      reload(); setForm(null);
    } catch {
      setServerError(isNew ? 'Error al crear. El ID puede estar en uso.' : 'Error al actualizar.');
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este amigurumi? Se marcará como inactivo.')) return;
    try { await amigurumiApi.eliminar(id); reload(); }
    catch { alert('Error al eliminar el amigurumi.'); }
  }

  const partesActivas = (partes || []).filter(p => p.isActivo);
  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;

  return (
    <section>
      <ActionBar>
        <h3>Amigurumis</h3>
        <button className="btn-primary" onClick={openNew}>+ Nuevo</button>
      </ActionBar>

      {!data?.length ? <EmptyState icon="🧸" msg="No hay amigurumis registrados" /> : (
        <table className="admin-table">
          <thead>
            <tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Partes</th><th>Disp.</th><th>Activo</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {data.map(a => (
              <tr key={a.idAmigurumi}>
                <td><code>{a.idAmigurumi.slice(0, 10)}</code></td>
                <td>{a.nombre}</td>
                <td>${a.precioBase?.toLocaleString()}</td>
                <td>
                  {(a.partesModificables || []).length > 0
                    ? (a.partesModificables || []).map(p => <span key={p} className="parte-pill">{p}</span>)
                    : <span className="muted">—</span>}
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
        <Modal title={isNew ? 'Nuevo amigurumi' : `Editar: ${form.nombre}`} onClose={() => setForm(null)}>
          <form onSubmit={handleSave} className="admin-form" noValidate>
            {serverError && <p className="auth-error">{serverError}</p>}

            <FormField label="ID del amigurumi *">
              <input required value={form.idAmigurumi} onChange={e => setField('idAmigurumi', e.target.value)}
                disabled={!isNew} placeholder="ej: osito-rosa-v1" className={errores.idAmigurumi ? 'input-error' : ''} />
              {errores.idAmigurumi && <span className="field-error">{errores.idAmigurumi}</span>}
              {isNew && <span className="field-hint">Solo letras, números, - y _</span>}
            </FormField>

            <FormField label="Nombre *">
              <input required value={form.nombre} onChange={e => setField('nombre', e.target.value)}
                placeholder="Ej: Osito Rosa" className={errores.nombre ? 'input-error' : ''} />
              {errores.nombre && <span className="field-error">{errores.nombre}</span>}
            </FormField>

            <FormField label="Descripción *">
              <textarea value={form.descripcion} onChange={e => setField('descripcion', e.target.value)}
                rows={3} placeholder="Describe el amigurumi (mín. 10 caracteres)"
                className={errores.descripcion ? 'input-error' : ''} />
              {errores.descripcion && <span className="field-error">{errores.descripcion}</span>}
            </FormField>

            <FormField label="Precio base (COP) *">
              <input type="number" min={1} value={form.precioBase}
                onChange={e => setField('precioBase', Number(e.target.value))}
                className={errores.precioBase ? 'input-error' : ''} />
              {errores.precioBase && <span className="field-error">{errores.precioBase}</span>}
            </FormField>

            <FormField label="Partes modificables (desde catálogo)">
              {partesActivas.length === 0 ? (
                <p className="muted" style={{ fontSize: '0.85rem' }}>No hay partes activas. Crea partes primero en la sección Partes.</p>
              ) : (
                <div className="partes-checkboxes">
                  {partesActivas.map(p => (
                    <label key={p.idParte} className="parte-check-label">
                      <input type="checkbox"
                        checked={form.partesModificables.includes(p.idParte)}
                        onChange={() => toggleParte(p.idParte)} />
                      <span className="parte-check-info">
                        <strong>{p.nombre}</strong>
                        {p.descripcion ? <small> — {p.descripcion}</small> : null}
                        {p.precioExtra > 0 && <span className="parte-precio"> +${p.precioExtra.toLocaleString()}</span>}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              {form.partesModificables.length > 0 && (
                <span className="field-hint">Seleccionadas: {form.partesModificables.join(', ')}</span>
              )}
            </FormField>

            <FormField label="Disponibilidad">
              <select value={form.disponibilidad ? 'true' : 'false'}
                onChange={e => setField('disponibilidad', e.target.value === 'true')}>
                <option value="true">Disponible</option>
                <option value="false">Agotado</option>
              </select>
            </FormField>

            <FormField label="Imagen (JPG, PNG, WEBP — máx. 5 MB)">
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => {
                const file = e.target.files[0];
                if (file && file.size > 5 * 1024 * 1024) { alert('La imagen no puede superar 5 MB'); e.target.value = ''; return; }
                setImgFile(file);
              }} />
              {form.imagen && !imgFile && <span className="field-hint">Imagen actual: {form.imagen}</span>}
              {imgFile && <span className="field-hint" style={{ color: 'green' }}>Nueva: {imgFile.name}</span>}
            </FormField>

            <div className="modal-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? <Spinner /> : (isNew ? 'Crear amigurumi' : 'Guardar cambios')}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancelar</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
