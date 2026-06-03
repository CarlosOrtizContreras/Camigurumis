// src/pages/Admin.jsx
import { useState } from 'react';
import AdminAmigurumis from './admin/AdminAmigurumis';
import AdminColores from './admin/AdminColores';
import AdminPartes from './admin/AdminPartes';
import AdminUsuarios from './admin/AdminUsuarios';
import AdminFacturas from './admin/AdminFacturas';
import AdminEnvios from './admin/AdminEnvios';
import AdminEstadoEnvio from './admin/AdminEstadoEnvio';

const SECTIONS = [
  { key: 'amigurumis', label: '🧸 Amigurumis', component: AdminAmigurumis },
  { key: 'colores', label: '🎨 Colores', component: AdminColores },
  { key: 'partes', label: '✂️ Partes', component: AdminPartes },
  { key: 'usuarios', label: '👥 Usuarios', component: AdminUsuarios },
  { key: 'facturas', label: '🧾 Facturas', component: AdminFacturas },
  { key: 'envios', label: '🚚 Envíos', component: AdminEnvios },
  { key: 'estadoEnvio', label: '📋 Estados de Envío', component: AdminEstadoEnvio },
];

export default function Admin() {
  const [section, setSection] = useState('amigurumis');
  const Active = SECTIONS.find(s => s.key === section)?.component;

  return (
    <main className="admin-layout">
      <aside className="admin-sidebar">
        <h3>Panel Admin</h3>
        <nav>
          {SECTIONS.map(s => (
            <button
              key={s.key}
              className={`admin-nav-btn ${section === s.key ? 'active' : ''}`}
              onClick={() => setSection(s.key)}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </aside>
      <div className="admin-content">
        {Active && <Active />}
      </div>
    </main>
  );
}
