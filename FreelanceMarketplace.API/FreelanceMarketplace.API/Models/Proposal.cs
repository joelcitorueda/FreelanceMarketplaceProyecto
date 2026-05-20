using System;

namespace FreelanceMarketplace.API.Models
{
    // Enum que define los estados posibles de una propuesta
    public enum ProposalStatus
    {
        Pending = 0,    // Pendiente - esperando respuesta del cliente
        Accepted = 1,   // Aceptada - el cliente aprobó la propuesta
        Rejected = 2,   // Rechazada - el cliente rechazó la propuesta
        Withdrawn = 3   // Retirada - el freelancer retiró su propuesta
    }

    // Modelo que representa una propuesta/oferta hecha por un desarrollador sobre un servicio
    // Incluye precio propuesto en bolivianos, horas estimadas y cálculos de comisión
    public class Proposal
    {
        public int Id { get; set; }
        public int ServiceId { get; set; }              // ID del servicio al que se hace la propuesta
        public int FreelancerId { get; set; }           // ID del desarrollador que envía la propuesta
        public int ClientId { get; set; }               // ID del cliente que recibirá la propuesta
        public decimal ProposedPrice { get; set; }      // Precio propuesto en bolivianos (Bs)
        public int EstimatedHours { get; set; }         // Horas estimadas para completar el trabajo
        public ProposalStatus Status { get; set; } = ProposalStatus.Pending; // Estado actual de la propuesta
        public string Message { get; set; } = string.Empty;   // Mensaje descriptivo de la propuesta
        public decimal NetPayout { get; set; }          // Pago neto al freelancer después de la comisión (en Bs)
        public decimal PlatformFee { get; set; }        // Comisión de la plataforma (en Bs)
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Fecha de creación de la propuesta
    }
}
