using FreelanceMarketplace.API.Models;
using FreelanceMarketplace.API.Services;

namespace FreelanceMarketplace.API.Patrones.Mediator
{
    // Patrón Mediator (GoF Comportamental)
    // Centraliza la comunicación entre propuestas y mensajes sin acoplar ProposalService a la lógica de mensajería.
    // Participantes: IGestorConversacion (Mediator), GestorConversacion (ConcreteMediator)

    public interface IGestorConversacion
    {
        Task<Message> EnviarMensajeAsync(int proposalId, int senderId, string senderRole, string texto);
        Task<IEnumerable<Message>> ObtenerMensajesAsync(int proposalId);
        Task<Message> RegistrarEventoAsync(int proposalId, string descripcion);
    }

    /// <summary>
    /// ConcreteMediator: coordina el envío de mensajes y eventos del sistema
    /// entre los participantes de una propuesta
    /// </summary>
    public class GestorConversacion : IGestorConversacion
    {
        private readonly IGenericRepository<Message> _messageRepository;

        public GestorConversacion(IGenericRepository<Message> messageRepository)
        {
            _messageRepository = messageRepository;
        }

        /// <summary>
        /// Envía un mensaje de un usuario (cliente o desarrollador) a la conversación
        /// </summary>
        public async Task<Message> EnviarMensajeAsync(int proposalId, int senderId, string senderRole, string texto)
        {
            if (string.IsNullOrWhiteSpace(texto))
                throw new ArgumentException("El mensaje no puede estar vacío.");

            var mensaje = new Message
            {
                ProposalId = proposalId,
                SenderId = senderId,
                SenderRole = senderRole,
                Text = texto.Trim(),
                CreatedAt = DateTime.UtcNow,
                IsSystemMessage = false
            };

            await _messageRepository.AddAsync(mensaje);
            return mensaje;
        }

        /// <summary>
        /// Obtiene todos los mensajes de una propuesta ordenados cronológicamente
        /// </summary>
        public async Task<IEnumerable<Message>> ObtenerMensajesAsync(int proposalId)
        {
            var todos = await _messageRepository.GetAllAsync();
            return todos
                .Where(m => m.ProposalId == proposalId)
                .OrderBy(m => m.CreatedAt);
        }

        /// <summary>
        /// Registra un mensaje automático del sistema (ej: "Precio actualizado", "Propuesta aceptada")
        /// Esto queda como evidencia en la conversación
        /// </summary>
        public async Task<Message> RegistrarEventoAsync(int proposalId, string descripcion)
        {
            var mensaje = new Message
            {
                ProposalId = proposalId,
                SenderId = 0,
                SenderRole = "Sistema",
                Text = descripcion,
                CreatedAt = DateTime.UtcNow,
                IsSystemMessage = true
            };

            await _messageRepository.AddAsync(mensaje);
            return mensaje;
        }
    }
}
