// src/components/UI.jsx

export function Spinner() {
  return <div className="spinner" aria-label="Cargando…" />;
}

export function ErrorMsg({ msg }) {
  return <div className="error-msg">⚠️ {msg}</div>;
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function Badge({ text, color = 'rose' }) {
  return <span className={`badge badge-${color}`}>{text}</span>;
}

export function EmptyState({ icon = '📦', msg = 'Sin datos' }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      <p>{msg}</p>
    </div>
  );
}

export function FormField({ label, children }) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

export function ActionBar({ children }) {
  return <div className="action-bar">{children}</div>;
}

export function Card({ children, className = '' }) {
  return <div className={`card ${className}`}>{children}</div>;
}
