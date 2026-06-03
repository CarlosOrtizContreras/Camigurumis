// src/pages/Catalogo.jsx
import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { amigurumiApi, parteApi, colorApi } from '../services/api';
import { useCart } from '../context/CartContext';
import AmigurumiCard from '../components/AmigurumiCard';
import { Modal, Spinner, ErrorMsg, EmptyState } from '../components/UI';

export default function Catalogo({ setPage }) {
  const { data: amigurumis, loading, error } = useFetch(amigurumiApi.listar);
  const { data: partes } = useFetch(parteApi.listar);
  const { data: colores } = useFetch(colorApi.listar);
  const { addItem } = useCart();

  const [selected, setSelected] = useState(null);
  // personalizacion: { [idParte]: idColor }
  const [personalizacion, setPersonalizacion] = useState({});
  const [busqueda, setBusqueda] = useState('');

  const listaFiltrada = (amigurumis || []).filter(a =>
    a.isActivo && a.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  function openDetalle(amigurumi) {
    setSelected(amigurumi);
    setPersonalizacion({});
  }

  function handleColorChange(idParte, idColor) {
    setPersonalizacion(p => {
      if (!idColor) {
        // Si elige "Sin personalizar", eliminar esa parte de la selección
        const next = { ...p };
        delete next[idParte];
        return next;
      }
      return { ...p, [idParte]: idColor };
    });
  }

  function handleAgregar() {
    // Construir objeto de personalización con nombres legibles para mostrar en carrito
    const persConNombres = {};
    Object.entries(personalizacion).forEach(([idParte, idColor]) => {
      const parteObj = (partes || []).find(p => p.idParte === idParte);
      const colorObj = (colores || []).find(c => c.idColor === idColor);
      const nombreParte = parteObj ? parteObj.nombre : idParte;
      const nombreColor = colorObj ? colorObj.nombre : idColor;
      persConNombres[nombreParte] = nombreColor;
    });

    addItem(selected, persConNombres);
    setSelected(null);
    setPersonalizacion({});
    setPage('carrito');
  }

  // Obtener las partes modificables del amigurumi seleccionado, con sus colores disponibles
  function getPartesDelAmigurumi(amigurumi) {
    if (!amigurumi?.partesModificables?.length) return [];
    return amigurumi.partesModificables
      .map(idParte => {
        const parteObj = (partes || []).find(p => p.idParte === idParte);
        if (!parteObj || !parteObj.isActivo) return null;
        const coloresDisp = (colores || []).filter(c =>
          Array.isArray(parteObj.color) && parteObj.color.includes(c.idColor) && c.isActivo
        );
        return { ...parteObj, coloresDisponibles: coloresDisp };
      })
      .filter(Boolean);
  }

  if (loading) return <div className="page-loader"><Spinner /></div>;
  if (error) return <ErrorMsg msg={error} />;

  const partesAmigurumi = selected ? getPartesDelAmigurumi(selected) : [];
  const tienePersonalizacion = partesAmigurumi.length > 0;
  const partsSeleccionadas = Object.keys(personalizacion).length;

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
              <AmigurumiCard key={a.idAmigurumi} amigurumi={a} onClick={() => openDetalle(a)} />
            ))}
          </div>
        )}

      {selected && (
        <Modal title={selected.nombre} onClose={() => setSelected(null)}>
          <div className="detalle-modal">

            {/* Imagen */}
            {selected.imagen && (
              <img
                src={`http://localhost:8080/${selected.imagen}`}
                alt={selected.nombre}
                className="detalle-img"
              />
            )}

            {/* Descripción y precio */}
            <p className="detalle-desc">{selected.descripcion}</p>
            <p className="detalle-precio">
              Precio base: <strong>${selected.precioBase?.toLocaleString()}</strong>
            </p>

            {/* Sección de personalización por partes */}
            {tienePersonalizacion ? (
              <div className="personalizacion">
                <h4 style={{ marginBottom: '0.75rem' }}>
                  🎨 Personalización
                  {partsSeleccionadas > 0 && (
                    <span style={{
                      marginLeft: '0.5rem',
                      background: 'var(--rose)',
                      color: '#fff',
                      borderRadius: 99,
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 700,
                    }}>
                      {partsSeleccionadas} seleccionada{partsSeleccionadas !== 1 ? 's' : ''}
                    </span>
                  )}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {partesAmigurumi.map(parte => {
                    const colorSeleccionado = personalizacion[parte.idParte];
                    const colorObj = colorSeleccionado
                      ? (colores || []).find(c => c.idColor === colorSeleccionado)
                      : null;

                    return (
                      <div key={parte.idParte} style={{
                        background: colorSeleccionado ? 'var(--cream-dark)' : '#fff',
                        border: `1.5px solid ${colorSeleccionado ? 'var(--rose-light)' : 'var(--cream-dark)'}`,
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.85rem 1rem',
                        transition: 'all 0.2s ease',
                      }}>
                        {/* Encabezado de la parte */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <div>
                            <span style={{ fontWeight: 700, color: 'var(--plum)', fontSize: '0.95rem' }}>
                              {parte.nombre}
                            </span>
                            {parte.descripcion && (
                              <span style={{ color: 'var(--muted)', fontSize: '0.8rem', marginLeft: 6 }}>
                                — {parte.descripcion}
                              </span>
                            )}
                            {parte.precioExtra > 0 && (
                              <span style={{ color: 'var(--rose)', fontSize: '0.8rem', marginLeft: 6, fontWeight: 600 }}>
                                +${parte.precioExtra.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {/* Indicador del color seleccionado */}
                          {colorObj && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{
                                width: 16, height: 16, borderRadius: '50%',
                                background: colorObj.codigoColor,
                                border: '1.5px solid rgba(0,0,0,0.15)',
                                display: 'inline-block',
                              }} />
                              <span style={{ fontSize: '0.8rem', color: 'var(--plum)', fontWeight: 600 }}>
                                {colorObj.nombre}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Colores disponibles como swatches */}
                        {parte.coloresDisponibles.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                            {/* Opción "ninguno" */}
                            <button
                              type="button"
                              onClick={() => handleColorChange(parte.idParte, '')}
                              style={{
                                width: 32, height: 32,
                                borderRadius: '50%',
                                border: !colorSeleccionado
                                  ? '3px solid var(--plum)'
                                  : '2px solid var(--cream-dark)',
                                background: '#fff',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.7rem',
                                color: 'var(--muted)',
                                transition: 'border 0.15s',
                                flexShrink: 0,
                              }}
                              title="Sin personalizar"
                            >
                              ✕
                            </button>

                            {parte.coloresDisponibles.map(color => (
                              <button
                                key={color.idColor}
                                type="button"
                                onClick={() => handleColorChange(parte.idParte, color.idColor)}
                                title={`${color.nombre} (${color.codigoColor})`}
                                style={{
                                  width: 32, height: 32,
                                  borderRadius: '50%',
                                  background: color.codigoColor,
                                  border: colorSeleccionado === color.idColor
                                    ? '3px solid var(--plum)'
                                    : '2px solid rgba(0,0,0,0.15)',
                                  cursor: 'pointer',
                                  transition: 'border 0.15s, transform 0.15s',
                                  transform: colorSeleccionado === color.idColor ? 'scale(1.15)' : 'scale(1)',
                                  flexShrink: 0,
                                }}
                              />
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: 0 }}>
                            No hay colores disponibles para esta parte
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Resumen de personalización */}
                {partsSeleccionadas > 0 && (
                  <div style={{
                    marginTop: '0.75rem',
                    background: '#fff',
                    border: '1px solid var(--cream-dark)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.6rem 0.9rem',
                    fontSize: '0.85rem',
                  }}>
                    <strong style={{ color: 'var(--plum)', display: 'block', marginBottom: '0.3rem' }}>
                      Resumen de tu personalización:
                    </strong>
                    {Object.entries(personalizacion).map(([idParte, idColor]) => {
                      const parteObj = partesAmigurumi.find(p => p.idParte === idParte);
                      const colorObj = (colores || []).find(c => c.idColor === idColor);
                      if (!parteObj || !colorObj) return null;
                      return (
                        <div key={idParte} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <span style={{
                            width: 10, height: 10, borderRadius: '50%',
                            background: colorObj.codigoColor,
                            border: '1px solid rgba(0,0,0,0.15)',
                            flexShrink: 0,
                          }} />
                          <span style={{ color: 'var(--muted)' }}>
                            <strong style={{ color: 'var(--ink)' }}>{parteObj.nombre}</strong>: {colorObj.nombre}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Este amigurumi no tiene partes personalizables.
              </p>
            )}

            {/* Botón agregar */}
            <div className="detalle-actions" style={{ marginTop: '1.25rem' }}>
              <button
                className="btn-primary"
                style={{ width: '100%' }}
                onClick={handleAgregar}
                disabled={!selected.disponibilidad}
              >
                {selected.disponibilidad ? '🛒 Agregar al carrito' : 'No disponible'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}
