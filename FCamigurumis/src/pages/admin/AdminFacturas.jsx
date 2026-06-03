// src/pages/admin/AdminFacturas.jsx
import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { facturaApi } from '../../services/api';
import { Spinner, ErrorMsg, EmptyState, ActionBar, Modal, Badge } from '../../components/UI';

export default function AdminFacturas() {
  const { data, loading, error } = useFetch(facturaApi.listar);
  const [detalle, setDetalle] = useState(null);

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg msg={error} />;

  return (
    <section>
      <ActionBar><h3>Facturas</h3></ActionBar>
      {!data?.length ? <EmptyState icon="🧾" msg="No hay facturas" /> : (
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Fecha</th><th>Total</th><th>Envío</th><th>Cliente</th><th>Acciones</th></tr></thead>
          <tbody>
            {data.map(f => (
              <tr key={f.idFactura}>
                <td><code>{f.idFactura.slice(0, 8).toUpperCase()}</code></td>
                <td>{f.fechaCompra}</td>
                <td><Badge text={`$${f.total?.toLocaleString()}`} color="green" /></td>
                <td>${f.precioEnvio?.toLocaleString()}</td>
                <td>{f.usuario?.[0]?.nombre || '—'}</td>
                <td>
                  <button className="btn-sm btn-outline" onClick={() => setDetalle(f)}>Ver</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {detalle && (
        <Modal title={`Factura #${detalle.idFactura.slice(0, 8).toUpperCase()}`} onClose={() => setDetalle(null)}>
          <p><strong>Fecha:</strong> {detalle.fechaCompra}</p>
          <p><strong>Cliente:</strong> {detalle.usuario?.[0]?.nombre} — {detalle.usuario?.[0]?.correo}</p>
          <p><strong>ID Envío:</strong> {detalle.idEnvio}</p>
          <h4>Productos</h4>
          {detalle.listaAmigurumi?.map((item, i) => (
            <div key={i} className="pedido-item">
              <span>{item.nombre}</span>
              <span>x{item.cantidad}</span>
              <span>${(item.precioUnitario * item.cantidad)?.toLocaleString()}</span>
            </div>
          ))}
          <div className="summary-row total" style={{ marginTop: '1rem' }}>
            <span>Total</span><span>${detalle.total?.toLocaleString()}</span>
          </div>
        </Modal>
      )}
    </section>
  );
}
