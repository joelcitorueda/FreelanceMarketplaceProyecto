// Servicio central de comunicación con el backend API de FreelancRued
const API_BASE = 'http://localhost:5160/api';

async function peticion(endpoint, opciones = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
  });
  const datos = await res.json();
  if (!res.ok && !datos) throw new Error(`HTTP ${res.status}`);
  return datos;
}

export const api = {
  // Autenticación
  register: (usuario) => peticion('/auth/register', { method: 'POST', body: JSON.stringify(usuario) }),
  login: (credenciales) => peticion('/auth/login', { method: 'POST', body: JSON.stringify(credenciales) }),

  // Servicios
  getServices: () => peticion('/services'),
  createService: (servicio) => peticion('/services', { method: 'POST', body: JSON.stringify(servicio) }),

  // Módulos de servicios
  getModules: (serviceId) => peticion(`/services/${serviceId}/modules`),
  addModule: (serviceId, modulo) => peticion(`/services/${serviceId}/modules`, { method: 'POST', body: JSON.stringify(modulo) }),
  deleteModule: (moduleId) => peticion(`/modules/${moduleId}`, { method: 'DELETE' }),

  // Propuestas
  getProposals: () => peticion('/proposals'),
  getProposalsByDeveloper: (devId) => peticion(`/proposals/developer/${devId}`),
  getProposalsByClient: (clientId) => peticion(`/proposals/client/${clientId}`),
  submitProposal: (propuesta) => peticion('/proposals', { method: 'POST', body: JSON.stringify(propuesta) }),
  acceptProposal: (id) => peticion(`/proposals/${id}/accept`, { method: 'POST' }),

  // Utilidades
  seed: () => peticion('/seed'),
  getUsers: () => peticion('/users'),
};
