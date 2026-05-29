using System.Collections.Generic;

namespace FreelanceMarketplace.API.Models
{
    // Modelo que representa un servicio/sistema publicado por un desarrollador freelancer
    // Ahora incluye una lista de módulos que el cliente puede adquirir individualmente
    public class FreelanceService
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;          // Título del sistema ofrecido
        public string Description { get; set; } = string.Empty;    // Descripción detallada del sistema
        public decimal BasePrice { get; set; }                     // Precio base del sistema COMPLETO en bolivianos (Bs)
        public string Category { get; set; } = string.Empty;       // Categoría (ej: Sistema Web, ERP, App Móvil)
        public int FreelancerId { get; set; }                      // ID del desarrollador que ofrece el sistema

        // Lista de módulos que componen este sistema (puede estar vacía)
        // No se mapea a columna propia — se carga desde la tabla Modulos
        public List<Modulo> Modulos { get; set; } = new();
    }
}
