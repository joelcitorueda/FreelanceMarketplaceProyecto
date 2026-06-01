import { useEffect, useState } from 'react';
import { useAuth } from '../contexto/AuthContexto';
import { useNotificacion } from '../componentes/Notificacion';
import { api } from '../servicios/api';
import { Tag, User, AlertCircle, Plus, X, Package, Trash2, ChevronDown, ChevronUp, Layers, Pencil } from 'lucide-react';

export default function PaginaServicios() {
  const { usuario, esDesarrollador } = useAuth();
  const notificar = useNotificacion();
  const [servicios, setServicios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formulario, setFormulario] = useState({ title: '', description: '', basePrice: '', category: '' });
  const [enviando, setEnviando] = useState(false);
  const [editandoServicio, setEditandoServicio] = useState(null); // servicio que se está editando

  // Estados para gestión de módulos
  const [servicioConModulos, setServicioConModulos] = useState(null); // ID del servicio con módulos abierto
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
        // Actualizar servicio existente
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
        // Crear nuevo servicio
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
        // Expandir automáticamente los módulos del servicio
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
          {servicios.map((servicio) => {
            const modulosAbiertos = modulosExpandidos[servicio.id];
            const tieneModulos = servicio.modulos && servicio.modulos.length > 0;
            const esMiServicio = esDesarrollador && usuario?.id === servicio.freelancerId;

            return (
              <div className="card" key={servicio.id} style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Cabecera: categoría y precio */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <span className="badge badge-category"><Tag size={12} /> {servicio.category}</span>
                  <div style={{ textAlign: 'right' }}>
                    <span className="money money-large">Bs {servicio.basePrice.toFixed(2)}</span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>sistema completo</div>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{servicio.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.6, flex: 1 }}>
                  {servicio.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  <User size={14} />
                  <span>{obtenerNombreDev(servicio.freelancerId)}</span>
                </div>

                {/* Botones de acción para el desarrollador dueño */}
                {esMiServicio && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => abrirEdicionServicio(servicio)}>
                      <Pencil size={13} /> Editar
                    </button>
                    <button className="btn btn-danger-outline btn-sm" onClick={() => manejarEliminarServicio(servicio.id, servicio.title)}>
                      <Trash2 size={13} /> Eliminar
                    </button>
                  </div>
                )}

                {/* Sección de módulos */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={() => toggleModulos(servicio.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, padding: 0 }}
                    >
                      <Layers size={15} />
                      {tieneModulos ? `${servicio.modulos.length} Módulos` : 'Sin módulos'}
                      {tieneModulos && (modulosAbiertos ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </button>

                    {/* Botón para agregar módulo (solo el dueño del servicio) */}
                    {esMiServicio && (
                      <button
                        className="btn btn-ghost"
                        onClick={() => abrirModalModulo(servicio.id)}
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Plus size={13} /> Módulo
                      </button>
                    )}
                  </div>

                  {/* Lista de módulos expandible */}
                  {modulosAbiertos && tieneModulos && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {servicio.modulos.map((mod) => (
                        <div key={mod.id} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          background: 'var(--surface-elevated)', borderRadius: 8, padding: '0.5rem 0.75rem',
                          border: '1px solid var(--border)'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                              <Package size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                              {mod.nombre}
                            </div>
                            {mod.descripcion && (
                              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                {mod.descripcion}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 12 }}>
                            <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                              Bs {mod.precio.toFixed(2)}
                            </span>
                            {esMiServicio && (
                              <button
                                onClick={() => manejarEliminarModulo(mod.id, mod.nombre)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 2 }}
                                title="Eliminar módulo"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Mensaje si no hay módulos */}
                  {modulosAbiertos && !tieneModulos && esMiServicio && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      Agrega módulos para que los clientes puedan adquirir partes del sistema.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para publicar o editar servicio */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={cerrarModalServicio}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editandoServicio ? 'Editar Sistema' : 'Publicar Nuevo Sistema'}</h2>
              <button className="modal-close" onClick={cerrarModalServicio}><X size={20} /></button>
            </div>
            <form onSubmit={manejarPublicar}>
              <div className="form-group">
                <label className="form-label">Nombre del sistema</label>
                <input type="text" name="title" value={formulario.title} onChange={manejarCambio}
                  className="form-input" placeholder="Ej: Sistema ERP Empresarial" required />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción detallada</label>
                <textarea name="description" value={formulario.description} onChange={manejarCambio}
                  className="form-textarea" placeholder="Describe tu sistema, tecnologías, qué incluye..." required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Precio sistema completo (Bs)</label>
                  <input type="number" name="basePrice" value={formulario.basePrice} onChange={manejarCambio}
                    className="form-input" placeholder="10000.00" step="0.01" min="1" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Categoría</label>
                  <select name="category" value={formulario.category} onChange={manejarCambio} className="form-select" required>
                    <option value="">Selecciona categoría</option>
                    <option value="Sistema Web">Sistema Web</option>
                    <option value="Aplicación Móvil">Aplicación Móvil</option>
                    <option value="Sistema de Gestión (ERP)">Sistema de Gestión (ERP)</option>
                    <option value="E-Commerce / Tienda Online">E-Commerce / Tienda Online</option>
                    <option value="Sistema de Inventario">Sistema de Inventario</option>
                    <option value="API / Backend">API / Backend</option>
                    <option value="Landing Page / Sitio Web">Landing Page / Sitio Web</option>
                    <option value="Bot / Automatización">Bot / Automatización</option>
                    <option value="Base de Datos">Base de Datos</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>
              {!editandoServicio && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  💡 Después de publicar podrás agregar los módulos de tu sistema para que los clientes compren solo lo que necesitan.
                </p>
              )}
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={cerrarModalServicio}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={enviando}>
                  {enviando ? 'Guardando...' : editandoServicio ? <><Pencil size={16} /> Guardar Cambios</> : <><Plus size={16} /> Publicar Sistema</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para agregar módulo */}
      {mostrarModalModulo && (
        <div className="modal-overlay" onClick={() => setMostrarModalModulo(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2><Package size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />Agregar Módulo</h2>
              <button className="modal-close" onClick={() => setMostrarModalModulo(false)}><X size={20} /></button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Define un módulo funcional de tu sistema. Los clientes podrán adquirirlo de forma independiente.
            </p>
            <form onSubmit={manejarAgregarModulo}>
              <div className="form-group">
                <label className="form-label">Nombre del módulo</label>
                <input type="text" name="nombre" value={formModulo.nombre} onChange={manejarCambioModulo}
                  className="form-input" placeholder="Ej: Gestión de Inventario" required />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción del módulo</label>
                <textarea name="descripcion" value={formModulo.descripcion} onChange={manejarCambioModulo}
                  className="form-textarea" rows={3}
                  placeholder="Qué funcionalidades incluye este módulo..." />
              </div>
              <div className="form-group">
                <label className="form-label">Precio individual (Bs)</label>
                <input type="number" name="precio" value={formModulo.precio} onChange={manejarCambioModulo}
                  className="form-input" placeholder="1500.00" step="0.01" min="1" required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setMostrarModalModulo(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={enviandoModulo}>
                  {enviandoModulo ? 'Agregando...' : <><Plus size={16} /> Agregar Módulo</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
