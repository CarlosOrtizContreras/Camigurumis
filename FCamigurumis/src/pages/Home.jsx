// src/pages/Home.jsx
export default function Home({ setPage }) {
  return (
    <main className="home">
      <section className="hero">
        <div className="hero-content">
          <p className="hero-eyebrow">Hechos con amor 🧶</p>
          <h1 className="hero-title">
            Amigurumis<br />
            <em>únicos para ti</em>
          </h1>
          <p className="hero-sub">
            Personalizá cada detalle: colores, partes y acabados.
            Un peluche hecho a tu medida.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => setPage('catalogo')}>
              Ver catálogo
            </button>
            <button className="btn-outline" onClick={() => setPage('login')}>
              Crear cuenta
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-blob">🧸</div>
          <div className="hero-blob-2">🌸</div>
          <div className="hero-blob-3">🎀</div>
        </div>
      </section>

      <section className="features">
        {[
          { icon: '🎨', title: 'Personalización total', desc: 'Elige colores y partes a tu gusto.' },
          { icon: '✂️', title: 'Hecho a mano', desc: 'Cada amigurumi tejido con dedicación.' },
          { icon: '🚚', title: 'Envío rastreado', desc: 'Seguí tu pedido en tiempo real.' },
          { icon: '💝', title: 'Con amor', desc: 'Regalos únicos para momentos especiales.' },
        ].map(f => (
          <div className="feature-card" key={f.title}>
            <span className="feature-icon">{f.icon}</span>
            <h4>{f.title}</h4>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
