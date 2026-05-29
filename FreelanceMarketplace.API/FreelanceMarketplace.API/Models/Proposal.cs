using System;
using System.Collections.Generic;

namespace FreelanceMarketplace.API.Models
{
    public enum ProposalStatus
    {
        Pending = 0,    // Pendiente - esperando respuesta del desarrollador
        Accepted = 1,   // Aceptada - el desarrollador aprobó la propuesta
        Rejected = 2,   // Rechazada - el desarrollador rechazó la propuesta
        Withdrawn = 3   // Retirada - el cliente retiró su propuesta
    }

    public class Proposal
    {
        public int Id { get; set; }
        public int ServiceId { get; set; }              // ID del servicio/sistema solicitado
        public int FreelancerId { get; set; }           // ID del desarrollador (asignado automáticamente)
        public int ClientId { get; set; }               // ID del cliente que envía la propuesta
        public decimal ProposedPrice { get; set; }      // Precio propuesto por el cliente en Bs
        public int EstimatedHours { get; set; }         // Horas estimadas (valor interno, no mostrado al usuario)
        public ProposalStatus Status { get; set; } = ProposalStatus.Pending;
        public string Message { get; set; } = string.Empty;   // Mensaje o requerimientos del cliente
        public decimal NetPayout { get; set; }          // Pago neto al desarrollador (después de comisión)
        public decimal PlatformFee { get; set; }        // Comisión de la plataforma FreelancRued en Bs
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ====== NUEVOS CAMPOS PARA MÓDULOS ======
        // true = el cliente quiere el sistema completo
        // false = el cliente seleccionó módulos individuales
        public bool EsSistemaCompleto { get; set; } = true;

        // IDs de los módulos seleccionados cuando EsSistemaCompleto = false
        // Se almacena como texto separado por comas en la BD
        public string ModulosSeleccionadosIds { get; set; } = string.Empty;

        // Nombre de los módulos seleccionados (para mostrar en el frontend)
        public string ModulosSeleccionadosNombres { get; set; } = string.Empty;
    }
}
