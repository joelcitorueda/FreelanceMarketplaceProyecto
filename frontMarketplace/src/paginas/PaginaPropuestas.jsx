import { useEffect, useState } from 'react';
import { useAuth } from '../contexto/AuthContexto';
import { useNotificacion } from '../componentes/Notificacion';
import { api } from '../servicios/api';
import {
  Plus, Check, X, AlertCircle,
  MessageSquare, User, Briefcase
} from 'lucide-react';

const MAPA_ESTADOS = {
  0: { etiqueta: 'Pendiente', cls: 'badge-pending' },
  1: { etiqueta: 'Aceptada', cls: 'badge-accepted' },
  2: { etiqueta: 'Rechazada', cls: 'badge-rejected' },
  3: { etiqueta: 'Retirada', cls: 'badge-rejected' },
};

const FORMULARIO_INICIAL = {
  serviceId: '',
  proposedPrice: '',
  message: '',
};

export default function PaginaPropuestas() {
  const { usuario, esDesarrollador, esCliente } = useAuth();
  const notificar = useNotificacion();
  const [propuestas, setPropuestas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [enviando, setEnviando] = useState(false);

  const cargarDatos = async () => {
    try {
      const [pRes, sRes, uRes] = await Promise.all([
        esDesarrollador
          ? api.getProposalsByDeveloper(usuario.id)
          : api.getProposalsByClient(usuario.id),
        api.getServices(),
        api.getUsers(),
      ]);
      setPropuestas(pRes.data || []);
      setServicios(sRes.data || []);
      setUsuarios(uRes.data || []);
    } catch {
      notificar('Error al cargar datos', 'error');
    } finally { setCargando(false); }
  };

  useEffect(() => { cargarDatos(); }, []);

  const manejarCambio = (e) => setFormulario({ ...formulario, [e.target.name]: e.target.value });

  // Obtener el freelancerId automáticamente del servicio seleccionado
  const obtenerDevDelServicio = (serviceId) => {
    const servicio = servicios.find(s => s.id === parseInt(serviceId));
    return servicio ? servicio.freelancerId : 0;
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const payload = {
        serviceId: parseInt(formulario.serviceId),
        freelancerId: obtenerDevDelServicio(formulario.serviceId),
        clientId: usuario.id,
        proposedPrice: parseFloat(formulario.proposedPrice),
        estimatedHours: 1,
        message: formulario.message,
      };
      const res = await api.submitProposal(payload);
      if (res.success) {
        notificar('¡Propuesta enviada exitosamente!', 'success');
        setMostrarModal(false);
        setFormulario(FORMULARIO_INICIAL);
        cargarDatos();
      } else {
        notificar(res.message || 'Error al enviar propuesta', 'error');
      }
    } catch {
      notificar('Error de conexión con el servidor', 'error');
    } finally { setEnviando(false); }
  };

  const manejarAceptar = async (id) => {
    try {
      const res = await api.acceptProposal(id);
      if (res.success) {
        notificar(`Propuesta #${id} aceptada. Las demás fueron rechazadas.`, 'success');
        cargarDatos();
      } else {
        notificar(res.message || 'Error al aceptar', 'error');
      }
    } catch {
      notificar('Error de conexión', 'error');
    }
  };

  const obtenerNombreUsuario = (id) => usuarios.find((u) => u.id === id)?.name || `ID ${id}`;
  const obtenerTituloServicio = (id) => servicios.find((s) => s.id === id)?.title || `Servicio #${id}`;

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p className="loading-text">Cargando propuestas...</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <h1>{esDesarrollador ? 'Propuestas Recibidas' : 'Mis Propuestas'}</h1>
          <p>
            {esDesarrollador
              ? 'Propuestas que los clientes han enviado sobre tus servicios'
              : 'Propuestas que has enviado a los desarrolladores'}
          </p>
        </div>
        {esCliente && (
          <button className="btn btn-primary" onClick={() => setMostrarModal(true)}>
            <Plus size={18} /> Nueva Propuesta
          </button>
        )}
      </div>

      {propuestas.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={48} />
          <h3>No hay propuestas {esDesarrollador ? 'recibidas' : 'enviadas'}</h3>
          <p>
            {esDesarrollador
              ? 'Cuando un cliente te envíe una propuesta, aparecerá aquí.'
              : 'Explora los servicios disponibles y envía tu primera propuesta.'}
          </p>
        </div>
      ) : (
        <div className="card-grid">
          {propuestas.map((p) => {
            const estado = MAPA_ESTADOS[p.status] || MAPA_ESTADOS[0];
            return (
              <div className="card" key={p.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    PROPUESTA #{p.id}
                  </span>
                  <span className={`badge ${estado.cls}`}>{estado.etiqueta}</span>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Briefcase size={16} /> {obtenerTituloServicio(p.serviceId)}
                </h3>

                {p.message && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', gap: 6 }}>
                    <MessageSquare size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                    {p.message}
                  </p>
                )}

                <div className="proposal-meta">
                  <div className="proposal-meta-item">
                    <span>Precio propuesto</span>
                    <span className="money money-large">Bs {p.proposedPrice.toFixed(2)}</span>
                  </div>
                  <div className="proposal-meta-item">
                    <span>Comisión</span>
                    <span style={{ color: 'var(--accent-warning)' }}>Bs {p.platformFee.toFixed(2)}</span>
                  </div>
                  <div className="proposal-meta-item">
                    <span>Pago neto</span>
                    <span style={{ color: 'var(--accent-success)' }}>Bs {p.netPayout.toFixed(2)}</span>
                  </div>

                </div>

                <div style={{
                  display: 'flex', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem',
                  borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-muted)'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <User size={13} /> {esDesarrollador ? 'Cliente:' : 'Desarrollador:'} {obtenerNombreUsuario(esDesarrollador ? p.clientId : p.freelancerId)}
                  </span>
                </div>

                {/* Solo el desarrollador puede aceptar propuestas pendientes */}
                {esDesarrollador && p.status === 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: '1rem' }}>
                    <button className="btn btn-success btn-sm" onClick={() => manejarAceptar(p.id)}>
                      <Check size={14} /> Aceptar Propuesta
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para crear propuesta (solo clientes) */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Enviar Propuesta</h2>
              <button className="modal-close" onClick={() => setMostrarModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={manejarEnvio}>
              <div className="form-group">
                <label className="form-label">Selecciona el servicio</label>
                <select name="serviceId" value={formulario.serviceId} onChange={manejarCambio} className="form-select" required>
                  <option value="">-- Elige un servicio --</option>
                  {servicios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} — Bs {s.basePrice.toFixed(2)} ({obtenerNombreUsuario(s.freelancerId)})
                    </option>
                  ))}
                </select>
                {formulario.serviceId && (
                  <p style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--accent-primary-hover)' }}>
                    📌 Desarrollador asignado: <strong>{obtenerNombreUsuario(obtenerDevDelServicio(formulario.serviceId))}</strong>
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Precio propuesto (Bs)</label>
                <input type="number" name="proposedPrice" value={formulario.proposedPrice} onChange={manejarCambio}
                  className="form-input" placeholder="8400.00" step="0.01" min="1" required />
              </div>

              <div className="form-group">
                <label className="form-label">Mensaje</label>
                <textarea name="message" value={formulario.message} onChange={manejarCambio}
                  className="form-textarea" placeholder="Describe lo que necesitas, plazos, requisitos..." />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setMostrarModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={enviando}>
                  {enviando ? 'Enviando...' : <><Plus size={16} /> Enviar Propuesta</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
