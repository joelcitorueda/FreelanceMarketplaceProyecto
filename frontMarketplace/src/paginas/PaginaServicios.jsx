import { useEffect, useState } from 'react';
import { useAuth } from '../contexto/AuthContexto';
import { useNotificacion } from '../componentes/Notificacion';
import { api } from '../servicios/api';
import { Plus, AlertCircle } from 'lucide-react';
import TarjetaServicio from '../componentes/TarjetaServicio';
import FormularioServicio from '../componentes/FormularioServicio';
import FormularioModulo from '../componentes/FormularioModulo';

export default function PaginaServicios() {
  const { usuario, esDesarrollador } = useAuth();
  const notificar = useNotificacion();
  const [servicios, setServicios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formulario, setFormulario] = useState({ title: '', description: '', basePrice: '', category: '' });
  const [enviando, setEnviando] = useState(false);
  const [editandoServicio, setEditandoServicio] = useState(null);

  const [mostrarModalModulo, setMostrarModalModulo] = useState(false);
  const [servicioSeleccionadoId, setServicioSeleccionadoId] = useState(null);
  const [formModulo, setFormModulo] = useState({ nombre: '', descripcion: '', precio: '' });
  const [enviandoModulo, setEnviandoModulo] = useState(false);
  const [modulosExpandidos, setModulosExpandidos] = useState({});

  const cargarDatos = async () => {
    try {
      const [sRes, uRes] = await Promise.all([api.getServices(), api.getUsers()]);
      setServicios(sRes.data || []);
      setUsuarios(uRes.data || []);
    } catch { /* silently fail */ }
    finally { setCargando(false); }
  };

  useEffect(() => { cargarDatos(); }, []);

  const obtenerNombreDev = (id) => usuarios.find((u) => u.id === id)?.name || `Dev #${id}`;

  const manejarCambio = (e) => setFormulario({ ...formulario, [e.target.name]: e.target.value });
  const manejarCambioModulo = (e) => setFormModulo({ ...formModulo, [e.target.name]: e.target.value });

  const cerrarModalServicio = () => {
    setMostrarModal(false);
    setEditandoServicio(null);
    setFormulario({ title: '', description: '', basePrice: '', category: '' });
  };

  const manejarPublicar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      if (editandoServicio) {
        const payload = {
          title: formulario.title,
          description: formulario.description,
          basePrice: parseFloat(formulario.basePrice),
          category: formulario.category,
          freelancerId: usuario.id,
        };
        const res = await api.updateService(editandoServicio.id, payload);
        if (res.success) {
          notificar('¡Servicio actualizado exitosamente!', 'success');
          cerrarModalServicio();
          cargarDatos();
        } else {
          notificar(res.message || 'Error al actualizar servicio', 'error');
        }
      } else {
        const payload = {
          title: formulario.title,
          description: formulario.description,
          basePrice: parseFloat(formulario.basePrice),
          category: formulario.category,
          freelancerId: usuario.id,
        };
        const res = await api.createService(payload);
        if (res.success) {
          notificar('¡Servicio publicado exitosamente!', 'success');
          cerrarModalServicio();
          cargarDatos();
        } else {
          notificar(res.message || 'Error al publicar servicio', 'error');
        }
      }
    } catch {
      notificar('Error de conexión con el servidor', 'error');
    } finally { setEnviando(false); }
  };

  const abrirEdicionServicio = (servicio) => {
    setEditandoServicio(servicio);
    setFormulario({
      title: servicio.title,
      description: servicio.description,
      basePrice: servicio.basePrice.toString(),
      category: servicio.category,
    });
    setMostrarModal(true);
  };

  const manejarEliminarServicio = async (id, titulo) => {
    if (!confirm(`¿Eliminar el servicio "${titulo}"? También se eliminarán todos sus módulos.`)) return;
    try {
      const res = await api.deleteService(id);
      if (res.success) {
        notificar(`Servicio "${titulo}" eliminado.`, 'info');
        cargarDatos();
      } else {
        notificar(res.message || 'Error al eliminar servicio', 'error');
      }
    } catch {
      notificar('Error de conexión con el servidor', 'error');
    }
  };

  const abrirModalModulo = (serviceId) => {
    setServicioSeleccionadoId(serviceId);
    setFormModulo({ nombre: '', descripcion: '', precio: '' });
    setMostrarModalModulo(true);
  };

  const cerrarModalModulo = () => {
    setMostrarModalModulo(false);
    setServicioSeleccionadoId(null);
    setFormModulo({ nombre: '', descripcion: '', precio: '' });
  };

  const manejarAgregarModulo = async (e) => {
    e.preventDefault();
    setEnviandoModulo(true);
    try {
      const payload = {
        nombre: formModulo.nombre,
        descripcion: formModulo.descripcion,
        precio: parseFloat(formModulo.precio),
        serviceId: servicioSeleccionadoId,
      };
      const res = await api.addModule(servicioSeleccionadoId, payload);
      if (res.success) {
        notificar(`¡Módulo "${formModulo.nombre}" agregado!`, 'success');
        setMostrarModalModulo(false);
        setModulosExpandidos(prev => ({ ...prev, [servicioSeleccionadoId]: true }));
        cargarDatos();
      } else {
        notificar(res.message || 'Error al agregar módulo', 'error');
      }
    } catch {
      notificar('Error de conexión con el servidor', 'error');
    } finally { setEnviandoModulo(false); }
  };

  const manejarEliminarModulo = async (moduleId, nombre) => {
    if (!confirm(`¿Eliminar el módulo "${nombre}"?`)) return;
    try {
      const res = await api.deleteModule(moduleId);
      if (res.success) {
        notificar(`Módulo "${nombre}" eliminado`, 'info');
        cargarDatos();
      }
    } catch {
      notificar('Error al eliminar el módulo', 'error');
    }
  };

  const toggleModulos = (serviceId) => {
    setModulosExpandidos(prev => ({ ...prev, [serviceId]: !prev[serviceId] }));
  };

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p className="loading-text">Cargando servicios...</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <h1>Servicios de Desarrollo</h1>
          <p>
            {esDesarrollador
              ? 'Publica y gestiona tus sistemas — agrega módulos para que los clientes compren solo lo que necesitan'
              : 'Explora los sistemas disponibles y elige el sistema completo o solo los módulos que necesitas'}
          </p>
        </div>
        {esDesarrollador && (
          <button className="btn btn-primary" onClick={() => setMostrarModal(true)}>
            <Plus size={18} /> Publicar Sistema
          </button>
        )}
      </div>

      {servicios.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={48} />
          <h3>No hay servicios publicados</h3>
          <p>{esDesarrollador ? 'Publica tu primer sistema haciendo clic en "Publicar Sistema".' : 'Aún no hay servicios disponibles.'}</p>
        </div>
      ) : (
        <div className="card-grid">
          {servicios.map((servicio) => (
            <TarjetaServicio
              key={servicio.id}
              servicio={servicio}
              esMiServicio={esDesarrollador && usuario?.id === servicio.freelancerId}
              modulosExpandidos={modulosExpandidos}
              obtenerNombreDev={obtenerNombreDev}
              onToggleModulos={toggleModulos}
              onEditar={abrirEdicionServicio}
              onEliminar={manejarEliminarServicio}
              onAgregarModulo={abrirModalModulo}
              onEliminarModulo={manejarEliminarModulo}
            />
          ))}
        </div>
      )}

      {/* Modal para publicar o editar servicio */}
      <FormularioServicio
        visible={mostrarModal}
        editandoServicio={editandoServicio}
        formulario={formulario}
        enviando={enviando}
        onCerrar={cerrarModalServicio}
        onChange={manejarCambio}
        onEnviar={manejarPublicar}
      />

      {/* Modal para agregar módulo */}
      <FormularioModulo
        visible={mostrarModalModulo}
        formModulo={formModulo}
        enviandoModulo={enviandoModulo}
        onCerrar={cerrarModalModulo}
        onChange={manejarCambioModulo}
        onEnviar={manejarAgregarModulo}
      />
    </>
  );
}
