// src/components/AmigurumiCard.jsx
import { Badge } from './UI';

export default function AmigurumiCard({ amigurumi, onClick }) {
  const { nombre, descripcion, precioBase, disponibilidad, imagen, isActivo } = amigurumi;

  if (!isActivo) return null;

  return (
    <article className="amigurumi-card" onClick={onClick}>
      <div className="amigurumi-img-wrap">
        {imagen
          ? <img src={`https://camigurumis-1.onrender.com/${imagen}`} alt={nombre} className="amigurumi-img" />
          : <div className="amigurumi-img-placeholder">🧸</div>}
        {!disponibilidad && <div className="amigurumi-agotado">Agotado</div>}
      </div>
      <div className="amigurumi-info">
        <h3 className="amigurumi-nombre">{nombre}</h3>
        <p className="amigurumi-desc">{descripcion}</p>
        <div className="amigurumi-footer">
          <span className="amigurumi-precio">${precioBase.toLocaleString()}</span>
          <Badge text={disponibilidad ? 'Disponible' : 'Agotado'} color={disponibilidad ? 'green' : 'rose'} />
        </div>
      </div>
    </article>
  );
}
