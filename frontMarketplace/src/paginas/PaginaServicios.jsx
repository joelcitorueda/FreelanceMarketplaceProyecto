import { useEffect, useState } from 'react';
import { useAuth } from '../contexto/AuthContexto';
import { useNotificacion } from '../componentes/Notificacion';
import { api } from '../servicios/api';
import { Tag, User, AlertCircle, Plus, X } from 'lucide-react';

export default function PaginaServicios() {
  const { usuario, esDesarrollador } = useAuth();
  const notificar = useNotificacion();
  const [servicios, setServicios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formulario, setFormulario] = useState({ title: '', description: '', basePrice: '', category: '' });
  const [enviando, setEnviando] = useState(false);

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

  const manejarPublicar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const payload = {
        title: formulario.title,
        description: formulario.description,
        basePrice: parseFloat(formulario.basePrice),
        category: formulario.category,
        freelancerId: usuario.id, // Se asigna automáticamente el desarrollador logueado
      };
      const res = await api.createService(payload);
      if (res.success) {
        notificar('¡Servicio publicado exitosamente!', 'success');
        setMostrarModal(false);
        setFormulario({ title: '', description: '', basePrice: '', category: '' });
        cargarDatos();
      } else {
        notificar(res.message || 'Error al publicar servicio', 'error');
      }
    } catch {
      notificar('Error de conexión con el servidor', 'error');
    } finally { setEnviando(false); }
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
              ? 'Publica y gestiona tus servicios profesionales'
              : 'Explora los servicios disponibles y envía propuestas'}
          </p>
        </div>
        {esDesarrollador && (
          <button className="btn btn-primary" onClick={() => setMostrarModal(true)}>
            <Plus size={18} /> Publicar Servicio
          </button>
        )}
      </div>

      {servicios.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={48} />
          <h3>No hay servicios publicados</h3>
          <p>{esDesarrollador ? 'Publica tu primer servicio haciendo clic en "Publicar Servicio".' : 'Aún no hay servicios disponibles.'}</p>
        </div>
      ) : (
        <div className="card-grid">
          {servicios.map((servicio) => (
            <div className="card" key={servicio.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <span className="badge badge-category"><Tag size={12} /> {servicio.category}</span>
                <span className="money money-large">Bs {servicio.basePrice.toFixed(2)}</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{servicio.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.6 }}>{servicio.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                <User size={14} />
                <span>{obtenerNombreDev(servicio.freelancerId)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para publicar nuevo servicio */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Publicar Nuevo Servicio</h2>
              <button className="modal-close" onClick={() => setMostrarModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={manejarPublicar}>
              <div className="form-group">
                <label className="form-label">Título del servicio</label>
                <input type="text" name="title" value={formulario.title} onChange={manejarCambio}
                  className="form-input" placeholder="Ej: Desarrollo de App Móvil" required />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción detallada</label>
                <textarea name="description" value={formulario.description} onChange={manejarCambio}
                  className="form-textarea" placeholder="Describe tu servicio, tecnologías, qué incluye..." required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Precio base (Bs)</label>
                  <input type="number" name="basePrice" value={formulario.basePrice} onChange={manejarCambio}
                    className="form-input" placeholder="5000.00" step="0.01" min="1" required />
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
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setMostrarModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={enviando}>
                  {enviando ? 'Publicando...' : <><Plus size={16} /> Publicar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
