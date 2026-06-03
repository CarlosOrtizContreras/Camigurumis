// src/pages/Carrito.jsx
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { facturaApi, pagoApi, envioApi } from '../services/api';
import { FormField, Spinner } from '../components/UI';

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

export default function Carrito({ setPage }) {
  const { items, removeItem, clearCart, total } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState('cart'); // 'cart' | 'checkout' | 'success'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [envioData, setEnvioData] = useState({ direccion: '', costoEnvio: 10000 });
  const [pedidoId, setPedidoId] = useState('');

  async function handleCheckout(e) {
    e.preventDefault();
    if (!user) { setPage('login'); return; }
    if (!envioData.direccion.trim()) { setError('Por favor ingresa una dirección de envío'); return; }
    setLoading(true); setError('');
    try {
      const idFactura = uid();
      const idEnvio = uid();
      const idPago = uid();

      // Guardar personalización con nombres legibles para que se vea en factura y pedidos
      const listaAmigurumi = items.map(i => ({
        idAmigurumi: i.amigurumi.idAmigurumi,
        nombre: i.amigurumi.nombre,
        cantidad: i.cantidad,
        precioUnitario: i.precioUnitario,           // ya incluye precioExtra de partes
        precioBase: i.amigurumi.precioBase,
        precioExtras: i.precioExtrasTotal || 0,
        personalizacion: i.personalizacion,         // { "Orejas": "Rosa", "Ojos": "Azul" }
      }));

      const usuarioData = [{
        idUsuario: user.idUsuario,
        nombre: user.nombre,
        correo: user.Correo,
      }];

      // 1. Crear la factura (el backend también crea el envío sin dirección)
      await facturaApi.guardar({
        idFactura,
        listaAmigurumi,
        usuario: usuarioData,
        total: total + envioData.costoEnvio,
        fechaCompra: new Date().toISOString().slice(0, 10),
        idEnvio,
        precioEnvio: envioData.costoEnvio,
      });

      // 2. Actualizar el envío con la dirección real
      await envioApi.actualizar({
        idEnvio,
        direccion: envioData.direccion.trim(),
        costoEnvio: envioData.costoEnvio,
        estadoEnvio: [],
      });

      // 3. Registrar el pago
      await pagoApi.guardar({ idPago, idFactura, estadoPago: true });

      setPedidoId(idFactura);
      clearCart();
      setStep('success');
    } catch (err) {
      console.error(err);
      setError('Error al procesar el pedido. Intenta de nuevo.');
    } finally { setLoading(false); }
  }

  if (step === 'success') {
    return (
      <main className="carrito-page">
        <div className="success-state">
          <span className="success-icon">🎉</span>
          <h2>¡Pedido realizado!</h2>
          <p>ID del pedido: <code>{pedidoId}</code></p>
          <p>Te contactaremos pronto para coordinar tu amigurumi.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => setPage('misPedidos')}>Ver mis pedidos</button>
            <button className="btn-outline" onClick={() => setPage('catalogo')}>Seguir comprando</button>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="carrito-page">
        <div className="empty-cart">
          <span>🛒</span>
          <h3>Tu carrito está vacío</h3>
          <button className="btn-primary" onClick={() => setPage('catalogo')}>Ver catálogo</button>
        </div>
      </main>
    );
  }

  return (
    <main className="carrito-page">
      <h2>Tu carrito</h2>

      <div className="carrito-layout">
        <div className="carrito-items">
          {items.map(item => (
            <div className="cart-item" key={item.key}>
              <div className="cart-item-info">
                <strong>{item.amigurumi.nombre}</strong>
                {/* Precio base + extras */}
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 2 }}>
                  Base: ${item.amigurumi.precioBase.toLocaleString()}
                  {item.precioExtrasTotal > 0 && (
                    <span style={{ color: 'var(--rose)', marginLeft: 8 }}>
                      + Extras: ${item.precioExtrasTotal.toLocaleString()}
                    </span>
                  )}
                </div>
                {Object.entries(item.personalizacion).length > 0 && (
                  <ul className="personalizacion-list">
                    {Object.entries(item.personalizacion).map(([p, v]) => (
                      <li key={p}>{p}: <em>{v}</em></li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="cart-item-price">
                <span>x{item.cantidad}</span>
                <span>${(item.precioUnitario * item.cantidad).toLocaleString()}</span>
                <button className="btn-danger-sm" onClick={() => removeItem(item.key)}>✕</button>
              </div>
            </div>
          ))}
        </div>

        <div className="carrito-summary">
          <h3>Resumen</h3>
          <div className="summary-row"><span>Subtotal</span><span>${total.toLocaleString()}</span></div>
          <div className="summary-row"><span>Envío</span><span>${envioData.costoEnvio.toLocaleString()}</span></div>
          <div className="summary-row total"><span>Total</span><span>${(total + envioData.costoEnvio).toLocaleString()}</span></div>

          {step === 'cart' && (
            <button className="btn-primary w-full" onClick={() => setStep('checkout')}>
              Continuar al pago
            </button>
          )}

          {step === 'checkout' && (
            <form onSubmit={handleCheckout} className="checkout-form">
              <h4>Datos de envío</h4>
              <FormField label="Dirección de envío">
                <input
                  required
                  placeholder="Calle # Número, Barrio, Ciudad"
                  value={envioData.direccion}
                  onChange={e => setEnvioData(d => ({ ...d, direccion: e.target.value }))}
                />
              </FormField>
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? <Spinner /> : '💳 Confirmar pedido'}
              </button>
              <button type="button" className="btn-ghost w-full" onClick={() => setStep('cart')}>
                Volver
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
