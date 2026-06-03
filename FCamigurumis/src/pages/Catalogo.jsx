// src/pages/Catalogo.jsx
import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { amigurumiApi, parteApi, colorApi } from '../services/api';
import { useCart } from '../context/CartContext';
import AmigurumiCard from '../components/AmigurumiCard';
import { Modal, Spinner, ErrorMsg, EmptyState, FormField } from '../components/UI';

export default function Catalogo({ setPage }) {
  const { data: amigurumis, loading, error } = useFetch(amigurumiApi.listar);
  const { data: partes } = useFetch(parteApi.listar);
  const { data: colores } = useFetch(colorApi.listar);
  const { addItem } = useCart();

  const [selected, setSelected] = useState(null);
  const [personalizacion, setPersonalizacion] = useState({});
  const [busqueda, setBusqueda] = useState('');

  const listaFiltrada = (amigurumis || []).filter(a =>
    a.isActivo && a.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  function handlePersonalizar(parte, valor) {
    setPersonalizacion(p => ({ ...p, [parte]: valor }));
  }

  function handleAgregar() {
    addItem(selected, personalizacion);
    setSelected(null);
    setPersonalizacion({});
    setPage('carrito');
  }

  if (loading) return <div className="page-loader"><Spinner /></div>;
  if (error) return <ErrorMsg msg={error} />;

  return (
    <main className="catalogo-page">
      <div className="catalogo-header">
        <h2>Nuestros Amigurumis</h2>
        <input
          className="search-input"
          placeholder="🔍 Buscar amigurumi…"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {listaFiltrada.length === 0
        ? <EmptyState icon="🧸" msg="No hay amigurumis disponibles" />
        : (
          <div className="catalogo-grid">
            {listaFiltrada.map(a => (
              <AmigurumiCard key={a.idAmigurumi} amigurumi={a} onClick={() => setSelected(a)} />
            ))}
          </div>
        )}

      {selected && (
        <Modal title={selected.nombre} onClose={() => setSelected(null)}>
          <div className="detalle-modal">
            {selected.imagen && (
              <img src={`http://localhost:8080/${selected.imagen}`} alt={selected.nombre} className="detalle-img" />
            )}
            <p className="detalle-desc">{selected.descripcion}</p>
            <p className="detalle-precio">
              Precio base: <strong>${selected.precioBase.toLocaleString()}</strong>
            </p>

            {selected.partesModificables?.length > 0 && (
              <div className="personalizacion">
                <h4>Personalización</h4>
                {selected.partesModificables.map(parteNombre => {
                  const parteObj = (partes || []).find(p => p.nombre === parteNombre || p.idParte === parteNombre);
                  const coloresDisp = parteObj
                    ? (colores || []).filter(c => parteObj.color.includes(c.idColor) && c.isActivo)
                    : (colores || []).filter(c => c.isActivo);
                  return (
                    <FormField key={parteNombre} label={parteNombre}>
                      <select
                        value={personalizacion[parteNombre] || ''}
                        onChange={e => handlePersonalizar(parteNombre, e.target.value)}
                      >
                        <option value="">Sin personalizar</option>
                        {coloresDisp.map(c => (
                          <option key={c.idColor} value={c.idColor}>
                            {c.nombre} ({c.codigoColor})
                          </option>
                        ))}
                      </select>
                    </FormField>
                  );
                })}
              </div>
            )}

            <div className="detalle-actions">
              <button className="btn-primary" onClick={handleAgregar} disabled={!selected.disponibilidad}>
                {selected.disponibilidad ? '🛒 Agregar al carrito' : 'No disponible'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}
