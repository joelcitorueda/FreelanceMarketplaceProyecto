namespace FreelanceMarketplace.API.Models
{
    // Modelo de usuario que representa a los desarrolladores y clientes del marketplace
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;           // Nombre completo del usuario
        public string Email { get; set; } = string.Empty;          // Correo electrónico (se usa para iniciar sesión)
        public string Password { get; set; } = string.Empty;      // Contraseña del usuario
        public string Role { get; set; } = "Freelancer";           // Rol: "Freelancer" (desarrollador) o "Client" (cliente)
        public double Rating { get; set; } = 5.0;                  // Calificación promedio del usuario
        public bool IsActive { get; set; } = true;                 // Indica si la cuenta está activa
        public bool ProfileCompleted { get; set; } = true;         // Indica si el perfil está completo
    }
}
