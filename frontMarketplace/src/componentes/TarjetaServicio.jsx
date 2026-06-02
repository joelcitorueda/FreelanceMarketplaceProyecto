import { Tag, User, Layers, Package, Plus, ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';

export default function TarjetaServicio({
  servicio,
  esMiServicio,
  modulosExpandidos,
  obtenerNombreDev,
  onToggleModulos,
  onEditar,
  onEliminar,
  onAgregarModulo,
  onEliminarModulo,
}) {
  const modulosAbiertos = modulosExpandidos?.[servicio.id];
  const tieneModulos = servicio.modulos && servicio.modulos.length > 0;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Cabecera: categoría y precio */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
        <span className="badge badge-category"><Tag size={12} /> {servicio.category}</span>
        <div style={{ textAlign: 'right' }}>
          <span className="money money-large">Bs {servicio.basePrice?.toFixed(2)}</span>
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
          <button className="btn btn-ghost btn-sm" onClick={() => onEditar(servicio)}>
            <Pencil size={13} /> Editar
          </button>
          <button className="btn btn-danger-outline btn-sm" onClick={() => onEliminar(servicio.id, servicio.title)}>
            <Trash2 size={13} /> Eliminar
          </button>
        </div>
      )}

      {/* Sección de módulos */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => onToggleModulos(servicio.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
              cursor: 'pointer', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, padding: 0
            }}
          >
            <Layers size={15} />
            {tieneModulos ? `${servicio.modulos.length} Módulos` : 'Sin módulos'}
            {tieneModulos && (modulosAbiertos ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
          </button>

          {esMiServicio && (
            <button
              className="btn btn-ghost"
              onClick={() => onAgregarModulo(servicio.id)}
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
                    Bs {mod.precio?.toFixed(2)}
                  </span>
                  {esMiServicio && (
                    <button
                      onClick={() => onEliminarModulo(mod.id, mod.nombre)}
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

        {modulosAbiertos && !tieneModulos && esMiServicio && (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Agrega módulos para que los clientes puedan adquirir partes del sistema.
          </p>
        )}
      </div>
    </div>
  );
}
