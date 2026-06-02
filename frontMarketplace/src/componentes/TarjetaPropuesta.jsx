import { Briefcase, MessageSquare, User, Layers, Package, Check, XCircle, Pencil, Trash2, MessageCircle } from 'lucide-react';

const MAPA_ESTADOS = {
  0: { etiqueta: 'Pendiente', cls: 'badge-pending' },
  1: { etiqueta: 'Aceptada', cls: 'badge-accepted' },
  2: { etiqueta: 'Rechazada', cls: 'badge-rejected' },
  3: { etiqueta: 'Retirada', cls: 'badge-rejected' },
};

export default function TarjetaPropuesta({
  propuesta,
  esDesarrollador,
  esCliente,
  chatAbierto,
  onAceptar,
  onRechazar,
  onEditar,
  onEliminar,
  onAbrirChat,
  obtenerNombreUsuario,
  obtenerTituloServicio,
}) {
  const estado = MAPA_ESTADOS[propuesta.status] || MAPA_ESTADOS[0];
  const p = propuesta;

  return (
    <div className="card">
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
          <span className="money money-large">Bs {p.proposedPrice?.toFixed(2)}</span>
        </div>
        <div className="proposal-meta-item">
          <span>Comisión plataforma</span>
          <span style={{ color: 'var(--accent-warning)' }}>Bs {p.platformFee?.toFixed(2)}</span>
        </div>
        <div className="proposal-meta-item">
          <span>Pago neto al dev</span>
          <span style={{ color: 'var(--accent-success)' }}>Bs {p.netPayout?.toFixed(2)}</span>
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
          <button className="btn btn-success btn-sm" onClick={() => onAceptar(p.id)}>
            <Check size={14} /> Aceptar Propuesta
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => onRechazar(p.id)}>
            <XCircle size={14} /> Rechazar
          </button>
        </div>
      )}

      {/* Acciones del cliente: Editar o Eliminar (solo pendientes) */}
      {esCliente && p.status === 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: '1rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => onEditar(p)}>
            <Pencil size={14} /> Editar
          </button>
          <button className="btn btn-danger-outline btn-sm" onClick={() => onEliminar(p.id)}>
            <Trash2 size={14} /> Eliminar
          </button>
        </div>
      )}

      {/* Botón para abrir la conversación */}
      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onAbrirChat(p.id)}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <MessageCircle size={14} />{' '}
          {chatAbierto === p.id ? 'Cerrar conversación' : 'Ver conversación'}
        </button>
      </div>
    </div>
  );
}
