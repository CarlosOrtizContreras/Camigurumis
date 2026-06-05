// src/services/api.js
const BASE_URL = 'https://camigurumis-1.onrender.com';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (res.status === 204 || res.status === 201) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── Amigurumi ────────────────────────────────────────────────────────────────
export const amigurumiApi = {
  listar: () => request('/amigurumi/listar'),
  buscar: (id) => request(`/amigurumi/buscar?id=${id}`),
  guardar: (data) => request('/amigurumi/guardar', { method: 'POST', body: JSON.stringify(data) }),
  actualizar: (data) => request('/amigurumi/actualizar', { method: 'PUT', body: JSON.stringify(data) }),
  eliminar: (id) => request(`/amigurumi/eliminar/${id}`, { method: 'DELETE' }),
  subirImagen: (id, file) => {
    const fd = new FormData();
    fd.append('imagen', file);
    fd.append('id', id);
    return fetch(`${BASE_URL}/amigurumi/subirImagen`, { method: 'POST', body: fd }).then(r => r.text());
  },
};

// ─── Color ────────────────────────────────────────────────────────────────────
export const colorApi = {
  listar: () => request('/color/listar'),
  buscar: (id) => request(`/color/buscar?id=${id}`),
  guardar: (data) => request('/color/guardar', { method: 'POST', body: JSON.stringify(data) }),
  actualizar: (data) => request('/color/actualizar', { method: 'PUT', body: JSON.stringify(data) }),
  eliminar: (id) => request(`/color/eliminar/${id}`, { method: 'DELETE' }),
};

// ─── Parte ────────────────────────────────────────────────────────────────────
export const parteApi = {
  listar: () => request('/parte/listar'),
  buscar: (id) => request(`/parte/buscar?id=${id}`),
  guardar: (data) => request('/parte/guardar', { method: 'POST', body: JSON.stringify(data) }),
  actualizar: (data) => request('/parte/actualizar', { method: 'PUT', body: JSON.stringify(data) }),
  eliminar: (id) => request(`/parte/eliminar/${id}`, { method: 'DELETE' }),
};

// ─── EstadoEnvio ──────────────────────────────────────────────────────────────
export const estadoEnvioApi = {
  listar: () => request('/estadoEnvio/listar'),
  guardar: (data) => request('/estadoEnvio/guardar', { method: 'POST', body: JSON.stringify(data) }),
  actualizar: (data) => request('/estadoEnvio/actualizar', { method: 'PUT', body: JSON.stringify(data) }),
  eliminar: (id) => request(`/estadoEnvio/eliminar/${id}`, { method: 'DELETE' }),
};

// ─── Envio ────────────────────────────────────────────────────────────────────
export const envioApi = {
  listar: () => request('/envio/listar'),
  buscar: (id) => request(`/envio/buscar?id=${id}`),
  guardar: (data) => request('/envio/guardar', { method: 'POST', body: JSON.stringify(data) }),
  actualizar: (data) => request('/envio/actualizar', { method: 'PUT', body: JSON.stringify(data) }),
  agregarEstado: (idEnvio, idEstadoEnvio, novedad = '') =>
    request(`/envio/agregarEstado?idEnvio=${idEnvio}&idEstadoEnvio=${idEstadoEnvio}&novedad=${encodeURIComponent(novedad)}`, { method: 'POST' }),
};

// ─── Factura ──────────────────────────────────────────────────────────────────
export const facturaApi = {
  listar: () => request('/factura/listar'),
  buscar: (id) => request(`/factura/buscar?id=${id}`),
  guardar: (data) => request('/factura/guardar', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Pago ─────────────────────────────────────────────────────────────────────
export const pagoApi = {
  listar: () => request('/pago/listar'),
  buscar: (id) => request(`/pago/buscar?id=${id}`),
  guardar: (data) => request('/pago/guardar', { method: 'POST', body: JSON.stringify(data) }),
  actualizarEstado: (id, estado) => request(`/pago/actualizarEstado?id=${id}&estado=${estado}`, { method: 'PUT' }),
  eliminar: (id) => request(`/pago/eliminar/${id}`, { method: 'DELETE' }),
};

// ─── Usuario ──────────────────────────────────────────────────────────────────
export const usuarioApi = {
  listar: () => request('/usuario/listarUsarios'),
  buscar: (id) => request(`/usuario/listarBusquedaUsuario?id=${id}`),
  guardar: (data) => request('/usuario/guardarUsuario', { method: 'POST', body: JSON.stringify(data) }),
  actualizarDatos: (data) => request('/usuario/realizarActualizacionDatosUsuario', { method: 'PUT', body: JSON.stringify(data) }),
  actualizarPassword: (id, password) =>
    request(`/usuario/realizarActualizacionContrasenaUsuario?id=${id}&password=${encodeURIComponent(password)}`, { method: 'PUT' }),
  eliminar: (id) => request(`/usuario/eliminacionUsuario${id}`, { method: 'DELETE' }),
};
