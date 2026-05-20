namespace FreelanceMarketplace.API.Models
{
    // Modelo que representa un servicio/trabajo publicado por un desarrollador freelancer
    // Ejemplo: "Desarrollo de aplicación web en React", "API REST con .NET"
    public class FreelanceService
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;          // Título del servicio ofrecido
        public string Description { get; set; } = string.Empty;    // Descripción detallada del servicio
        public decimal BasePrice { get; set; }                     // Precio base en bolivianos (Bs)
        public string Category { get; set; } = string.Empty;       // Categoría del servicio (ej: Desarrollo, Diseño)
        public int FreelancerId { get; set; }                      // ID del desarrollador que ofrece el servicio
    }
}
