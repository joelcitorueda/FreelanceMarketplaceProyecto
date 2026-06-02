import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexto/AuthContexto';
import { useNotificacion } from '../componentes/Notificacion';
import { useMensajes } from '../contexto/MensajesContexto';
import { api } from '../servicios/api';
import { Plus, AlertCircle } from 'lucide-react';
import TarjetaPropuesta from '../componentes/TarjetaPropuesta';
import FormularioPropuesta from '../componentes/FormularioPropuesta';
import PanelChat from '../componentes/PanelChat';

const FORMULARIO_INICIAL = {
  serviceId: '',
  proposedPrice: '',
  message: '',
  esSistemaCompleto: true,
  modulosSeleccionados: [],
};

export default function PaginaPropuestas() {
  const { usuario, esDesarrollador, esCliente } = useAuth();
  const notificar = useNotificacion();
  const [propuestas, setPropuestas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editandoPropuesta, setEditandoPropuesta] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [enviando, setEnviando] = useState(false);

  const [modulosServicio, setModulosServicio] = useState([]);
  const [cargandoModulos, setCargandoModulos] = useState(false);

  const { incrementarNoLeidos, limpiarNoLeidos } = useMensajes();

  const [chatAbierto, setChatAbierto] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);
  const chatRef = useRef(null);
  const ultimosMensajesCount = useRef({});

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
      const servicioSeleccionado = servicios.find(s => s.id === parseInt(serviceId));
      if (servicioSeleccionado?.modulos?.length > 0) {
        setModulosServicio(servicioSeleccionado.modulos);
      } else {
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
        cerrarModal();
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

  const abrirChat = async (proposalId) => {
    setChatAbierto(proposalId);
    setCargandoMensajes(true);
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

  useEffect(() => {
    if (chatAbierto === null) return;
    const intervalo = setInterval(async () => {
      try {
        const res = await api.getMessages(chatAbierto);
        const mensajesNuevos = res.data || [];
        const countAnterior = ultimosMensajesCount.current[chatAbierto] || 0;
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
    }, 5000);
    return () => clearInterval(intervalo);
  }, [chatAbierto, usuario.id, incrementarNoLeidos]);

  const abrirEdicion = async (propuesta) => {
    setEditandoPropuesta(propuesta);
    let modulosData = [];
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
          {propuestas.map((p) => (
            <TarjetaPropuesta
              key={p.id}
              propuesta={p}
              esDesarrollador={esDesarrollador}
              esCliente={esCliente}
              chatAbierto={chatAbierto}
              onAceptar={manejarAceptar}
              onRechazar={manejarRechazar}
              onEditar={abrirEdicion}
              onEliminar={manejarEliminarPropuesta}
              onAbrirChat={abrirChat}
              obtenerNombreUsuario={obtenerNombreUsuario}
              obtenerTituloServicio={obtenerTituloServicio}
            />
          ))}
        </div>
      )}

      {/* Panel de conversación / Chat */}
      <PanelChat
        ref={chatRef}
        chatAbierto={chatAbierto}
        mensajes={mensajes}
        cargandoMensajes={cargandoMensajes}
        nuevoMensaje={nuevoMensaje}
        enviandoMensaje={enviandoMensaje}
        usuario={usuario}
        onCerrar={cerrarChat}
        onChangeNuevoMensaje={(e) => setNuevoMensaje(e.target.value)}
        onEnviarMensaje={manejarEnvioMensaje}
      />

      {/* Modal para crear o editar propuesta */}
      <FormularioPropuesta
        visible={mostrarModal}
        editandoPropuesta={editandoPropuesta}
        formulario={formulario}
        modulosServicio={modulosServicio}
        cargandoModulos={cargandoModulos}
        servicios={servicios}
        enviando={enviando}
        totalModulosSeleccionados={totalModulosSeleccionados}
        onCerrar={cerrarModal}
        onChange={manejarCambio}
        onChangeServicio={manejarCambioServicio}
        onToggleModulo={toggleModulo}
        onChangeTipoAdquisicion={cambiarTipoAdquisicion}
        onEnviar={manejarEnvio}
        onEnviarEdicion={manejarEnvioEdicion}
        obtenerNombreUsuario={obtenerNombreUsuario}
        obtenerPrecioBase={obtenerPrecioBase}
        obtenerDevDelServicio={obtenerDevDelServicio}
      />
    </>
  );
}
