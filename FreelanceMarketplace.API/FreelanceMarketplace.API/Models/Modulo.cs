namespace FreelanceMarketplace.API.Models
{
    // Modelo que representa un módulo funcional dentro de un sistema ofrecido
    // Ejemplo: "Gestión de Usuarios", "Gestión de Inventario", "Reportes"
    public class Modulo
    {
        public int Id { get; set; }
        public int ServiceId { get; set; }                          // ID del servicio al que pertenece
        public string Nombre { get; set; } = string.Empty;         // Nombre del módulo (ej: Gestión de Inventario)
        public string Descripcion { get; set; } = string.Empty;    // Qué hace este módulo
        public decimal Precio { get; set; }                        // Precio individual en bolivianos (Bs)
    }
}
