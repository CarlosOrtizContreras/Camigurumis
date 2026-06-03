// src/pages/admin/AdminFacturas.jsx
import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { facturaApi } from '../../services/api';
import { Spinner, ErrorMsg, EmptyState, ActionBar, Modal, Badge } from '../../components/UI';

// ── PDF Generator ─────────────────────────────────────────────────────────────
function buildFacturaHTML(f) {
  const items = (f.listaAmigurumi || [])
    .map(item => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f5e9d5;">${item.nombre}</td>
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

// Helper: obtener nombres de productos de una factura
function getNombresProductos(factura) {
  const items = factura.listaAmigurumi || [];
  if (!items.length) return '—';
  return items.map(i => i.nombre).join(', ');
}

export default function AdminFacturas() {
  const { data, loading, error } = useFetch(facturaApi.listar);
  const [detalle, setDetalle] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = (data || []).filter(f => {
    const q = search.toLowerCase();
    const nombres = getNombresProductos(f).toLowerCase();
    return (
      f.idFactura.toLowerCase().includes(q) ||
      f.usuario?.[0]?.nombre?.toLowerCase().includes(q) ||
      f.fechaCompra?.includes(q) ||
      nombres.includes(q)
    );
  });

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;

  return (
    <section>
      <ActionBar>
        <h3>Facturas</h3>
        <input
          className="search-input"
          placeholder="🔍 Buscar por ID, producto, cliente o fecha…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 280 }}
        />
      </ActionBar>

      {!filtered.length ? (
        <EmptyState icon="🧾" msg={search ? 'No hay resultados' : 'No hay facturas'} />
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Productos</th>
              <th>Total</th>
              <th>Cliente</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.idFactura}>
                <td><code>{f.idFactura.slice(0, 8).toUpperCase()}</code></td>
                <td>{f.fechaCompra}</td>
                {/* Nombres de productos — columna nueva */}
                <td style={{ maxWidth: 200 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {(f.listaAmigurumi || []).map((item, i) => (
                      <span key={i} style={{ fontSize: '0.85rem', color: 'var(--ink)' }}>
                        <strong>{item.nombre}</strong>
                        <span style={{ color: 'var(--muted)', marginLeft: 4 }}>x{item.cantidad}</span>
                      </span>
                    ))}
                    {!(f.listaAmigurumi?.length) && <span style={{ color: 'var(--muted)' }}>—</span>}
                  </div>
                </td>
                <td><Badge text={`$${f.total?.toLocaleString()}`} color="green" /></td>
                <td>{f.usuario?.[0]?.nombre || '—'}</td>
                <td style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="btn-sm btn-outline" onClick={() => setDetalle(f)}>Ver</button>
                  <button
                    className="btn-sm btn-outline"
                    style={{ borderColor: 'var(--sage)', color: 'var(--sage)' }}
                    onClick={() => downloadFactura(f)}
                    title="Descargar / imprimir factura"
                  >
                    ⬇ PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {detalle && (
        <Modal
          title={`Factura #${detalle.idFactura.slice(0, 8).toUpperCase()}`}
          onClose={() => setDetalle(null)}
        >
          <p><strong>Fecha:</strong> {detalle.fechaCompra}</p>
          <p><strong>Cliente:</strong> {detalle.usuario?.[0]?.nombre} — {detalle.usuario?.[0]?.correo || detalle.usuario?.[0]?.Correo}</p>
          <p><strong>ID Envío:</strong> <code>{detalle.idEnvio}</code></p>
          <h4>Productos</h4>
          {detalle.listaAmigurumi?.map((item, i) => (
            <div key={i} className="pedido-item" style={{ padding: '0.35rem 0' }}>
              <span>{item.nombre}</span>
              <span>x{item.cantidad}</span>
              <span>${(item.precioUnitario * item.cantidad)?.toLocaleString()}</span>
            </div>
          ))}
          {/* Personalización si existe */}
          {detalle.listaAmigurumi?.some(item => item.personalizacion && Object.keys(item.personalizacion).length > 0) && (
            <div style={{ marginTop: '0.5rem' }}>
              <h4>Personalización</h4>
              {detalle.listaAmigurumi.map((item, i) => {
                const pers = item.personalizacion || {};
                const entries = Object.entries(pers).filter(([, v]) => v);
                if (!entries.length) return null;
                return (
                  <div key={i} style={{ marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                    <strong>{item.nombre}:</strong>{' '}
                    {entries.map(([parte, color]) => `${parte}: ${color}`).join(' · ')}
                  </div>
                );
              })}
            </div>
          )}
          <div className="summary-row" style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--cream-dark)' }}>
            <span>Envío</span><span>${detalle.precioEnvio?.toLocaleString()}</span>
          </div>
          <div className="summary-row total" style={{ marginTop: '0.25rem' }}>
            <span>Total</span><span>${detalle.total?.toLocaleString()}</span>
          </div>
          <div style={{ marginTop: '1.25rem' }}>
            <button
              className="btn-primary w-full"
              onClick={() => downloadFactura(detalle)}
            >
              ⬇ Descargar / Imprimir factura
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
