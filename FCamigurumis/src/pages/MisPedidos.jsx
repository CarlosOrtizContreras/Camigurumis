// src/pages/MisPedidos.jsx
import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { facturaApi, envioApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Spinner, ErrorMsg, EmptyState, Badge, Modal } from '../components/UI';

export default function MisPedidos() {
  const { user } = useAuth();
  const { data: facturas, loading, error } = useFetch(facturaApi.listar);
  const [envioDetalle, setEnvioDetalle] = useState(null);
  const [loadingEnvio, setLoadingEnvio] = useState(false);

  const misPedidos = (facturas || []).filter(f =>
    f.usuario?.some(u => u.idUsuario === user?.idUsuario)
  );

  async function verEnvio(idEnvio) {
    setLoadingEnvio(true);
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
                  <Badge text={`$${f.total.toLocaleString()}`} color="green" />
                  <span className="pedido-fecha">{f.fechaCompra}</span>
                </div>
                <div className="pedido-items">
                  {f.listaAmigurumi?.map((item, i) => (
                    <div key={i} className="pedido-item">
                      <span>{item.nombre}</span>
                      <span>x{item.cantidad}</span>
                      <span>${(item.precioUnitario * item.cantidad).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="pedido-footer">
                  <span>Envío: ${f.precioEnvio?.toLocaleString()}</span>
                  <button
                    className="btn-outline btn-sm"
                    onClick={() => verEnvio(f.idEnvio)}
                    disabled={loadingEnvio}
                  >
                    {loadingEnvio ? '…' : '🚚 Ver envío'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      {envioDetalle && (
        <Modal title="Estado del envío" onClose={() => setEnvioDetalle(null)}>
          <p><strong>Dirección:</strong> {envioDetalle.direccion || 'Por confirmar'}</p>
          <p><strong>Costo:</strong> ${envioDetalle.costoEnvio?.toLocaleString()}</p>
          <h4>Historial de estados</h4>
          {!envioDetalle.estadoEnvio?.length
            ? <p className="muted">Sin actualizaciones aún</p>
            : (
              <ul className="timeline">
                {envioDetalle.estadoEnvio.map((e, i) => (
                  <li key={i} className="timeline-item">
                    <span className="timeline-dot" />
                    <div>
                      <strong>{e.idEstadoEnvio}</strong>
                      <span className="muted"> · {e.fecha}</span>
                      {e.novedad && <p>{e.novedad}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
        </Modal>
      )}
    </main>
  );
}
