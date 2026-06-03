// src/pages/admin/AdminEnvios.jsx
import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { envioApi, estadoEnvioApi, facturaApi } from '../../services/api';
import { Spinner, ErrorMsg, EmptyState, ActionBar, Modal, FormField } from '../../components/UI';

export default function AdminEnvios() {
  const { data, loading, error, reload } = useFetch(envioApi.listar);
  const { data: estadosCat } = useFetch(estadoEnvioApi.listar);
  const { data: facturas } = useFetch(facturaApi.listar);

  const [selected, setSelected] = useState(null);
  const [newEstado, setNewEstado] = useState({ idEstadoEnvio: '', novedad: '' });
  const [saving, setSaving] = useState(false);
  const [savingTerminado, setSavingTerminado] = useState(false);
  const [savingCancelado, setSavingCancelado] = useState(false);

  function getFacturaDeEnvio(idEnvio) {
    return (facturas || []).find(f => f.idEnvio === idEnvio) || null;
  }

  function getUltimoEstado(envio) {
    if (!envio?.estadoEnvio?.length) return null;
    const ultimo = envio.estadoEnvio[envio.estadoEnvio.length - 1];
    const cat = (estadosCat || []).find(e => e.idEstadoEnvio === ultimo.idEstadoEnvio);
    return { ...ultimo, nombreEstado: cat ? cat.nombre : ultimo.idEstadoEnvio };
  }

  function isTerminado(envio) {
    if (!envio?.estadoEnvio?.length) return false;
    const ultimo = envio.estadoEnvio[envio.estadoEnvio.length - 1];
    const cat = (estadosCat || []).find(e => e.idEstadoEnvio === ultimo.idEstadoEnvio);
    const nombre = (cat?.nombre || '').toLowerCase();
    return nombre.includes('entregado') || nombre.includes('terminado') || nombre.includes('completado');
  }

  function isCancelado(envio) {
    if (!envio?.estadoEnvio?.length) return false;
    const ultimo = envio.estadoEnvio[envio.estadoEnvio.length - 1];
    const cat = (estadosCat || []).find(e => e.idEstadoEnvio === ultimo.idEstadoEnvio);
    const nombre = (cat?.nombre || '').toLowerCase();
    return nombre.includes('cancelado') || nombre.includes('cancelar');
  }

  function isFinalizado(envio) {
    return isTerminado(envio) || isCancelado(envio);
  }

  function getEstadoTerminado() {
    if (!estadosCat) return null;
    return estadosCat.find(e => {
      const n = e.nombre.toLowerCase();
      return n.includes('entregado') || n.includes('terminado') || n.includes('completado');
    });
  }

  function getEstadoCancelado() {
    if (!estadosCat) return null;
    return estadosCat.find(e => {
      const n = e.nombre.toLowerCase();
      return n.includes('cancelado') || n.includes('cancelar');
    });
  }

  async function handleAgregarEstado(e) {
    e.preventDefault();
    if (!newEstado.idEstadoEnvio) return;
    setSaving(true);
    try {
      await envioApi.agregarEstado(selected.idEnvio, newEstado.idEstadoEnvio, newEstado.novedad);
      const updated = await envioApi.buscar(selected.idEnvio);
      setSelected(updated);
      setNewEstado({ idEstadoEnvio: '', novedad: '' });
      reload();
    } finally { setSaving(false); }
  }

  async function handleMarcarTerminado() {
    const estadoTerminado = getEstadoTerminado();
    if (!estadoTerminado) {
      alert('No se encontró un estado "Entregado/Terminado" en el catálogo. Por favor créalo primero en "Estados de Envío".');
      return;
    }
    if (!confirm('¿Marcar este envío como entregado?')) return;
    setSavingTerminado(true);
    try {
      await envioApi.agregarEstado(selected.idEnvio, estadoTerminado.idEstadoEnvio, 'Pedido entregado al cliente.');
      const updated = await envioApi.buscar(selected.idEnvio);
      setSelected(updated);
      reload();
    } finally { setSavingTerminado(false); }
  }

  async function handleMarcarCancelado() {
    const estadoCancelado = getEstadoCancelado();
    if (!estadoCancelado) {
      alert('No se encontró un estado "Cancelado" en el catálogo. Por favor créalo primero en "Estados de Envío".');
      return;
    }
    if (!confirm('¿Cancelar este pedido? Esta acción quedará registrada en el historial.')) return;
    setSavingCancelado(true);
    try {
      await envioApi.agregarEstado(selected.idEnvio, estadoCancelado.idEstadoEnvio, 'Pedido cancelado por el administrador.');
      const updated = await envioApi.buscar(selected.idEnvio);
      setSelected(updated);
      reload();
    } finally { setSavingCancelado(false); }
  }

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;

  return (
    <section>
      <ActionBar><h3>Envíos</h3></ActionBar>

      {!data?.length ? <EmptyState icon="🚚" msg="No hay envíos" /> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Dirección</th>
              <th>Costo</th>
              <th>Último estado</th>
              <th>Producto(s)</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map(e => {
              const ultimoEstado = getUltimoEstado(e);
              const factura = getFacturaDeEnvio(e.idEnvio);
              const terminado = isTerminado(e);
              const cancelado = isCancelado(e);
              return (
                <tr key={e.idEnvio}>
                  <td><code>{e.idEnvio.slice(0, 8)}</code></td>
                  <td style={{ maxWidth: 180, fontSize: '0.88rem' }}>{e.direccion || '—'}</td>
                  <td>${e.costoEnvio?.toLocaleString()}</td>
                  <td>
                    {ultimoEstado ? (
                      <span style={{
                        display: 'inline-block', padding: '2px 10px',
                        borderRadius: 99, fontSize: '0.78rem', fontWeight: 700,
                        background: cancelado ? '#fde0e5' : terminado ? '#d4edda' : 'var(--cream-dark)',
                        color: cancelado ? '#c0364f' : terminado ? '#2e7d32' : 'var(--plum)',
                      }}>
                        {ultimoEstado.nombreEstado}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>Sin estado</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--muted)', maxWidth: 160 }}>
                    {factura
                      ? (factura.listaAmigurumi || []).map(item =>
                          `${item.nombre} x${item.cantidad}`
                        ).join(', ')
                      : '—'}
                  </td>
                  <td>
                    <button className="btn-sm btn-outline" onClick={() => {
                      setSelected(e);
                      setNewEstado({ idEstadoEnvio: '', novedad: '' });
                    }}>
                      Gestionar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {selected && (
        <Modal title={`Envío #${selected.idEnvio.slice(0, 8)}`} onClose={() => setSelected(null)}>
          {/* Info básica */}
          <p><strong>Dirección:</strong> {selected.direccion || 'Sin definir'}</p>
          <p><strong>Costo:</strong> ${selected.costoEnvio?.toLocaleString()}</p>

          {/* Productos de la factura */}
          {(() => {
            const factura = getFacturaDeEnvio(selected.idEnvio);
            if (!factura) return null;
            return (
              <div style={{ marginTop: '0.75rem' }}>
                <h4>Productos del pedido</h4>
                <div style={{
                  background: 'var(--cream-dark)', borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 1rem', marginTop: '0.5rem',
                }}>
                  {(factura.listaAmigurumi || []).map((item, i) => (
                    <div key={i} style={{ marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                        <span>{item.nombre} x{item.cantidad}</span>
                        <span>${(item.precioUnitario * item.cantidad).toLocaleString()}</span>
                      </div>
                      {item.personalizacion && Object.entries(item.personalizacion).filter(([, v]) => v).length > 0 && (
                        <div style={{ marginTop: '0.2rem', paddingLeft: '0.5rem', fontSize: '0.82rem', color: 'var(--muted)' }}>
                          {Object.entries(item.personalizacion)
                            .filter(([, v]) => v)
                            .map(([parte, color]) => (
                              <span key={parte} style={{ marginRight: 8 }}>
                                🎨 {parte}: <em>{color}</em>
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '0.5rem', marginTop: '0.25rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--muted)' }}>Cliente: </span>
                    <strong>{factura.usuario?.[0]?.nombre || '—'}</strong>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Historial de estados */}
          <h4 style={{ marginTop: '1rem' }}>Historial de estados</h4>
          {!selected.estadoEnvio?.length
            ? <p className="muted">Sin estados aún</p>
            : (
              <ul className="timeline">
                {selected.estadoEnvio.map((st, i) => {
                  const cat = (estadosCat || []).find(e => e.idEstadoEnvio === st.idEstadoEnvio);
                  const nombreEstado = cat ? cat.nombre : st.idEstadoEnvio;
                  const isLast = i === selected.estadoEnvio.length - 1;
                  const esCancelado = nombreEstado.toLowerCase().includes('cancelado');
                  return (
                    <li key={i} className="timeline-item">
                      <span className="timeline-dot" style={
                        isLast
                          ? { background: esCancelado ? '#c0364f' : 'var(--sage)' }
                          : {}
                      } />
                      <div>
                        <strong>{nombreEstado}</strong>
                        {isLast && (
                          <span style={{
                            marginLeft: 8, fontSize: '0.7rem',
                            background: esCancelado ? '#c0364f' : 'var(--sage)',
                            color: '#fff', borderRadius: 99, padding: '1px 7px',
                          }}>Actual</span>
                        )}
                        <span className="muted"> · {st.fecha}</span>
                        {st.novedad && <p style={{ fontSize: '0.88rem', marginTop: '0.15rem' }}>{st.novedad}</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

          {/* Acciones rápidas: Entregado y Cancelado */}
          {!isFinalizado(selected) && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Marcar como entregado */}
              <div style={{ flex: 1, minWidth: 140, background: '#d4edda', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
                <p style={{ fontSize: '0.82rem', color: '#2e7d32', marginBottom: '0.5rem' }}>
                  ✅ Pedido entregado al cliente
                </p>
                <button
                  className="btn-primary"
                  style={{ background: '#2e7d32', width: '100%', fontSize: '0.85rem' }}
                  onClick={handleMarcarTerminado}
                  disabled={savingTerminado}
                >
                  {savingTerminado ? <Spinner /> : '✅ Marcar como Entregado'}
                </button>
              </div>

              {/* Marcar como cancelado */}
              <div style={{ flex: 1, minWidth: 140, background: '#fde0e5', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
                <p style={{ fontSize: '0.82rem', color: '#c0364f', marginBottom: '0.5rem' }}>
                  ❌ Cancelar este pedido
                </p>
                <button
                  className="btn-primary"
                  style={{ background: '#c0364f', width: '100%', fontSize: '0.85rem' }}
                  onClick={handleMarcarCancelado}
                  disabled={savingCancelado}
                >
                  {savingCancelado ? <Spinner /> : '❌ Cancelar pedido'}
                </button>
              </div>
            </div>
          )}

          {/* Estado final */}
          {isTerminado(selected) && (
            <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#d4edda', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <strong style={{ color: '#2e7d32' }}>✅ Envío entregado</strong>
            </div>
          )}
          {isCancelado(selected) && (
            <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#fde0e5', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <strong style={{ color: '#c0364f' }}>❌ Pedido cancelado</strong>
            </div>
          )}

          {/* Agregar estado manualmente */}
          {!isFinalizado(selected) && (
            <>
              <h4 style={{ marginTop: '1.25rem' }}>Agregar estado manualmente</h4>
              <form onSubmit={handleAgregarEstado}>
                <FormField label="Estado">
                  <select
                    required
                    value={newEstado.idEstadoEnvio}
                    onChange={e => setNewEstado(s => ({ ...s, idEstadoEnvio: e.target.value }))}
                  >
                    <option value="">Seleccionar…</option>
                    {(estadosCat || []).map(st => (
                      <option key={st.idEstadoEnvio} value={st.idEstadoEnvio}>{st.nombre}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Novedad / observación">
                  <input
                    value={newEstado.novedad}
                    onChange={e => setNewEstado(s => ({ ...s, novedad: e.target.value }))}
                    placeholder="Descripción del estado…"
                  />
                </FormField>
                <button type="submit" className="btn-primary" disabled={saving || !newEstado.idEstadoEnvio}>
                  {saving ? <Spinner /> : 'Agregar estado'}
                </button>
              </form>
            </>
          )}

          {/* Si está finalizado, solo permite agregar estados de forma libre (para correcciones) */}
          {isFinalizado(selected) && (
            <>
              <h4 style={{ marginTop: '1.25rem' }}>Agregar estado (corrección)</h4>
              <form onSubmit={handleAgregarEstado}>
                <FormField label="Estado">
                  <select
                    required
                    value={newEstado.idEstadoEnvio}
                    onChange={e => setNewEstado(s => ({ ...s, idEstadoEnvio: e.target.value }))}
                  >
                    <option value="">Seleccionar…</option>
                    {(estadosCat || []).map(st => (
                      <option key={st.idEstadoEnvio} value={st.idEstadoEnvio}>{st.nombre}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Novedad / observación">
                  <input
                    value={newEstado.novedad}
                    onChange={e => setNewEstado(s => ({ ...s, novedad: e.target.value }))}
                    placeholder="Motivo de la corrección…"
                  />
                </FormField>
                <button type="submit" className="btn-outline" style={{ fontSize: '0.85rem' }} disabled={saving || !newEstado.idEstadoEnvio}>
                  {saving ? <Spinner /> : 'Agregar estado'}
                </button>
              </form>
            </>
          )}
        </Modal>
      )}
    </section>
  );
}
