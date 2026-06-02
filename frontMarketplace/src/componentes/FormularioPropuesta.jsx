import { X, Plus, Pencil, Layers, Package, CheckSquare, Square } from 'lucide-react';

export default function FormularioPropuesta({
  visible,
  editandoPropuesta,
  formulario,
  modulosServicio,
  cargandoModulos,
  servicios,
  enviando,
  totalModulosSeleccionados,
  onCerrar,
  onChange,
  onChangeServicio,
  onToggleModulo,
  onChangeTipoAdquisicion,
  onEnviar,
  onEnviarEdicion,
  obtenerNombreUsuario,
  obtenerPrecioBase,
  obtenerDevDelServicio,
}) {
  if (!visible) return null;

  const esEdicion = editandoPropuesta !== null;
  const handleSubmit = esEdicion ? onEnviarEdicion : onEnviar;

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h2>{esEdicion ? 'Editar Propuesta' : 'Nueva Propuesta'}</h2>
          <button className="modal-close" onClick={onCerrar}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 1. Selección del servicio */}
          <div className="form-group">
            <label className="form-label">Selecciona el sistema</label>
            <select name="serviceId" value={formulario.serviceId} onChange={onChangeServicio} className="form-select" required>
              <option value="">-- Elige un sistema --</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} — Bs {s.basePrice?.toFixed(2)} ({obtenerNombreUsuario(s.freelancerId)})
                </option>
              ))}
            </select>
            {formulario.serviceId && (
              <p style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--accent-primary-hover)' }}>
                📌 Desarrollador: <strong>{obtenerNombreUsuario(obtenerDevDelServicio(formulario.serviceId))}</strong>
              </p>
            )}
          </div>

          {/* 2. Tipo de adquisición */}
          {formulario.serviceId && (
            <div className="form-group">
              <label className="form-label">¿Qué deseas adquirir?</label>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => onChangeTipoAdquisicion(true)}
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
                  onClick={() => onChangeTipoAdquisicion(false)}
                  disabled={modulosServicio.length === 0 && !cargandoModulos}
                  style={{
                    flex: 1, padding: '0.75rem', borderRadius: 10, cursor: modulosServicio.length > 0 ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
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

          {/* 3. Lista de módulos para seleccionar */}
          {formulario.serviceId && !formulario.esSistemaCompleto && modulosServicio.length > 0 && (
            <div className="form-group">
              <label className="form-label">Selecciona los módulos que necesitas</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {modulosServicio.map((mod) => {
                  const seleccionado = formulario.modulosSeleccionados?.find(m => m.id === mod.id);
                  return (
                    <div
                      key={mod.id}
                      onClick={() => onToggleModulo(mod)}
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
                        Bs {mod.precio?.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {formulario.modulosSeleccionados?.length > 0 && (
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
            <input type="number" name="proposedPrice" value={formulario.proposedPrice} onChange={onChange}
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
            <textarea name="message" value={formulario.message} onChange={onChange}
              className="form-textarea" placeholder="Describe lo que necesitas, plazos, requisitos específicos..." />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onCerrar}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={enviando}>
              {enviando ? 'Guardando...' : esEdicion ? <><Pencil size={16} /> Guardar Cambios</> : <><Plus size={16} /> Enviar Propuesta</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
