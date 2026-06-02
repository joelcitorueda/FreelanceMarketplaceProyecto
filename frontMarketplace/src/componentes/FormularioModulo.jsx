import { X, Plus, Package } from 'lucide-react';

export default function FormularioModulo({
  visible,
  formModulo,
  enviandoModulo,
  onCerrar,
  onChange,
  onEnviar,
}) {
  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2><Package size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />Agregar Módulo</h2>
          <button className="modal-close" onClick={onCerrar}><X size={20} /></button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Define un módulo funcional de tu sistema. Los clientes podrán adquirirlo de forma independiente.
        </p>
        <form onSubmit={onEnviar}>
          <div className="form-group">
            <label className="form-label">Nombre del módulo</label>
            <input type="text" name="nombre" value={formModulo.nombre} onChange={onChange}
              className="form-input" placeholder="Ej: Gestión de Inventario" required />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción del módulo</label>
            <textarea name="descripcion" value={formModulo.descripcion} onChange={onChange}
              className="form-textarea" rows={3}
              placeholder="Qué funcionalidades incluye este módulo..." />
          </div>
          <div className="form-group">
            <label className="form-label">Precio individual (Bs)</label>
            <input type="number" name="precio" value={formModulo.precio} onChange={onChange}
              className="form-input" placeholder="1500.00" step="0.01" min="1" required />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onCerrar}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={enviandoModulo}>
              {enviandoModulo ? 'Agregando...' : <><Plus size={16} /> Agregar Módulo</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
