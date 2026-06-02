import { X, Plus, Pencil } from 'lucide-react';

export default function FormularioServicio({
  visible,
  editandoServicio,
  formulario,
  enviando,
  onCerrar,
  onChange,
  onEnviar,
}) {
  if (!visible) return null;

  const esEdicion = editandoServicio !== null;

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{esEdicion ? 'Editar Sistema' : 'Publicar Nuevo Sistema'}</h2>
          <button className="modal-close" onClick={onCerrar}><X size={20} /></button>
        </div>
        <form onSubmit={onEnviar}>
          <div className="form-group">
            <label className="form-label">Nombre del sistema</label>
            <input type="text" name="title" value={formulario.title} onChange={onChange}
              className="form-input" placeholder="Ej: Sistema ERP Empresarial" required />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción detallada</label>
            <textarea name="description" value={formulario.description} onChange={onChange}
              className="form-textarea" placeholder="Describe tu sistema, tecnologías, qué incluye..." required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Precio sistema completo (Bs)</label>
              <input type="number" name="basePrice" value={formulario.basePrice} onChange={onChange}
                className="form-input" placeholder="10000.00" step="0.01" min="1" required />
            </div>
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select name="category" value={formulario.category} onChange={onChange} className="form-select" required>
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
          {!esEdicion && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              💡 Después de publicar podrás agregar los módulos de tu sistema para que los clientes compren solo lo que necesitan.
            </p>
          )}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onCerrar}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={enviando}>
              {enviando ? 'Guardando...' : esEdicion ? <><Pencil size={16} /> Guardar Cambios</> : <><Plus size={16} /> Publicar Sistema</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
