import { forwardRef } from 'react';
import { MessageCircle, X, User, Send } from 'lucide-react';

const PanelChat = forwardRef(function PanelChat(
  {
    chatAbierto,
    mensajes,
    cargandoMensajes,
    nuevoMensaje,
    enviandoMensaje,
    usuario,
    onCerrar,
    onChangeNuevoMensaje,
    onEnviarMensaje,
  },
  ref
) {
  if (chatAbierto === null) return null;

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="chat-panel" onClick={(e) => e.stopPropagation()}>
        <div className="chat-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MessageCircle size={18} /> Conversación — Propuesta #{chatAbierto}
          </h3>
          <button className="modal-close" onClick={onCerrar}><X size={20} /></button>
        </div>

        <div className="chat-messages" ref={ref}>
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

        <form className="chat-input-area" onSubmit={onEnviarMensaje}>
          <input
            type="text"
            value={nuevoMensaje}
            onChange={onChangeNuevoMensaje}
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
  );
});

export default PanelChat;
