import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexto/AuthContexto';
import { useNotificacion } from '../componentes/Notificacion';
import { useMensajes } from '../contexto/MensajesContexto';
import { api } from '../servicios/api';
import {
  Plus, Check, X, AlertCircle, Pencil, Trash2, XCircle,
  MessageSquare, User, Briefcase, Package, Layers, CheckSquare, Square,
  Send, MessageCircle, Bot, ChevronDown, ChevronUp
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
  esSistemaCompleto: true,
  modulosSeleccionados: [], // array de objetos { id, nombre, precio }
};

export default function PaginaPropuestas() {
  const { usuario, esDesarrollador, esCliente } = useAuth();
  const notificar = useNotificacion();
  const [propuestas, setPropuestas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editandoPropuesta, setEditandoPropuesta] = useState(null); // propuesta que se está editando
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [enviando, setEnviando] = useState(false);

  // Módulos del servicio seleccionado actualmente
  const [modulosServicio, setModulosServicio] = useState([]);
  const [cargandoModulos, setCargandoModulos] = useState(false);

  const { incrementarNoLeidos, limpiarNoLeidos } = useMensajes();

  // Estado para conversación/chat
  const [chatAbierto, setChatAbierto] = useState(null); // proposalId del chat abierto
  const [mensajes, setMensajes] = useState([]);
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);
  const chatRef = useRef(null);
  const ultimosMensajesCount = useRef({}); // { [proposalId]: cantidad } para detectar mensajes nuevos

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensajes]);

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

  // Cuando el cliente selecciona un servicio, carga sus módulos
  const manejarCambioServicio = async (e) => {
    const serviceId = e.target.value;
    setFormulario({
      ...formulario,
      serviceId,
      esSistemaCompleto: true,
      modulosSeleccionados: [],
      proposedPrice: '',
    });
    setModulosServicio([]);

    if (serviceId) {
      // Buscar módulos ya cargados en el servicio
      const servicioSeleccionado = servicios.find(s => s.id === parseInt(serviceId));
      if (servicioSeleccionado?.modulos?.length > 0) {
        setModulosServicio(servicioSeleccionado.modulos);
      } else {
        // Cargar desde la API si no están en el estado
        setCargandoModulos(true);
        try {
          const res = await api.getModules(serviceId);
          setModulosServicio(res.data || []);
        } catch { /* silent */ }
        finally { setCargandoModulos(false); }
      }
    }
  };

  const obtenerDevDelServicio = (serviceId) => {
    const servicio = servicios.find(s => s.id === parseInt(serviceId));
    return servicio ? servicio.freelancerId : 0;
  };

  const obtenerPrecioBase = (serviceId) => {
    const servicio = servicios.find(s => s.id === parseInt(serviceId));
    return servicio ? servicio.basePrice : 0;
  };

  // Toggle de módulo seleccionado
  const toggleModulo = (modulo) => {
    const yaSeleccionado = formulario.modulosSeleccionados.find(m => m.id === modulo.id);
    let nuevos;
    if (yaSeleccionado) {
      nuevos = formulario.modulosSeleccionados.filter(m => m.id !== modulo.id);
    } else {
      nuevos = [...formulario.modulosSeleccionados, modulo];
    }
    const totalModulos = nuevos.reduce((sum, m) => sum + m.precio, 0);
    setFormulario({
      ...formulario,
      modulosSeleccionados: nuevos,
      proposedPrice: totalModulos > 0 ? totalModulos.toFixed(2) : '',
    });
  };

  const cambiarTipoAdquisicion = (esSistemaCompleto) => {
    setFormulario({
      ...formulario,
      esSistemaCompleto,
      modulosSeleccionados: [],
      proposedPrice: esSistemaCompleto ? obtenerPrecioBase(formulario.serviceId).toFixed(2) : '',
    });
  };

  const totalModulosSeleccionados = formulario.modulosSeleccionados.reduce((sum, m) => sum + m.precio, 0);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!formulario.esSistemaCompleto && formulario.modulosSeleccionados.length === 0) {
      notificar('Debes seleccionar al menos un módulo', 'warning');
      return;
    }
    setEnviando(true);
    try {
      const modulosIds = formulario.modulosSeleccionados.map(m => m.id).join(',');
      const modulosNombres = formulario.modulosSeleccionados.map(m => m.nombre).join(', ');

      const payload = {
        serviceId: parseInt(formulario.serviceId),
        freelancerId: obtenerDevDelServicio(formulario.serviceId),
        clientId: usuario.id,
        proposedPrice: parseFloat(formulario.proposedPrice),
        estimatedHours: 1,
        message: formulario.message,
        esSistemaCompleto: formulario.esSistemaCompleto,
        modulosSeleccionadosIds: modulosIds,
        modulosSeleccionadosNombres: modulosNombres,
      };

      const res = await api.submitProposal(payload);
      if (res.success) {
        notificar('¡Propuesta enviada exitosamente!', 'success');
        setMostrarModal(false);
        setFormulario(FORMULARIO_INICIAL);
        setModulosServicio([]);
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
        notificar(`Propuesta #${id} aceptada exitosamente.`, 'success');
        cargarDatos();
      } else {
        notificar(res.message || 'Error al aceptar', 'error');
      }
    } catch {
      notificar('Error de conexión', 'error');
    }
  };

  const manejarRechazar = async (id) => {
    try {
      const res = await api.rejectProposal(id);
      if (res.success) {
        notificar(`Propuesta #${id} rechazada.`, 'info');
        cargarDatos();
      } else {
        notificar(res.message || 'Error al rechazar', 'error');
      }
    } catch {
      notificar('Error de conexión', 'error');
    }
  };

  const manejarEliminarPropuesta = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta propuesta? Esta acción no se puede deshacer.')) return;
    try {
      const res = await api.deleteProposal(id);
      if (res.success) {
        notificar('Propuesta eliminada.', 'info');
        cargarDatos();
      } else {
        notificar(res.message || 'Error al eliminar', 'error');
      }
    } catch {
      notificar('Error de conexión', 'error');
    }
  };

  // Funciones del chat
  const abrirChat = async (proposalId) => {
    setChatAbierto(proposalId);
    setCargandoMensajes(true);
    // Al abrir el chat, limpiar las notificaciones de mensajes nuevos
    limpiarNoLeidos();
    ultimosMensajesCount.current[proposalId] = 0;
    try {
      const res = await api.getMessages(proposalId);
      setMensajes(res.data || []);
      ultimosMensajesCount.current[proposalId] = (res.data || []).length;
    } catch { /* silent */ }
    finally { setCargandoMensajes(false); }
  };

  const cerrarChat = () => {
    setChatAbierto(null);
    setMensajes([]);
    setNuevoMensaje('');
  };

  const manejarEnvioMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;
    setEnviandoMensaje(true);
    try {
      const payload = {
        senderId: usuario.id,
        senderRole: esDesarrollador ? 'Freelancer' : 'Client',
        text: nuevoMensaje.trim(),
      };
      const res = await api.sendMessage(chatAbierto, payload);
      if (res.success) {
        setMensajes(prev => [...prev, res.data]);
        setNuevoMensaje('');
      } else {
        notificar(res.message || 'Error al enviar mensaje', 'error');
      }
    } catch {
      notificar('Error de conexión', 'error');
    } finally { setEnviandoMensaje(false); }
  };

  // Refrescar mensajes periódicamente cuando el chat está abierto
  useEffect(() => {
    if (chatAbierto === null) return;
    const intervalo = setInterval(async () => {
      try {
        const res = await api.getMessages(chatAbierto);
        const mensajesNuevos = res.data || [];
        const countAnterior = ultimosMensajesCount.current[chatAbierto] || 0;

        // Si hay mensajes nuevos, verificar si son de otro usuario
        if (mensajesNuevos.length > countAnterior) {
          const nuevos = mensajesNuevos.slice(countAnterior);
          const mensajesDeOtros = nuevos.filter(m => m.senderId !== usuario.id);
          if (mensajesDeOtros.length > 0) {
            incrementarNoLeidos(mensajesDeOtros.length);
          }
        }

        setMensajes(mensajesNuevos);
        ultimosMensajesCount.current[chatAbierto] = mensajesNuevos.length;
      } catch { /* silent */ }
    }, 5000); // Refrescar cada 5 segundos
    return () => clearInterval(intervalo);
  }, [chatAbierto, usuario.id, incrementarNoLeidos]);

  const abrirEdicion = async (propuesta) => {
    setEditandoPropuesta(propuesta);
    let modulosData = [];
    // Cargar módulos del servicio si los hay
    try {
      const res = await api.getModules(propuesta.serviceId);
      modulosData = res.data || [];
      setModulosServicio(modulosData);
    } catch { /* silent */ }

    setFormulario({
      serviceId: propuesta.serviceId.toString(),
      proposedPrice: propuesta.proposedPrice.toString(),
      message: propuesta.message || '',
      esSistemaCompleto: propuesta.esSistemaCompleto,
      modulosSeleccionados: propuesta.esSistemaCompleto
        ? []
        : modulosData.filter(m => propuesta.modulosSeleccionadosIds?.split(',').includes(m.id.toString())),
    });
    setMostrarModal(true);
  };

  const manejarEnvioEdicion = async (e) => {
    e.preventDefault();
    if (!editandoPropuesta) return;
    if (!formulario.esSistemaCompleto && formulario.modulosSeleccionados.length === 0) {
      notificar('Debes seleccionar al menos un módulo', 'warning');
      return;
    }
    setEnviando(true);
    try {
      const modulosIds = formulario.modulosSeleccionados.map(m => m.id).join(',');
      const modulosNombres = formulario.modulosSeleccionados.map(m => m.nombre).join(', ');

      const payload = {
        serviceId: parseInt(formulario.serviceId),
        freelancerId: editandoPropuesta.freelancerId,
        clientId: usuario.id,
        proposedPrice: parseFloat(formulario.proposedPrice),
        estimatedHours: 1,
        message: formulario.message,
        esSistemaCompleto: formulario.esSistemaCompleto,
        modulosSeleccionadosIds: modulosIds,
        modulosSeleccionadosNombres: modulosNombres,
      };

      const res = await api.updateProposal(editandoPropuesta.id, payload);
      if (res.success) {
        notificar('¡Propuesta actualizada exitosamente!', 'success');
        cerrarModal();
        cargarDatos();
      } else {
        notificar(res.message || 'Error al actualizar propuesta', 'error');
      }
    } catch {
      notificar('Error de conexión con el servidor', 'error');
    } finally { setEnviando(false); }
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setEditandoPropuesta(null);
    setFormulario(FORMULARIO_INICIAL);
    setModulosServicio([]);
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
              : 'Propuestas que has enviado — sistema completo o módulos individuales'}
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

                {/* Badge de tipo de adquisición */}
                <div style={{ marginBottom: '0.75rem' }}>
                  {p.esSistemaCompleto ? (
                    <span className="badge" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontSize: '0.72rem' }}>
                      <Layers size={11} style={{ marginRight: 4 }} /> Sistema Completo
                    </span>
                  ) : (
                    <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: '0.72rem' }}>
                      <Package size={11} style={{ marginRight: 4 }} /> Módulos: {p.modulosSeleccionadosNombres || 'seleccionados'}
                    </span>
                  )}
                </div>

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
                    <span>Comisión plataforma</span>
                    <span style={{ color: 'var(--accent-warning)' }}>Bs {p.platformFee.toFixed(2)}</span>
                  </div>
                  <div className="proposal-meta-item">
                    <span>Pago neto al dev</span>
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

                {/* Acciones del desarrollador: Aceptar o Rechazar (solo pendientes) */}
                {esDesarrollador && p.status === 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: '1rem' }}>
                    <button className="btn btn-success btn-sm" onClick={() => manejarAceptar(p.id)}>
                      <Check size={14} /> Aceptar Propuesta
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => manejarRechazar(p.id)}>
                      <XCircle size={14} /> Rechazar
                    </button>
                  </div>
                )}

                {/* Acciones del cliente: Editar o Eliminar (solo pendientes) */}
                {esCliente && p.status === 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: '1rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => abrirEdicion(p)}>
                      <Pencil size={14} /> Editar
                    </button>
                    <button className="btn btn-danger-outline btn-sm" onClick={() => manejarEliminarPropuesta(p.id)}>
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                )}

                {/* Botón para abrir la conversación — visible para ambos roles y cualquier estado */}
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => abrirChat(p.id)}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <MessageCircle size={14} />{' '}
                    {chatAbierto === p.id ? 'Cerrar conversación' : 'Ver conversación'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Panel de conversación / Chat */}
      {chatAbierto !== null && (
        <div className="modal-overlay" onClick={cerrarChat}>
          <div className="chat-panel" onClick={(e) => e.stopPropagation()}>
            <div className="chat-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MessageCircle size={18} /> Conversación — Propuesta #{chatAbierto}
              </h3>
              <button className="modal-close" onClick={cerrarChat}><X size={20} /></button>
            </div>

            <div className="chat-messages" ref={chatRef}>
              {cargandoMensajes ? (
                <div className="loading-container" style={{ padding: '2rem 0' }}>
                  <div className="spinner" />
                  <p className="loading-text">Cargando mensajes...</p>
                </div>
              ) : mensajes.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem 0' }}>
                  <MessageCircle size={36} />
                  <h3 style={{ fontSize: '0.95rem' }}>Sin mensajes aún</h3>
                  <p style={{ fontSize: '0.8rem' }}>Envía el primer mensaje para iniciar la conversación.</p>
                </div>
              ) : (
                mensajes.map((msg) => {
                  const esMio = msg.senderId === usuario.id;
                  const esSistema = msg.isSystemMessage;
                  return (
                    <div
                      key={msg.id}
                      className={`chat-bubble ${esSistema ? 'chat-system' : esMio ? 'chat-mine' : 'chat-theirs'}`}
                    >
                      {!esSistema && (
                        <div className="chat-bubble-sender">
                          <User size={12} /> {esMio ? 'Tú' : msg.senderRole === 'Freelancer' ? 'Desarrollador' : 'Cliente'}
                        </div>
                      )}
                      <div className="chat-bubble-text">{msg.text}</div>
                      <div className="chat-bubble-time">
                        {new Date(msg.createdAt).toLocaleString('es-BO', {
                          hour: '2-digit', minute: '2-digit',
                          day: '2-digit', month: '2-digit'
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form className="chat-input-area" onSubmit={manejarEnvioMensaje}>
              <input
                type="text"
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                className="chat-input"
                placeholder="Escribe tu mensaje..."
                disabled={enviandoMensaje}
                autoFocus
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={!nuevoMensaje.trim() || enviandoMensaje}
                style={{ padding: '10px 16px' }}
              >
                {enviandoMensaje ? '...' : <Send size={16} />}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal para crear o editar propuesta (solo clientes) */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2>{editandoPropuesta ? 'Editar Propuesta' : 'Nueva Propuesta'}</h2>
              <button className="modal-close" onClick={cerrarModal}><X size={20} /></button>
            </div>

            <form onSubmit={editandoPropuesta ? manejarEnvioEdicion : manejarEnvio}>
              {/* 1. Selección del servicio */}
              <div className="form-group">
                <label className="form-label">Selecciona el sistema</label>
                <select name="serviceId" value={formulario.serviceId} onChange={manejarCambioServicio} className="form-select" required>
                  <option value="">-- Elige un sistema --</option>
                  {servicios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} — Bs {s.basePrice.toFixed(2)} ({obtenerNombreUsuario(s.freelancerId)})
                    </option>
                  ))}
                </select>
                {formulario.serviceId && (
                  <p style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--accent-primary-hover)' }}>
                    📌 Desarrollador: <strong>{obtenerNombreUsuario(obtenerDevDelServicio(formulario.serviceId))}</strong>
                  </p>
                )}
              </div>

              {/* 2. Tipo de adquisición (solo si hay servicio seleccionado) */}
              {formulario.serviceId && (
                <div className="form-group">
                  <label className="form-label">¿Qué deseas adquirir?</label>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => cambiarTipoAdquisicion(true)}
                      style={{
                        flex: 1, padding: '0.75rem', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
                        border: formulario.esSistemaCompleto ? '2px solid var(--primary)' : '2px solid var(--border)',
                        background: formulario.esSistemaCompleto ? 'rgba(99,102,241,0.1)' : 'var(--surface)',
                        color: formulario.esSistemaCompleto ? 'var(--primary)' : 'var(--text-secondary)',
                      }}
                    >
                      <Layers size={20} style={{ marginBottom: 4 }} />
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Sistema Completo</div>
                      <div style={{ fontSize: '0.75rem', marginTop: 2 }}>Bs {obtenerPrecioBase(formulario.serviceId).toFixed(2)}</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => cambiarTipoAdquisicion(false)}
                      disabled={modulosServicio.length === 0 && !cargandoModulos}
                      style={{
                        flex: 1, padding: '0.75rem', borderRadius: 10, cursor: modulosServicio.length > 0 ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
                        border: !formulario.esSistemaCompleto ? '2px solid var(--success)' : '2px solid var(--border)',
                        background: !formulario.esSistemaCompleto ? 'rgba(16,185,129,0.1)' : 'var(--surface)',
                        color: !formulario.esSistemaCompleto ? 'var(--success)' : 'var(--text-secondary)',
                        opacity: modulosServicio.length === 0 && !cargandoModulos ? 0.5 : 1,
                      }}
                    >
                      <Package size={20} style={{ marginBottom: 4 }} />
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Módulos Individuales</div>
                      <div style={{ fontSize: '0.75rem', marginTop: 2 }}>
                        {cargandoModulos ? 'Cargando...' : modulosServicio.length > 0 ? `${modulosServicio.length} disponibles` : 'Sin módulos'}
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* 3. Lista de módulos para seleccionar (cuando eligió módulos individuales) */}
              {formulario.serviceId && !formulario.esSistemaCompleto && modulosServicio.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Selecciona los módulos que necesitas</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {modulosServicio.map((mod) => {
                      const seleccionado = formulario.modulosSeleccionados.find(m => m.id === mod.id);
                      return (
                        <div
                          key={mod.id}
                          onClick={() => toggleModulo(mod)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.65rem 0.85rem', borderRadius: 10, cursor: 'pointer',
                            border: seleccionado ? '2px solid var(--success)' : '2px solid var(--border)',
                            background: seleccionado ? 'rgba(16,185,129,0.08)' : 'var(--surface)',
                            transition: 'all 0.15s',
                          }}
                        >
                          {seleccionado ? (
                            <CheckSquare size={18} color="var(--success)" />
                          ) : (
                            <Square size={18} color="var(--text-muted)" />
                          )}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{mod.nombre}</div>
                            {mod.descripcion && (
                              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{mod.descripcion}</div>
                            )}
                          </div>
                          <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                            Bs {mod.precio.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Subtotal de módulos */}
                  {formulario.modulosSeleccionados.length > 0 && (
                    <div style={{
                      marginTop: '0.75rem', padding: '0.65rem 0.85rem', borderRadius: 10,
                      background: 'rgba(16,185,129,0.1)', border: '1px solid var(--success)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        {formulario.modulosSeleccionados.length} módulo(s) seleccionado(s)
                      </span>
                      <span style={{ fontWeight: 800, color: 'var(--success)', fontSize: '1rem' }}>
                        Total: Bs {totalModulosSeleccionados.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* 4. Precio propuesto */}
              <div className="form-group">
                <label className="form-label">Precio propuesto (Bs)</label>
                <input type="number" name="proposedPrice" value={formulario.proposedPrice} onChange={manejarCambio}
                  className="form-input" placeholder="0.00" step="0.01" min="1" required />
                {formulario.serviceId && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {formulario.esSistemaCompleto
                      ? `Precio del sistema completo: Bs ${obtenerPrecioBase(formulario.serviceId).toFixed(2)}. Puedes proponer un precio diferente.`
                      : `Total módulos seleccionados: Bs ${totalModulosSeleccionados.toFixed(2)}. El precio se calcula automáticamente.`}
                  </p>
                )}
              </div>

              {/* 5. Mensaje */}
              <div className="form-group">
                <label className="form-label">Mensaje al desarrollador</label>
                <textarea name="message" value={formulario.message} onChange={manejarCambio}
                  className="form-textarea" placeholder="Describe lo que necesitas, plazos, requisitos específicos..." />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={cerrarModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={enviando}>
                  {enviando ? 'Guardando...' : editandoPropuesta ? <><Pencil size={16} /> Guardar Cambios</> : <><Plus size={16} /> Enviar Propuesta</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
