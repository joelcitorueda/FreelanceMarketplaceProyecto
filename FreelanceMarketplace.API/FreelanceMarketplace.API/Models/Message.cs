using System;

namespace FreelanceMarketplace.API.Models
{
    // Modelo que representa un mensaje dentro de la conversación de una propuesta
    // Cada propuesta tiene su propio hilo de conversación entre cliente y desarrollador
    // Los mensajes son inmutables (no se editan ni eliminan) para mantener evidencia
    public class Message
    {
        public int Id { get; set; }
        public int ProposalId { get; set; }             // ID de la propuesta asociada
        public int SenderId { get; set; }               // ID del usuario que envía el mensaje
        public string SenderRole { get; set; } = string.Empty;  // "Freelancer" o "Client"
        public string Text { get; set; } = string.Empty;       // Contenido del mensaje
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;  // Timestamp
        public bool IsSystemMessage { get; set; } = false;  // true = mensaje automático del sistema
    }
}
