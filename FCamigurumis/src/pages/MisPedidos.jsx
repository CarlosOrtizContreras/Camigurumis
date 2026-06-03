// src/pages/MisPedidos.jsx
import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { facturaApi, envioApi, estadoEnvioApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Spinner, ErrorMsg, EmptyState, Badge, Modal } from '../components/UI';

// ── PDF / Factura HTML (reutilizado del panel admin) ─────────────────────────
function buildFacturaHTML(f) {
  const items = (f.listaAmigurumi || [])
    .map(item => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f5e9d5;">
          ${item.nombre}
          ${item.personalizacion && Object.entries(item.personalizacion).filter(([,v])=>v).length > 0
            ? `<div style="font-size:11px;color:#9a7a8a;margin-top:3px;">${
                Object.entries(item.personalizacion)
                  .filter(([,v])=>v)
                  .map(([p,c])=>`${p}: ${c}`)
                  .join(' · ')
              }</div>`
            : ''}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #f5e9d5;text-align:center;">${item.cantidad}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f5e9d5;text-align:right;">$${Number(item.precioUnitario).toLocaleString()}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f5e9d5;text-align:right;font-weight:700;">$${(item.precioUnitario * item.cantidad).toLocaleString()}</td>
      </tr>`)
    .join('');

  const cliente = f.usuario?.[0];

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Factura #${f.idFactura.slice(0,8).toUpperCase()}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Nunito:wght@400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Nunito', sans-serif; color: #2d1a2e; background: #fef8f0; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .brand { font-family: 'DM Serif Display', serif; font-size: 28px; color: #4a1c40; }
    .brand span { display: block; font-family: 'Nunito', sans-serif; font-size: 13px; color: #9a7a8a; font-weight: 400; margin-top: 4px; }
    .factura-id { text-align: right; }
    .factura-id h2 { font-family: 'DM Serif Display', serif; font-size: 22px; color: #4a1c40; }
    .factura-id p { color: #9a7a8a; font-size: 13px; margin-top: 4px; }
    .divider { height: 2px; background: linear-gradient(90deg, #4a1c40, #d4788a); margin: 0 0 24px; border-radius: 2px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
    .info-box { background: #fff; border-radius: 10px; padding: 16px 20px; border: 1px solid #f5e9d5; }
    .info-box h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #7b3f70; margin-bottom: 8px; }
    .info-box p { font-size: 14px; color: #2d1a2e; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 10px; overflow: hidden; border: 1px solid #f5e9d5; margin-bottom: 20px; }
    thead tr { background: #4a1c40; color: #fef8f0; }
    thead th { padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
    thead th:not(:first-child) { text-align: right; }
    thead th:nth-child(2) { text-align: center; }
    .totals { display: flex; justify-content: flex-end; }
    .totals-box { background: #fff; border: 1px solid #f5e9d5; border-radius: 10px; padding: 16px 24px; min-width: 260px; }
    .totals-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 14px; color: #9a7a8a; }
    .totals-row.total { border-top: 2px solid #f5e9d5; margin-top: 8px; padding-top: 10px; font-size: 18px; font-weight: 700; color: #4a1c40; }
    .footer { margin-top: 32px; text-align: center; color: #9a7a8a; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      🧶 Camigurumis
      <span>Hecho con amor · Amigurumis únicos para ti</span>
    </div>
    <div class="factura-id">
      <h2>FACTURA</h2>
      <p>#${f.idFactura.slice(0,8).toUpperCase()}</p>
      <p>Fecha: ${f.fechaCompra}</p>
    </div>
  </div>
  <div class="divider"></div>
  <div class="info-grid">
    <div class="info-box">
      <h4>Cliente</h4>
      <p><strong>${cliente?.nombre || 'N/D'}</strong><br/>
      ${cliente?.correo || cliente?.Correo || ''}</p>
    </div>
    <div class="info-box">
      <h4>Envío</h4>
      <p>ID: ${f.idEnvio}<br/>Costo de envío: $${Number(f.precioEnvio).toLocaleString()}</p>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Producto</th>
        <th style="text-align:center">Cant.</th>
        <th style="text-align:right">Precio unit.</th>
        <th style="text-align:right">Subtotal</th>
      </tr>
    </thead>
    <tbody>${items}</tbody>
  </table>
  <div class="totals">
    <div class="totals-box">
      <div class="totals-row"><span>Subtotal productos</span><span>$${(f.total - f.precioEnvio).toLocaleString()}</span></div>
      <div class="totals-row"><span>Envío</span><span>$${Number(f.precioEnvio).toLocaleString()}</span></div>
      <div class="totals-row total"><span>Total</span><span>$${Number(f.total).toLocaleString()}</span></div>
    </div>
  </div>
  <div class="footer">
    <p>¡Gracias por tu compra! · Camigurumis · ${new Date().getFullYear()}</p>
  </div>
</body>
</html>`;
}

function downloadFactura(factura) {
  const html = buildFacturaHTML(factura);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.addEventListener('load', () => { win.print(); });
  }
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// ─────────────────────────────────────────────────────────────────────────────

export default function MisPedidos() {
  const { user } = useAuth();
  const { data: facturas, loading, error } = useFetch(facturaApi.listar);
  const { data: estadosCatalogo } = useFetch(estadoEnvioApi.listar);
  const [envioDetalle, setEnvioDetalle] = useState(null);
  const [loadingEnvio, setLoadingEnvio] = useState(false);
  const [facturaDetalle, setFacturaDetalle] = useState(null);

  const misPedidos = (facturas || []).filter(f =>
    f.usuario?.some(u => u.idUsuario === user?.idUsuario)
  );

  function resolveEstado(idEstadoEnvio) {
    if (!estadosCatalogo) return { nombre: idEstadoEnvio, descripcion: '' };
    const found = estadosCatalogo.find(e => e.idEstadoEnvio === idEstadoEnvio);
    return found
      ? { nombre: found.nombre, descripcion: found.descripcion }
      : { nombre: idEstadoEnvio, descripcion: '' };
  }

  // Devuelve el último estado resuelto de un envío ya cargado
  function getEstadoActual(envio) {
    if (!envio?.estadoEnvio?.length) return null;
    const ultimo = envio.estadoEnvio[envio.estadoEnvio.length - 1];
    return resolveEstado(ultimo.idEstadoEnvio);
  }

  async function verEnvio(idEnvio, factura) {
    setLoadingEnvio(true);
    setFacturaDetalle(factura);
    try {
      const e = await envioApi.buscar(idEnvio);
      setEnvioDetalle(e);
    } catch { /* ignore */ }
    finally { setLoadingEnvio(false); }
  }

  if (loading) return <div className="page-loader"><Spinner /></div>;
  if (error) return <ErrorMsg msg={error} />;

  return (
    <main className="pedidos-page">
      <h2>Mis pedidos</h2>

      {misPedidos.length === 0
        ? <EmptyState icon="📦" msg="Aún no tienes pedidos" />
        : (
          <div className="pedidos-list">
            {misPedidos.map(f => (
              <div className="pedido-card" key={f.idFactura}>
                <div className="pedido-header">
                  <span className="pedido-id">#{f.idFactura.slice(0, 8).toUpperCase()}</span>
                  <Badge text={`$${f.total?.toLocaleString()}`} color="green" />
                  <span className="pedido-fecha">{f.fechaCompra}</span>
                </div>

                <div className="pedido-items">
                  {f.listaAmigurumi?.map((item, i) => (
                    <div key={i} className="pedido-item">
                      <span>
                        {item.nombre}
                        {item.personalizacion && Object.keys(item.personalizacion).length > 0 && (
                          <span style={{ color: 'var(--muted)', fontSize: '0.8rem', marginLeft: 6 }}>
                            ({Object.entries(item.personalizacion)
                              .filter(([, v]) => v)
                              .map(([parte, color]) => `${parte}: ${color}`)
                              .join(', ')})
                          </span>
                        )}
                      </span>
                      <span>x{item.cantidad}</span>
                      <span>${(item.precioUnitario * item.cantidad).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="pedido-footer">
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    Envío: ${f.precioEnvio?.toLocaleString()}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {/* Botón descargar factura */}
                    <button
                      className="btn-outline btn-sm"
                      style={{ borderColor: 'var(--plum)', color: 'var(--plum)' }}
                      onClick={() => downloadFactura(f)}
                      title="Descargar / imprimir factura"
                    >
                      🧾 Factura
                    </button>
                    {/* Botón ver estado de envío */}
                    <button
                      className="btn-outline btn-sm"
                      onClick={() => verEnvio(f.idEnvio, f)}
                      disabled={loadingEnvio}
                    >
                      {loadingEnvio ? '…' : '🚚 Ver envío'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Modal de estado de envío */}
      {envioDetalle && (
        <Modal title="Estado del envío" onClose={() => { setEnvioDetalle(null); setFacturaDetalle(null); }}>
          <p><strong>Dirección:</strong> {envioDetalle.direccion || 'Por confirmar'}</p>
          <p><strong>Costo:</strong> ${envioDetalle.costoEnvio?.toLocaleString()}</p>

          {/* Estado actual destacado */}
          {envioDetalle.estadoEnvio?.length > 0 && (() => {
            const estadoActual = getEstadoActual(envioDetalle);
            const nombre = estadoActual?.nombre?.toLowerCase() || '';
            const esCancelado = nombre.includes('cancelado') || nombre.includes('cancelar');
            const esEntregado = nombre.includes('entregado') || nombre.includes('terminado') || nombre.includes('completado');
            const bgColor = esCancelado ? '#fde0e5' : esEntregado ? '#d4edda' : 'var(--cream-dark)';
            const textColor = esCancelado ? '#c0364f' : esEntregado ? '#2e7d32' : 'var(--plum)';
            const icon = esCancelado ? '❌' : esEntregado ? '✅' : '📦';

            return (
              <div style={{
                marginTop: '0.75rem',
                background: bgColor,
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                <div>
                  <strong style={{ color: textColor, display: 'block' }}>
                    Estado actual: {estadoActual?.nombre}
                  </strong>
                  {estadoActual?.descripcion && (
                    <span style={{ fontSize: '0.85rem', color: textColor }}>{estadoActual.descripcion}</span>
                  )}
                </div>
              </div>
            );
          })()}

          <h4 style={{ marginTop: '1rem' }}>Historial de estados</h4>
          {!envioDetalle.estadoEnvio?.length
            ? (
              <div style={{
                background: 'var(--cream-dark)', borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem', color: 'var(--muted)', fontSize: '0.9rem',
                marginTop: '0.5rem',
              }}>
                📦 Tu pedido está siendo procesado. Pronto recibirás actualizaciones.
              </div>
            )
            : (
              <ul className="timeline">
                {envioDetalle.estadoEnvio.map((e, i) => {
                  const { nombre, descripcion } = resolveEstado(e.idEstadoEnvio);
                  const isLast = i === envioDetalle.estadoEnvio.length - 1;
                  const esCancelado = nombre.toLowerCase().includes('cancelado');
                  return (
                    <li key={i} className="timeline-item" style={isLast ? { fontWeight: 600 } : {}}>
                      <span className="timeline-dot" style={
                        isLast
                          ? { background: esCancelado ? '#c0364f' : 'var(--sage)' }
                          : {}
                      } />
                      <div>
                        <strong>{nombre}</strong>
                        {isLast && (
                          <span style={{
                            marginLeft: 8, fontSize: '0.72rem',
                            background: esCancelado ? '#c0364f' : 'var(--sage)',
                            color: '#fff', borderRadius: 99, padding: '1px 7px', fontWeight: 700,
                          }}>
                            Actual
                          </span>
                        )}
                        <span className="muted"> · {e.fecha}</span>
                        {descripcion && (
                          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
                            {descripcion}
                          </p>
                        )}
                        {e.novedad && (
                          <p style={{ fontSize: '0.88rem', marginTop: '0.2rem' }}>{e.novedad}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

          {/* Botón descargar factura desde el modal de envío */}
          {facturaDetalle && (
            <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--cream-dark)', paddingTop: '1rem' }}>
              <button
                className="btn-outline"
                style={{ width: '100%', borderColor: 'var(--plum)', color: 'var(--plum)' }}
                onClick={() => downloadFactura(facturaDetalle)}
              >
                🧾 Descargar / Imprimir factura
              </button>
            </div>
          )}
        </Modal>
      )}
    </main>
  );
}
